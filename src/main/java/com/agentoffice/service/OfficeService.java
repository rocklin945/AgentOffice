package com.agentoffice.service;

import com.agentoffice.dto.OfficeLayoutResponse;
import com.agentoffice.dto.CollaborationChatRequest;
import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.agent.AgentDefinition;
import com.agentoffice.agent.AgentRunner;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.ChatMessage;
import com.agentoffice.entity.ChatSession;
import com.agentoffice.entity.OfficeDesk;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.entity.WorkProduct;
import com.agentoffice.llm.LlmMessage;
import com.agentoffice.llm.LlmRequest;
import com.agentoffice.llm.LlmResponse;
import com.agentoffice.llm.LlmService;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.ChatMessageMapper;
import com.agentoffice.mapper.ChatSessionMapper;
import com.agentoffice.mapper.OfficeDeskMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import com.agentoffice.mapper.WorkProductMapper;
import com.agentoffice.tools.ToolExecutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class OfficeService {

    @Autowired
    private OfficeDeskMapper deskMapper;

    @Autowired
    private AgentEmployeeMapper employeeMapper;

    @Autowired
    private TaskInfoMapper taskMapper;

    @Autowired
    private WorkProductMapper workProductMapper;

    @Autowired
    private AgentRunner agentRunner;

    @Autowired
    private ChatSessionMapper chatSessionMapper;

    @Autowired
    private ChatMessageMapper chatMessageMapper;

    @Autowired
    private LlmService llmService;

    public OfficeLayoutResponse getLayout() {
        List<OfficeDesk> desks = deskMapper.findAll();
        List<AgentEmployee> employees = employeeMapper.findAll();

        Map<Long, AgentEmployee> employeeMap = employees.stream()
                .filter(e -> e.getDeskId() != null)
                .collect(Collectors.toMap(AgentEmployee::getDeskId, e -> e));

        Integer maxRow = desks.stream()
                .mapToInt(OfficeDesk::getRowNum)
                .max()
                .orElse(0);

        Integer maxCol = desks.stream()
                .mapToInt(Desk -> Desk.getColNum())
                .max()
                .orElse(0);

        OfficeLayoutResponse response = new OfficeLayoutResponse();
        response.setRows(maxRow);
        response.setCols(maxCol);

        List<OfficeLayoutResponse.DeskInfo> deskInfoList = new ArrayList<>();
        for (OfficeDesk desk : desks) {
            OfficeLayoutResponse.DeskInfo deskInfo = new OfficeLayoutResponse.DeskInfo();
            deskInfo.setId(desk.getId());
            deskInfo.setDeskCode(desk.getDeskCode());
            deskInfo.setRowNum(desk.getRowNum());
            deskInfo.setColNum(desk.getColNum());
            deskInfo.setStatus(desk.getStatus());

            AgentEmployee employee = employeeMap.get(desk.getId());
            if (employee != null) {
                OfficeLayoutResponse.EmployeeInfo employeeInfo = new OfficeLayoutResponse.EmployeeInfo();
                employeeInfo.setId(employee.getId());
                employeeInfo.setName(employee.getName());
                employeeInfo.setAvatar(employee.getAvatar());
                employeeInfo.setRole(employee.getRole());
                employeeInfo.setPosition(employee.getPosition());
                employeeInfo.setStatus(employee.getStatus());
                deskInfo.setEmployee(employeeInfo);
            }

            deskInfoList.add(deskInfo);
        }

        response.setDesks(deskInfoList);
        return response;
    }

    public Map<String, Integer> getStatusOverview() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        return employees.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getStatus() != null ? e.getStatus() : "空闲",
                        Collectors.reducing(0, e -> 1, Integer::sum)
                ));
    }

    @Transactional
    public OfficeDesk createDesk() {
        Integer maxRow = deskMapper.findMaxRow();
        int row = maxRow == null || maxRow <= 0 ? 1 : maxRow;
        Integer maxCol = deskMapper.findMaxCol(row);
        int col = maxCol == null ? 1 : maxCol + 1;

        if (col > 4) {
            row += 1;
            col = 1;
        }

        OfficeDesk desk = new OfficeDesk();
        desk.setDeskCode(rowCode(row) + col);
        desk.setRowNum(row);
        desk.setColNum(col);
        desk.setStatus(0);
        deskMapper.insert(desk);
        return desk;
    }

    @Transactional
    public void assignDesk(Long deskId, Long employeeId) {
        OfficeDesk desk = deskMapper.findById(deskId);
        if (desk == null) {
            throw new BusinessException(404, "工位不存在");
        }

        if (desk.getEmployeeId() != null) {
            employeeMapper.updateDeskId(desk.getEmployeeId(), null);
        }

        if (employeeId == null) {
            deskMapper.updateEmployee(deskId, null, 0);
            return;
        }

        AgentEmployee employee = employeeMapper.findById(employeeId);
        if (employee == null) {
            throw new BusinessException(404, "员工不存在");
        }

        OfficeDesk oldDesk = deskMapper.findByEmployeeId(employeeId);
        if (oldDesk != null && !oldDesk.getId().equals(deskId)) {
            deskMapper.updateEmployee(oldDesk.getId(), null, 0);
        }

        deskMapper.updateEmployee(deskId, employeeId, 1);
        employeeMapper.updateDeskId(employeeId, deskId);
    }

    private String rowCode(int row) {
        StringBuilder code = new StringBuilder();
        int value = row;
        while (value > 0) {
            value--;
            code.insert(0, (char) ('A' + (value % 26)));
            value /= 26;
        }
        return code.toString();
    }

    public Map<String, Object> getCollaboration() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        List<TaskInfo> tasks = taskMapper.findList(null, null, null);
        List<Map<String, Object>> staff = new ArrayList<>();

        for (int i = 0; i < employees.size(); i++) {
            AgentEmployee employee = employees.get(i);
            Map<String, Object> item = new HashMap<>();
            String id = employee.getName() == null ? "emp" + employee.getId() : employee.getName().toLowerCase();
            String displayStatus = collaborationStatus(employee);
            item.put("id", id);
            item.put("employeeId", employee.getId());
            item.put("name", employee.getName());
            item.put("title", employee.getRole());
            item.put("badge", displayStatus);
            item.put("badgeColor", statusColor(displayStatus));
            item.put("employeeNo", "EMP" + String.format("%04d", employee.getId()));
            item.put("duty", employee.getPosition() != null ? employee.getPosition() : roleDuty(employee.getRole()));
            item.put("skills", roleSkills(employee.getRole()));
            item.put("task", employee.getTaskCount() != null && employee.getTaskCount() > 0 ? "处理当前分配任务" : "暂无进行中任务");
            item.put("progress", employee.getEfficiency() == null ? 0 : employee.getEfficiency().intValue());
            item.put("nextEmployee", null);
            item.put("workingTime", taskMapper.findList(null, null, employee.getId()).size() + "项任务");
            item.put("commits", countProducts(employee.getId(), "代码") + "个代码产物");
            item.put("testPass", countProducts(employee.getId(), "测试") + "个测试产物");
            item.put("deployCount", countProducts(employee.getId(), "部署") + "个部署产物");
            item.put("avatar", employee.getAvatar());
            item.put("workProducts", workProducts(employee.getId()));
            staff.add(item);
        }

        Map<String, Integer> overview = getStatusOverview();
        int total = employees.size();
        int idle = overview.getOrDefault("空闲", 0) + overview.getOrDefault("在线", 0);
        int busy = Math.max(total - idle, 0);

        Map<String, Object> result = new HashMap<>();
        result.put("staffList", staff);
        result.put("messages", List.of());
        result.put("statCards", List.of(
                Map.of("label", "员工总数", "value", total + "人", "iconClass", "bg-[#edf4ff] text-[#2f6bff]"),
                Map.of("label", "在线员工", "value", total + "人", "iconClass", "bg-[#ebfbf1] text-[#2bb36b]"),
                Map.of("label", "忙碌中", "value", busy + "人", "iconClass", "bg-[#fff4ea] text-[#ff8a32]"),
                Map.of("label", "空闲中", "value", idle + "人", "iconClass", "bg-[#fff8e8] text-[#f4b53f]"),
                Map.of("label", "今日完成任务", "value", countTasks(tasks, "已完成") + "个", "iconClass", "bg-[#ebfbf1] text-[#2bb36b]")
        ));
        result.put("donutItems", overview.entrySet().stream()
                .map(entry -> Map.of("label", entry.getKey(), "value", entry.getValue(), "color", colorForStatus(entry.getKey())))
                .collect(Collectors.toList()));
        result.put("taskSummary", List.of(
                List.of("全部任务", String.valueOf(tasks.size())),
                List.of("进行中", String.valueOf(countTasks(tasks, "进行中"))),
                List.of("已完成", String.valueOf(countTasks(tasks, "已完成"))),
                List.of("已失败", String.valueOf(countTasks(tasks, "已失败")))
        ));
        return result;
    }

    public Map<String, Object> sendCollaborationMessage(CollaborationChatRequest request, Long userId) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new BusinessException(400, "消息内容不能为空");
        }
        if (request.getMentionedEmployeeIds() == null || request.getMentionedEmployeeIds().isEmpty()) {
            throw new BusinessException(400, "请先 @ 至少一名员工");
        }

        ChatSession session = resolveCollaborationSession(userId, request.getSessionId(), request.getMessage());
        saveChatMessage(session.getId(), "user", "我", null, request.getMessage());
        List<Map<String, Object>> replies = new ArrayList<>();
        for (Long employeeId : request.getMentionedEmployeeIds()) {
            AgentEmployee employee = employeeMapper.findById(employeeId);
            if (employee == null) {
                continue;
            }
            String replyText = workflowReply(employee, request.getMessage()).orElseGet(() -> {
                LlmResponse response = llmService.chatCompletion(LlmRequest.builder()
                        .messages(List.of(
                                LlmMessage.builder()
                                        .role("system")
                                        .content(agentSystemPrompt(employee))
                                        .build(),
                                LlmMessage.builder()
                                        .role("user")
                                        .content(request.getMessage())
                                        .build()
                        ))
                        .temperature(0.6)
                        .maxTokens(600)
                        .build());
                return cleanLlmReply(response.getContent());
            });

            Map<String, Object> reply = new HashMap<>();
            reply.put("employeeId", employee.getId());
            reply.put("sender", employee.getName());
            reply.put("text", replyText);
            replies.add(reply);
            saveChatMessage(session.getId(), "assistant", employee.getName(), employee.getId(), replyText);
        }

        return Map.of("session", sessionMap(session), "replies", replies);
    }

    public SseEmitter streamCollaborationMessage(CollaborationChatRequest request, Long userId) {
        validateCollaborationChat(request);
        SseEmitter emitter = new SseEmitter(120000L);
        ChatSession session = resolveCollaborationSession(userId, request.getSessionId(), request.getMessage());
        saveChatMessage(session.getId(), "user", "我", null, request.getMessage());

        CompletableFuture.runAsync(() -> {
            try {
                sendEvent(emitter, "session", sessionMap(session));
                List<ReplyHandoff> currentRound = runReplyRound(
                        emitter,
                        request.getMentionedEmployeeIds(),
                        request.getMessage(),
                        session.getId(),
                        "reply"
                );
                List<Long> visitedEmployeeIds = new ArrayList<>(request.getMentionedEmployeeIds());
                for (int round = 0; round < 4; round++) {
                    List<NextHandoff> nextRound = collectNextHandoffs(currentRound, visitedEmployeeIds, session.getId(), emitter);
                    if (nextRound.isEmpty()) {
                        break;
                    }
                    nextRound.forEach(next -> visitedEmployeeIds.add(next.employeeId()));
                    currentRound = runReplyRound(
                            emitter,
                            nextRound.stream().map(NextHandoff::employeeId).toList(),
                            nextRound.stream()
                                    .map(next -> next.message())
                                    .collect(Collectors.joining("\n\n")),
                            session.getId(),
                            "handoff_reply"
                    );
                }
                sendEvent(emitter, "complete", Map.of("ok", true));
                emitter.complete();
            } catch (Exception e) {
                try {
                    sendEvent(emitter, "error", Map.of("message", e.getMessage() == null ? "回复失败" : e.getMessage()));
                } catch (Exception ignored) {
                }
                emitter.complete();
            }
        });

        return emitter;
    }

    private ReplyHandoff streamEmployeeReply(SseEmitter emitter, Long employeeId, String message, Long sessionDbId, String phase) {
        AgentEmployee employee = employeeMapper.findById(employeeId);
        if (employee == null) {
            return null;
        }
        try {
            String replyId = "reply_" + UUID.randomUUID().toString().substring(0, 8);
            Map<String, Object> start = new HashMap<>();
            start.put("replyId", replyId);
            start.put("employeeId", employee.getId());
            start.put("sender", employee.getName());
            start.put("phase", phase);
            sendEvent(emitter, "reply_start", start);

            String content = workflowReply(employee, message).orElseGet(() -> {
                LlmResponse response = llmService.chatCompletion(LlmRequest.builder()
                        .messages(List.of(
                                LlmMessage.builder()
                                        .role("system")
                                        .content(agentSystemPrompt(employee))
                                        .build(),
                                LlmMessage.builder()
                                        .role("user")
                                        .content(message)
                                        .build()
                        ))
                        .temperature(0.6)
                        .maxTokens(600)
                        .build());
                return cleanLlmReply(response.getContent());
            });
            StringBuilder savedContent = new StringBuilder();
            for (String chunk : splitReply(content)) {
                savedContent.append(chunk);
                Map<String, Object> delta = new HashMap<>();
                delta.put("replyId", replyId);
                delta.put("employeeId", employee.getId());
                delta.put("delta", chunk);
                sendEvent(emitter, "reply_delta", delta);
                Thread.sleep(20L);
            }

            sendEvent(emitter, "reply_done", Map.of("replyId", replyId, "employeeId", employee.getId()));
            saveChatMessage(sessionDbId, "assistant", employee.getName(), employee.getId(), savedContent.toString());
            return new ReplyHandoff(employee.getId(), employee.getName(), savedContent.toString(), parseMentionedEmployeeIds(savedContent.toString(), employee.getId()));
        } catch (Exception e) {
            try {
                sendEvent(emitter, "reply_error", Map.of(
                        "employeeId", employee.getId(),
                        "message", e.getMessage() == null ? "回复失败" : e.getMessage()
                ));
            } catch (Exception ignored) {
            }
            return null;
        }
    }

    private List<ReplyHandoff> runReplyRound(SseEmitter emitter, List<Long> employeeIds, String message, Long sessionDbId, String phase) {
        List<CompletableFuture<ReplyHandoff>> replyTasks = employeeIds.stream()
                .distinct()
                .map(employeeId -> CompletableFuture.supplyAsync(() -> streamEmployeeReply(emitter, employeeId, message, sessionDbId, phase)))
                .toList();
        if (replyTasks.isEmpty()) {
            return List.of();
        }
        CompletableFuture.allOf(replyTasks.toArray(new CompletableFuture[0])).join();
        return replyTasks.stream()
                .map(CompletableFuture::join)
                .filter(handoff -> handoff != null)
                .toList();
    }

    private List<NextHandoff> collectNextHandoffs(List<ReplyHandoff> handoffs, List<Long> visitedEmployeeIds, Long sessionDbId, SseEmitter emitter) {
        List<NextHandoff> nextRound = new ArrayList<>();
        for (ReplyHandoff handoff : handoffs) {
            for (Long employeeId : handoff.mentionedEmployeeIds()) {
                if (visitedEmployeeIds.contains(employeeId) || nextRound.stream().anyMatch(next -> next.employeeId().equals(employeeId))) {
                    continue;
                }
                AgentEmployee targetEmployee = employeeMapper.findById(employeeId);
                String targetName = targetEmployee == null ? String.valueOf(employeeId) : targetEmployee.getName();
                String assignmentText = handoff.sender() + " 指派下一步给 @" + targetName;
                saveChatMessage(sessionDbId, "system", "System", null, assignmentText);
                sendEventQuietly(emitter, "handoff", Map.of(
                        "fromEmployeeId", handoff.employeeId(),
                        "fromSender", handoff.sender(),
                        "employeeId", employeeId,
                        "text", assignmentText,
                        "message", handoff.content()
                ));
                nextRound.add(new NextHandoff(
                        employeeId,
                        handoff.sender() + " 在回复中 @ 了你并指派下一步任务：\n" + handoff.content()
                ));
            }
        }
        return nextRound;
    }

    private Optional<String> workflowReply(AgentEmployee employee, String message) {
        String role = value(employee.getRole(), "");
        if (!isWorkflowMessage(message, role)) {
            return Optional.empty();
        }
        AgentDefinition agent = AgentDefinition.builder()
                .slug("employee_" + employee.getId())
                .displayName(employee.getName())
                .role(employee.getRole())
                .systemPrompt(workflowSystemPrompt(employee))
                .roomId(roomForRole(employee.getRole()))
                .phaserAgentId("emp_" + employee.getId())
                .toolsKey(ToolExecutor.WORKFLOW_TOOLS)
                .build();
        AgentRunner.AgentResult result = agentRunner.runAgent(agent, message, List.of());
        return Optional.of(result.content());
    }

    private String workflowSystemPrompt(AgentEmployee employee) {
        String role = value(employee.getRole(), "团队成员");
        String toolInstruction;
        if (role.contains("产品")) {
            toolInstruction = "你必须按顺序组合工具真实工作：1) 用 write_file 写 PRD Markdown 文件；2) 用 register_work_product 登记需求文档；3) 用 create_task 创建开发任务并分配给开发；4) 用 notify_user 发送 PRD 完成提醒。";
        } else if (role.contains("开发")) {
            toolInstruction = "你必须按顺序组合工具真实工作：1) 用 find_latest_work_product 查询最新需求文档；2) 用 read_file 读取该 PRD 文件；3) 用 write_file 写代码文件；4) 用 register_work_product 登记代码产物；5) 用 create_task 创建测试任务并分配给测试；6) 用 notify_user 发送开发完成提醒。";
        } else if (role.contains("测试")) {
            toolInstruction = "你必须按顺序组合工具真实工作：1) 用 find_latest_work_product 查询最新代码产物；2) 用 read_file 读取开发文件；3) 用 write_file 写测试报告；4) 用 register_work_product 登记测试报告；5) 用 create_task 创建部署任务并分配给运维；6) 用 notify_user 发送测试完成提醒。";
        } else if (role.contains("运维")) {
            toolInstruction = "你必须按顺序组合工具真实工作：1) 用 find_latest_work_product 查询最新测试报告；2) 用 read_file 读取测试报告文件；3) 用 create_deploy_service 在部署模块创建运行中服务；4) 用 write_file 写部署记录；5) 用 register_work_product 登记部署记录；6) 用 notify_user 发送部署完成提醒。";
        } else {
            toolInstruction = "你必须根据自己的职责选择一个可用工具完成任务，然后根据工具返回结果回复。";
        }
        return "你是 AgentOffice 团队中的 AI 员工。员工ID：" + employee.getId()
                + "，姓名：" + employee.getName()
                + "，角色：" + role
                + "，职位：" + value(employee.getPosition(), "-") + "。"
                + toolInstruction
                + "文件路径必须使用相对路径，例如 prd/xxx.md、code/xxx.java、test/xxx.md、deploy/xxx.md。"
                + "不要编造已完成结果；只有工具返回的数据才可以作为交付依据。"
                + "最终回复必须写明登记成功的工作产物名称和 filePath，方便下一位员工继续读取。"
                + "回复中如果有下一步员工，必须使用 @员工姓名。";
    }

    private String roomForRole(String role) {
        if (role == null) return "workspace";
        if (role.contains("产品")) return "manager";
        if (role.contains("开发")) return "dev";
        if (role.contains("测试")) return "test";
        if (role.contains("运维")) return "ops";
        return "workspace";
    }

    private boolean isWorkflowMessage(String message, String role) {
        String text = value(message, "");
        return text.contains("指派下一步")
                || text.contains("PRD")
                || text.contains("需求")
                || text.contains("开发")
                || text.contains("测试")
                || text.contains("部署")
                || role.contains("产品")
                || role.contains("开发")
                || role.contains("测试")
                || role.contains("运维");
    }

    private void validateCollaborationChat(CollaborationChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new BusinessException(400, "消息内容不能为空");
        }
        if (request.getMentionedEmployeeIds() == null || request.getMentionedEmployeeIds().isEmpty()) {
            throw new BusinessException(400, "请先 @ 至少一名员工");
        }
    }

    public Map<String, Object> getCollaborationSessions(Long userId) {
        List<Map<String, Object>> sessions = chatSessionMapper.findCollaborationByUser(userId).stream()
                .map(this::sessionMap)
                .toList();
        return Map.of("sessions", sessions);
    }

    public Map<String, Object> createCollaborationSession(Long userId, String title) {
        ChatSession session = new ChatSession();
        session.setSessionId("collab_" + UUID.randomUUID().toString().substring(0, 8));
        session.setUserId(userId);
        session.setSessionType("collaboration");
        session.setTitle(title == null || title.isBlank() ? "新会话" : title);
        chatSessionMapper.insert(session);
        return Map.of("session", sessionMap(session), "messages", List.of());
    }

    public Map<String, Object> getCollaborationMessages(Long userId, String sessionId) {
        ChatSession session = chatSessionMapper.findBySessionIdAndUser(sessionId, userId);
        if (session == null) {
            throw new BusinessException(404, "会话不存在");
        }
        List<Map<String, Object>> messages = chatMessageMapper.findBySessionId(session.getId()).stream()
                .map(this::messageMap)
                .toList();
        return Map.of("session", sessionMap(session), "messages", messages);
    }

    @Transactional
    public void deleteCollaborationSession(Long userId, String sessionId) {
        ChatSession session = chatSessionMapper.findBySessionIdAndUser(sessionId, userId);
        if (session == null) {
            throw new BusinessException(404, "会话不存在");
        }
        chatMessageMapper.deleteBySessionId(session.getId());
        chatSessionMapper.deleteById(session.getId());
    }

    private ChatSession resolveCollaborationSession(Long userId, String sessionId, String message) {
        ChatSession session = null;
        if (sessionId != null && !sessionId.isBlank()) {
            session = chatSessionMapper.findBySessionIdAndUser(sessionId, userId);
        }
        if (session == null) {
            session = new ChatSession();
            session.setSessionId("collab_" + UUID.randomUUID().toString().substring(0, 8));
            session.setUserId(userId);
            session.setSessionType("collaboration");
            session.setTitle(defaultSessionTitle(message));
            chatSessionMapper.insert(session);
        } else {
            if (session.getTitle() == null || "新会话".equals(session.getTitle())) {
                session.setTitle(defaultSessionTitle(message));
                chatSessionMapper.updateTitle(session);
            }
            chatSessionMapper.touch(session.getId());
        }
        return session;
    }

    private void saveChatMessage(Long sessionId, String role, String sender, Long employeeId, String content) {
        ChatMessage message = new ChatMessage();
        message.setSessionId(sessionId);
        message.setRole(role);
        message.setSender(sender);
        message.setEmployeeId(employeeId);
        message.setContent(content);
        chatMessageMapper.insert(message);
    }

    private Map<String, Object> sessionMap(ChatSession session) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", session.getSessionId());
        item.put("title", session.getTitle() == null ? "新会话" : session.getTitle());
        item.put("updatedAt", session.getUpdateTime() == null ? "" : session.getUpdateTime().toString().replace('T', ' ').substring(0, 16));
        return item;
    }

    private Map<String, Object> messageMap(ChatMessage message) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", message.getId());
        item.put("sender", message.getSender());
        item.put("employeeId", message.getEmployeeId());
        item.put("text", message.getContent());
        item.put("time", message.getCreateTime() == null ? "" : message.getCreateTime().toLocalTime().toString().substring(0, 5));
        item.put("fromUser", "user".equals(message.getRole()));
        item.put("system", "system".equals(message.getRole()));
        item.put("avatar", "user".equals(message.getRole()) ? "#2f6bff" : null);
        return item;
    }

    private String defaultSessionTitle(String message) {
        String text = message == null ? "新会话" : message.replaceAll("@\\S+", "").trim();
        if (text.isBlank()) {
            text = "新会话";
        }
        return text.length() > 18 ? text.substring(0, 18) + "..." : text;
    }

    private synchronized void sendEvent(SseEmitter emitter, String name, Object data) throws IOException {
        emitter.send(SseEmitter.event().name(name).data(data));
    }

    private void sendEventQuietly(SseEmitter emitter, String name, Object data) {
        try {
            sendEvent(emitter, name, data);
        } catch (Exception ignored) {
        }
    }

    private List<Long> parseMentionedEmployeeIds(String content, Long senderEmployeeId) {
        if (content == null || content.isBlank()) {
            return List.of();
        }
        return employeeMapper.findAll().stream()
                .filter(employee -> employee.getId() != null && !employee.getId().equals(senderEmployeeId))
                .filter(employee -> employee.getName() != null && content.contains("@" + employee.getName()))
                .map(AgentEmployee::getId)
                .distinct()
                .toList();
    }

    private List<String> splitReply(String content) {
        List<String> chunks = new ArrayList<>();
        if (content == null || content.isBlank()) {
            chunks.add("");
            return chunks;
        }
        int size = 4;
        for (int i = 0; i < content.length(); i += size) {
            chunks.add(content.substring(i, Math.min(i + size, content.length())));
        }
        return chunks;
    }

    private String cleanLlmReply(String content) {
        if (content == null) {
            return "";
        }
        return content.replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    private String agentSystemPrompt(AgentEmployee employee) {
        String teamRoster = employeeMapper.findAll().stream()
                .filter(item -> item.getId() != null && !item.getId().equals(employee.getId()))
                .map(item -> "@" + item.getName()
                        + "（" + (item.getRole() == null ? "成员" : item.getRole())
                        + "，" + (item.getPosition() == null ? roleDuty(item.getRole()) : item.getPosition()) + "）")
                .collect(Collectors.joining("；"));
        return "你是 AgentOffice 团队协作群聊中的数字员工。"
                + "你的姓名是 " + employee.getName() + "，角色是 " + employee.getRole() + "，职责是 " + roleDuty(employee.getRole()) + "。"
                + "当前状态是 " + employee.getStatus() + "，职位是 " + (employee.getPosition() == null ? "-" : employee.getPosition()) + "。"
                + "只有当用户明确 @ 你时你才会收到消息；现在这条消息已经 @ 到你。"
                + "当前可指派的其他员工名单是：" + (teamRoster.isBlank() ? "暂无其他员工" : teamRoster) + "。"
                + "请用第一人称、中文、简洁地回复，并给出你会如何执行或推进。"
                + "如果下一步需要其他员工接力，只能从上述名单中选择，并在回复中使用完整的 @员工姓名 明确指派；不要编造名单外员工，也不要替其他员工发言。";
    }

    private List<Map<String, Object>> workProducts(Long employeeId) {
        return workProductMapper.findByEmployeeId(employeeId).stream()
                .map(product -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", product.getId());
                    item.put("name", product.getName());
                    item.put("type", product.getProductType());
                    item.put("taskName", product.getTaskName() == null ? "-" : product.getTaskName());
                    item.put("time", product.getUpdateTime() == null ? "-" : product.getUpdateTime().toString().replace('T', ' '));
                    item.put("status", product.getStatus());
                    item.put("fileUrl", product.getFileUrl() == null ? "" : product.getFileUrl());
                    item.put("content", product.getContent() == null ? "" : product.getContent());
                    return item;
                })
                .collect(Collectors.toList());
    }

    private int countTasks(List<TaskInfo> tasks, String status) {
        return (int) tasks.stream().filter(task -> status.equals(task.getStatus())).count();
    }

    private int countProducts(Long employeeId, String typeKeyword) {
        return (int) workProductMapper.findByEmployeeId(employeeId).stream()
                .filter(product -> value(product.getProductType(), "").contains(typeKeyword))
                .count();
    }

    private String statusColor(String status) {
        if ("工作中".equals(status) || "编码中".equals(status)) return "green";
        if ("测试中".equals(status)) return "blue";
        if ("部署中".equals(status)) return "purple";
        if ("思考中".equals(status)) return "orange";
        return "gray";
    }

    private String collaborationStatus(AgentEmployee employee) {
        String status = employee.getStatus();
        String role = employee.getRole();
        if ("工作中".equals(status) && role != null && role.contains("开发")) return "编码中";
        if ("工作中".equals(status) && role != null && role.contains("测试")) return "测试中";
        return status;
    }

    private String colorForStatus(String status) {
        if ("工作中".equals(status) || "编码中".equals(status)) return "#2f6bff";
        if ("思考中".equals(status)) return "#8b5cf6";
        if ("测试中".equals(status)) return "#2bb36b";
        if ("部署中".equals(status)) return "#ff8a32";
        return "#b8becb";
    }

    private String roleDuty(String role) {
        if (role == null) return "负责团队协作任务";
        if (role.contains("产品")) return "负责需求分析、原型设计、跨团队沟通与任务拆解";
        if (role.contains("测试")) return "负责自动化测试、回归验证、用例编排和质量报告输出";
        if (role.contains("运维")) return "负责环境部署、容器编排、监控告警与日志巡检";
        return "负责接口开发、业务逻辑实现、性能优化等工作";
    }

    private List<String> roleSkills(String role) {
        if (role == null) return List.of("协作");
        if (role.contains("产品")) return List.of("PRD", "Figma", "Roadmap");
        if (role.contains("测试")) return List.of("Playwright", "Jest", "API Test");
        if (role.contains("运维")) return List.of("K8s", "Nginx", "Linux");
        return List.of("Java", "Spring Boot", "MySQL", "Docker");
    }

    private String value(String text, String fallback) {
        return text == null || text.isBlank() ? fallback : text;
    }

    private record ReplyHandoff(Long employeeId, String sender, String content, List<Long> mentionedEmployeeIds) {
    }

    private record NextHandoff(Long employeeId, String message) {
    }
}

