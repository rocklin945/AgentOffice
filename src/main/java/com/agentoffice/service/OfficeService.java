package com.agentoffice.service;

import com.agentoffice.dto.OfficeLayoutResponse;
import com.agentoffice.dto.CollaborationChatRequest;
import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.OfficeDesk;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.entity.WorkProduct;
import com.agentoffice.llm.LlmMessage;
import com.agentoffice.llm.LlmRequest;
import com.agentoffice.llm.LlmResponse;
import com.agentoffice.llm.LlmService;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.OfficeDeskMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import com.agentoffice.mapper.WorkProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    private String avatarColor(AgentEmployee employee) {
        String[] colors = {"#8b5cf6", "#2bb36b", "#2f6bff", "#ff8a32", "#14b8a6", "#f43f5e"};
        String source = String.valueOf(employee.getId()) + (employee.getName() == null ? "" : employee.getName());
        int seed = 0;
        for (int i = 0; i < source.length(); i++) {
            seed += source.charAt(i);
        }
        return colors[Math.floorMod(seed, colors.length)];
    }

    public Map<String, Object> getCollaboration() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        List<TaskInfo> tasks = taskMapper.findList(null, null, null);
        List<Map<String, Object>> staff = new ArrayList<>();
        String[] colors = {"#8b5cf6", "#2bb36b", "#2f6bff", "#ff8a32", "#94a0b8"};

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
            item.put("nextEmployee", i + 1 < employees.size() ? (employees.get(i + 1).getName() == null ? null : employees.get(i + 1).getName().toLowerCase()) : null);
            item.put("workingTime", "0分钟");
            item.put("commits", "0次");
            item.put("testPass", "0个");
            item.put("deployCount", "0次");
            item.put("avatar", employee.getAvatar());
            item.put("workProducts", workProducts(employee.getId()));
            item.put("color", colors[i % colors.length]);
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

    public Map<String, Object> sendCollaborationMessage(CollaborationChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new BusinessException(400, "消息内容不能为空");
        }
        if (request.getMentionedEmployeeIds() == null || request.getMentionedEmployeeIds().isEmpty()) {
            throw new BusinessException(400, "请先 @ 至少一名员工");
        }

        List<Map<String, Object>> replies = new ArrayList<>();
        for (Long employeeId : request.getMentionedEmployeeIds()) {
            AgentEmployee employee = employeeMapper.findById(employeeId);
            if (employee == null) {
                continue;
            }
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

            Map<String, Object> reply = new HashMap<>();
            reply.put("employeeId", employee.getId());
            reply.put("sender", employee.getName());
            reply.put("avatar", avatarColor(employee));
            reply.put("text", cleanLlmReply(response.getContent()));
            replies.add(reply);
        }

        return Map.of("replies", replies);
    }

    public SseEmitter streamCollaborationMessage(CollaborationChatRequest request) {
        validateCollaborationChat(request);
        SseEmitter emitter = new SseEmitter(120000L);

        CompletableFuture.runAsync(() -> {
            try {
                for (Long employeeId : request.getMentionedEmployeeIds()) {
                    AgentEmployee employee = employeeMapper.findById(employeeId);
                    if (employee == null) {
                        continue;
                    }

                    String replyId = "reply_" + UUID.randomUUID().toString().substring(0, 8);
                    Map<String, Object> start = new HashMap<>();
                    start.put("replyId", replyId);
                    start.put("employeeId", employee.getId());
                    start.put("sender", employee.getName());
                    start.put("avatar", avatarColor(employee));
                    sendEvent(emitter, "reply_start", start);

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

                    String content = cleanLlmReply(response.getContent());
                    for (String chunk : splitReply(content)) {
                        Map<String, Object> delta = new HashMap<>();
                        delta.put("replyId", replyId);
                        delta.put("employeeId", employee.getId());
                        delta.put("delta", chunk);
                        sendEvent(emitter, "reply_delta", delta);
                        Thread.sleep(20L);
                    }

                    sendEvent(emitter, "reply_done", Map.of("replyId", replyId, "employeeId", employee.getId()));
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

    private void validateCollaborationChat(CollaborationChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new BusinessException(400, "消息内容不能为空");
        }
        if (request.getMentionedEmployeeIds() == null || request.getMentionedEmployeeIds().isEmpty()) {
            throw new BusinessException(400, "请先 @ 至少一名员工");
        }
    }

    private void sendEvent(SseEmitter emitter, String name, Object data) throws IOException {
        emitter.send(SseEmitter.event().name(name).data(data));
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
        return "你是 AgentOffice 团队协作群聊中的数字员工。"
                + "你的姓名是 " + employee.getName() + "，角色是 " + employee.getRole() + "，职责是 " + roleDuty(employee.getRole()) + "。"
                + "当前状态是 " + employee.getStatus() + "，职位是 " + (employee.getPosition() == null ? "-" : employee.getPosition()) + "。"
                + "只有当用户明确 @ 你时你才会收到消息；现在这条消息已经 @ 到你。"
                + "请用第一人称、中文、简洁地回复，并给出你会如何执行或推进。不要替其他员工发言。";
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
                    return item;
                })
                .collect(Collectors.toList());
    }

    private int countTasks(List<TaskInfo> tasks, String status) {
        return (int) tasks.stream().filter(task -> status.equals(task.getStatus())).count();
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
}
