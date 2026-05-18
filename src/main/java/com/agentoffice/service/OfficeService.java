package com.agentoffice.service;



import com.agentoffice.dto.OfficeLayoutResponse;

import com.agentoffice.dto.CollaborationChatRequest;

import com.agentoffice.common.exception.BusinessException;

import com.agentoffice.agent.AgentDefinition;

import com.agentoffice.agent.AgentRunner;

import com.agentoffice.entity.AgentEmployee;

import com.agentoffice.entity.ChatMessage;

import com.agentoffice.entity.ChatSession;

import com.agentoffice.entity.TaskInfo;

import com.agentoffice.entity.WorkProduct;

import com.agentoffice.entity.ModelConfig;

import com.agentoffice.llm.LlmMessage;

import com.agentoffice.llm.LlmRequest;

import com.agentoffice.llm.LlmResponse;

import com.agentoffice.llm.LlmService;

import com.agentoffice.mapper.AgentEmployeeMapper;

import com.agentoffice.mapper.ChatMessageMapper;

import com.agentoffice.mapper.ChatSessionMapper;

import com.agentoffice.mapper.OperationLogMapper;

import com.agentoffice.mapper.TaskInfoMapper;

import com.agentoffice.mapper.WorkProductMapper;

import com.agentoffice.mapper.ModelConfigMapper;

import com.agentoffice.tools.ToolExecutor;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;



import java.io.IOException;

import java.nio.charset.StandardCharsets;

import java.nio.file.Files;

import java.nio.file.Path;

import java.nio.file.Paths;

import java.util.ArrayList;

import java.util.HashMap;

import java.util.List;

import java.util.Map;

import java.util.Optional;

import java.util.UUID;

import java.util.concurrent.CompletableFuture;

import java.util.LinkedHashMap;

import java.util.stream.Collectors;



@Service

public class OfficeService {



    @Autowired

    private AgentEmployeeMapper employeeMapper;



    @Autowired

    private TaskInfoMapper taskMapper;



    @Autowired

    private WorkProductMapper workProductMapper;



    @Autowired

    private AgentRunner agentRunner;



    @Autowired

    private ModelConfigMapper modelConfigMapper;



    @Autowired

    private ChatSessionMapper chatSessionMapper;



    @Autowired

    private ChatMessageMapper chatMessageMapper;



    @Autowired

    private OperationLogMapper operationLogMapper;



    @Autowired

    private LlmService llmService;



    public OfficeLayoutResponse getLayout() {
        OfficeLayoutResponse response = new OfficeLayoutResponse();
        response.setRows(0);
        response.setCols(0);
        response.setDesks(List.of());
        return response;
    }


    public Map<String, Integer> getStatusOverview() {
        return normalizedStatusOverview(employeeMapper.findAll());
    }



    public Map<String, Object> getCollaboration() {

        List<AgentEmployee> employees = employeeMapper.findAll();

        List<TaskInfo> tasks = taskMapper.findList(null, null, null);

        List<Map<String, Object>> staff = new ArrayList<>();



        for (int i = 0; i < employees.size(); i++) {

            AgentEmployee employee = employees.get(i);

            Map<String, Object> item = new HashMap<>();

            String id = employee.getName() == null ? "emp" + employee.getId() : employee.getName().toLowerCase();

            String displayStatus = normalizeStatus(collaborationStatus(employee));
            item.put("id", id);

            item.put("employeeId", employee.getId());

            item.put("name", employee.getName());

            item.put("title", employee.getRole());

            item.put("badge", displayStatus);

            item.put("badgeColor", statusColor(displayStatus));

            item.put("employeeNo", "EMP" + String.format("%04d", employee.getId()));

            item.put("duty", employee.getPosition() != null ? employee.getPosition() : roleDuty(employee.getRole()));

            item.put("skills", roleSkills(employee.getRole()));

            int assignedTaskCount = taskMapper.findList(null, null, employee.getId()).size();

            item.put("task", assignedTaskCount > 0 ? "处理当前分配任务" : "暂无进行中任务");

            item.put("nextEmployee", null);

            item.put("workingTime", assignedTaskCount + "项任务");

            item.put("commits", countProducts(employee.getId(), "代码") + "个代码产物");

            item.put("testPass", countProducts(employee.getId(), "Code Review") + "个Review产物");

            item.put("deployCount", countProducts(employee.getId(), "部署") + "个部署产物");

            item.put("avatar", employee.getAvatar());

            item.put("workProducts", workProducts(employee.getId()));

            staff.add(item);

        }



        Map<String, Integer> overview = normalizedStatusOverview(employees);
        int total = employees.size();
        int idle = overview.getOrDefault("空闲中", 0);
        int busy = overview.getOrDefault("工作中", 0);


        Map<String, Object> result = new HashMap<>();

        result.put("staffList", staff);

        result.put("messages", List.of());

        result.put("statCards", List.of(
                Map.of("label", "员工总数", "value", total + "人", "iconClass", "bg-[#edf4ff] text-[#2f6bff]"),
                Map.of("label", "工作中", "value", busy + "人", "iconClass", "bg-[#ebfbf1] text-[#2bb36b]"),
                Map.of("label", "空闲中", "value", idle + "人", "iconClass", "bg-[#fff8e8] text-[#f4b53f]"),
                Map.of("label", "今日完成任务", "value", countTasks(tasks, "已完成") + "个", "iconClass", "bg-[#ebfbf1] text-[#2bb36b]")
        ));
        result.put("donutItems", overview.entrySet().stream()

                .map(entry -> Map.of("label", entry.getKey(), "value", entry.getValue(), "color", colorForStatus(entry.getKey())))

                .collect(Collectors.toList()));

        

        // 获取最近的操作日志

        List<Map<String, Object>> operationLogs = operationLogMapper.findRecent(20).stream()

                .map(log -> {

                    Map<String, Object> logMap = new HashMap<>();

                    logMap.put("id", log.getId());

                    logMap.put("action", log.getAction());

                    logMap.put("targetType", log.getTargetType());

                    logMap.put("targetId", log.getTargetId());

                    logMap.put("detail", log.getDetail());

                    if (log.getCreateTime() != null) {

                        String timeStr = log.getCreateTime().toString().replace('T', ' ');

                        logMap.put("time", timeStr.length() >= 19 ? timeStr.substring(0, 19) : timeStr);

                    } else {

                        logMap.put("time", "");

                    }

                    return logMap;

                })

                .collect(Collectors.toList());

        result.put("operationLogs", operationLogs);

        

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

            // 更新员工状态为工作中

            employeeMapper.updateStatus(employeeId, "工作中");

            

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

            

            // 完成后恢复为空闲状态

            employeeMapper.updateStatus(employeeId, "空闲");

        }



        return Map.of("session", sessionMap(session), "replies", replies);

    }



    public SseEmitter streamCollaborationMessage(CollaborationChatRequest request, Long userId) {

        validateCollaborationChat(request);

        SseEmitter emitter = new SseEmitter(0L);

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

                for (int round = 0; round < 10; round++) {

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



    public Map<String, Object> getLatestCodeReviewReport(Long taskId) {

        WorkProduct product = taskId == null

                ? workProductMapper.findLatestByType("Code Review报告")

                : workProductMapper.findLatestByTypeAndTaskId("Code Review报告", taskId);

        return codeReviewReportMap(product);

    }



    private Map<String, Object> codeReviewReportMap(WorkProduct product) {

        Map<String, Object> result = new HashMap<>();

        if (product == null) {

            result.put("found", false);

            result.put("title", "暂无 Review 报告");

            result.put("content", "");

            result.put("verdict", "未开始");

            result.put("reviewedAt", "-");

            result.put("filePath", "");

            return result;

        }

        String content = value(product.getContent(), "");

        if (content.isBlank() && product.getFileUrl() != null) {

            Path path = Paths.get(System.getProperty("user.dir"), "workspace_artifacts", product.getFileUrl());

            try {

                content = Files.readString(path, StandardCharsets.UTF_8);

            } catch (Exception ignored) {}

        }

        String verdict = "需修改";

        if (content.contains("通过") || content.contains("PASS")) verdict = "通过";

        if (content.contains("阻塞") || content.contains("BLOCK")) verdict = "阻塞";

        result.put("found", true);

        result.put("title", value(product.getName(), "Code Review 报告"));

        result.put("content", content);

        result.put("verdict", verdict);

        result.put("reviewedAt", product.getUpdateTime() == null ? "-" : product.getUpdateTime().toString());

        result.put("filePath", value(product.getFileUrl(), ""));

        return result;

    }



    public Map<String, Object> rerunCodeReview(Long taskId) {

        AgentEmployee reviewer = employeeMapper.findAll().stream()

                .filter(employee -> isReviewerRole(employee.getRole()))

                .findFirst()

                .orElseThrow(() -> new BusinessException(404, "未找到 CodeReviewer 员工"));

        TaskInfo task = taskId == null ? null : taskMapper.findById(taskId);

        String target = task == null ? "当前最新代码产物" : "任务「" + value(task.getTaskName(), "-") + "」";

        String reply = workflowReply(reviewer, "请重新执行一次 Code Review，审查" + target + "，读取最新代码文件，生成新的 Code Review 报告并登记工作产物。完成后 @调度员 汇报报告 filePath。")

                .orElse("");

        WorkProduct latestProduct = taskId == null

                ? workProductMapper.findLatestByType("Code Review报告")

                : workProductMapper.findLatestByTypeAndTaskId("Code Review报告", taskId);

        Map<String, Object> result = new HashMap<>(codeReviewReportMap(latestProduct));

        result.put("reply", reply);

        result.put("reviewerId", reviewer.getId());

        result.put("reviewerName", reviewer.getName());

        return result;

    }



    private ReplyHandoff streamEmployeeReply(SseEmitter emitter, Long employeeId, String message, Long sessionDbId, String phase) {

        AgentEmployee employee = employeeMapper.findById(employeeId);

        if (employee == null) {

            return null;

        }

        try {

            // 更新员工状态为工作中

            employeeMapper.updateStatus(employeeId, "工作中");

            

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

            

            // 完成后恢复为空闲状态

            employeeMapper.updateStatus(employeeId, "空闲");

            

            return new ReplyHandoff(employee.getId(), employee.getName(), savedContent.toString(), parseMentionedEmployeeIds(savedContent.toString(), employee.getId()));

        } catch (Exception e) {

            try {

                // 出错时也恢复为空闲状态

                employeeMapper.updateStatus(employeeId, "空闲");

                

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

                AgentEmployee mentioned = employeeMapper.findById(employeeId);

                boolean dispatcher = mentioned != null && isDispatcherRole(mentioned.getRole());

                if ((!dispatcher && visitedEmployeeIds.contains(employeeId))

                        || nextRound.stream().anyMatch(next -> next.employeeId().equals(employeeId))) {

                    continue;

                }

                AgentEmployee targetEmployee = employeeMapper.findById(employeeId);

                String targetName = targetEmployee == null ? String.valueOf(employeeId) : targetEmployee.getName();

                String assignmentText = handoff.sender() + " 指派下一步给 @" + targetName;

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

        ModelConfig modelConfig = resolveEmployeeModel(employee);

        AgentDefinition agent = AgentDefinition.builder()

                .slug("employee_" + employee.getId())

                .displayName(employee.getName())

                .role(employee.getRole())

                .systemPrompt(workflowSystemPrompt(employee))

                .roomId(roomForRole(employee.getRole()))

                .phaserAgentId("emp_" + employee.getId())

                .modelConfigId(modelConfig == null ? null : modelConfig.getId())

                .modelName(modelConfig == null ? null : modelConfig.getModelName())

                .apiBase(modelConfig == null ? null : modelConfig.getApiBase())

                .apiKey(modelConfig == null ? null : modelConfig.getApiKey())

                .toolsKey(ToolExecutor.WORKFLOW_TOOLS)

                .build();

        AgentRunner.AgentResult result = agentRunner.runAgent(agent, message, List.of());

        return Optional.of(result.content());

    }



    private ModelConfig resolveEmployeeModel(AgentEmployee employee) {

        if (employee.getModelConfigId() != null) {

            ModelConfig assigned = modelConfigMapper.findById(employee.getModelConfigId());

            if (assigned != null && (assigned.getEnabled() == null || assigned.getEnabled() == 1)) {

                return assigned;

            }

        }

        return modelConfigMapper.findDefault();

    }



    private String workflowSystemPrompt(AgentEmployee employee) {

        String role = value(employee.getRole(), "团队成员");

        String dispatcherName = findEmployeeNameByRole("调度员", "Dispatcher");

        String frontendName = findEmployeeNameByRole("前端", "前端开发工程师");

        String backendName = findEmployeeNameByRole("后端", "后端开发工程师");

        String reviewerName = findReviewerName();

        String opsName = findEmployeeNameByRole("运维", "运维工程师");

        String teamRoster = buildWorkflowTeamRoster(employee);

        String toolInstruction;

        if (isDispatcherRole(role)) {

            toolInstruction = ("""

                你是工作流的中央调度员，不亲自产出 PRD/代码/报告/部署记录，只负责根据上游员工的汇报，把任务分发给下一阶段的员工。



                判断当前所处阶段并按对应规则处理（必须严格按规则）：

                A. 收到「需求文档(PRD) 已完成」的汇报：

                   1) 用 create_task 工具创建后端开发任务，task_type="development"，executor_role="后端开发工程师"

                   2) 用 create_task 工具创建前端开发任务，task_type="development"，executor_role="前端开发工程师"

                   3) 在最终回复中**同时** @%FRONTEND% 和 @%BACKEND%，把 PRD 的 filePath 转告给他们，要求他们读取 PRD 后开始开发

                B. 收到「代码已完成」的汇报（可能来自前端、后端，或两者同时）：

                   1) 用 create_task 工具创建 Code Review 任务，task_type="review"，executor_role="CodeReviewer"

                   2) 在最终回复中 @%REVIEWER%，把代码产物（前端 + 后端）的 filePath 一并转告，要求其完成 Code Review

                C. 收到「Code Review 报告已完成」的汇报：

                   1) 用 create_task 工具创建部署任务，task_type="deployment"，executor_role="运维工程师"

                   2) 在最终回复中 @%OPS%，把 Code Review 报告的 filePath 转告，要求其执行部署

                D. 收到「部署已完成」的汇报：

                   1) 用 notify_user 工具发送通知，category="task"，title="调度员完成工作流收尾"，content 写明本次交付总览

                   2) 在最终回复中给出整个流程的简要总结，**不要再 @ 任何员工**，工作流结束



                注意：你只负责调度，不要调用 write_file / read_file / register_work_product 等具体业务工具。

                """)

                .replace("%FRONTEND%", frontendName)

                .replace("%BACKEND%", backendName)

                .replace("%REVIEWER%", reviewerName)

                .replace("%OPS%", opsName);

        } else if (role.contains("产品")) {

            toolInstruction = ("""

                你是产品经理，按顺序执行以下步骤：



                步骤0：用 create_task 工具创建需求规划任务

                   - task_type 填"product"，task_name 填"需求规划：{项目名称}"，executor_role 填"产品经理"

                步骤1：从用户消息中提取项目名称（如"贪吃蛇"、"待办事项"等），转换为英文小写文件夹名（如 snake、todo-app）

                步骤2：用 create_work_product_in_progress 工具创建一个进行中的工作产物

                   - product_type 填"需求文档"，file_path 形如 prd/{项目文件夹名}/requirements.md

                步骤3：用 write_file 工具写 PRD Markdown 文件，路径必须是 prd/{项目文件夹名}/requirements.md

                步骤4：用 update_work_product_status 工具将工作产物状态更新为"已完成"

                步骤5：用 register_work_product 工具登记需求文档，product_type 填"需求文档"

                步骤6：用 notify_user 工具发送通知，category 填"task"，title 填"PRD 已完成"，content 填写项目名称和 PRD 文件路径



                **重要**：所有文件必须放在 prd/{项目文件夹名}/ 下，例如贪吃蛇项目就是 prd/snake/requirements.md

                完成后请在最终回复中 @%DISPATCHER% 汇报：「需求文档(PRD) 已完成，项目名称：{项目名称}」，并附上 PRD 的 filePath。**不要直接 @ 开发、CodeReviewer、运维等其他员工，只 @ 调度员。**

                """).replace("%DISPATCHER%", dispatcherName);

        } else if (role.contains("前端")) {

            toolInstruction = ("""

                你是前端开发工程师，专注于 HTML / CSS / JavaScript / Vue / React 等前端实现。按顺序执行：



                步骤0：用 find_latest_work_product 工具查询 product_type="需求文档" 获取 PRD filePath

                步骤1：用 read_file 工具读取上一步返回的 PRD 文件

                步骤2：从 PRD 文件路径中提取项目文件夹名（如 prd/snake/requirements.md 中的 snake）

                步骤3：用 create_work_product_in_progress 工具创建一个进行中的工作产物

                   - product_type 填"代码"，file_path 形如 code/{项目文件夹名}/frontend/index.html

                步骤4：用 write_file 工具写前端代码文件，路径必须是 code/{项目文件夹名}/frontend/xxx

                步骤5：用 update_work_product_status 工具更新为"已完成"

                步骤6：用 register_work_product 工具登记代码产物，product_type 填"代码"

                步骤7：用 notify_user 工具发送通知，category 填"task"，title 填"前端代码已完成"



                **重要**：所有代码文件必须放在 code/{项目文件夹名}/frontend/ 下，例如 code/snake/frontend/index.html

                完成后请在最终回复中 @%DISPATCHER% 汇报：「前端代码已完成」，并附上前端代码 filePath。**不要 @ 后端、CodeReviewer、运维等其他员工。**

                """).replace("%DISPATCHER%", dispatcherName);

        } else if (role.contains("后端")) {

            toolInstruction = ("""

                你是后端开发工程师，专注于 Java / Spring Boot / Python / Node.js 等后端实现。按顺序执行：



                步骤0：用 find_latest_work_product 工具查询 product_type="需求文档" 获取 PRD filePath

                步骤1：用 read_file 工具读取上一步返回的 PRD 文件

                步骤2：从 PRD 文件路径中提取项目文件夹名（如 prd/snake/requirements.md 中的 snake）

                步骤3：用 create_work_product_in_progress 工具创建一个进行中的工作产物

                   - product_type 填"代码"，file_path 形如 code/{项目文件夹名}/backend/Main.java

                步骤4：用 write_file 工具写后端代码文件，路径必须是 code/{项目文件夹名}/backend/xxx

                步骤5：用 update_work_product_status 工具更新为"已完成"

                步骤6：用 register_work_product 工具登记代码产物，product_type 填"代码"

                步骤7：用 notify_user 工具发送通知，category 填"task"，title 填"后端代码已完成"



                **重要**：所有代码文件必须放在 code/{项目文件夹名}/backend/ 下，例如 code/snake/backend/SnakeGame.java

                完成后请在最终回复中 @%DISPATCHER% 汇报：「后端代码已完成」，并附上后端代码 filePath。**不要 @ 前端、CodeReviewer、运维等其他员工。**

                """).replace("%DISPATCHER%", dispatcherName);

        } else if (role.contains("开发")) {

            toolInstruction = ("""

                你是开发工程师。按顺序执行：



                步骤0：用 create_work_product_in_progress 工具创建一个进行中的工作产物，product_type 填"代码"，file_path 形如 code/xxx

                步骤1：用 find_latest_work_product 工具查询 product_type="需求文档" 获取 PRD filePath

                步骤2：用 read_file 工具读取上一步返回的 PRD 文件

                步骤3：用 write_file 工具写代码文件

                步骤4：用 update_work_product_status 工具更新为"已完成"

                步骤5：用 register_work_product 工具登记代码产物，product_type 填"代码"

                步骤6：用 notify_user 工具发送 task 类型通知



                完成后请在最终回复中 @%DISPATCHER% 汇报：「代码已完成」，并附上代码 filePath。**只 @ 调度员，不要 @ 其他员工。**

                """).replace("%DISPATCHER%", dispatcherName);

        } else if (isReviewerRole(role)) {

            toolInstruction = ("""

                你是 Code Reviewer，负责审查前后端代码并产出 Code Review 报告。按顺序执行：



                步骤0：用 find_latest_work_product 工具查询 product_type="代码" 获取最新代码 filePath

                   - 如果存在前端 + 后端两份代码，可重复调用以拿到两份

                步骤1：用 read_file 工具读取代码文件

                步骤2：从代码文件路径中提取项目文件夹名（如 code/snake/frontend/index.html 中的 snake）

                步骤3：用 create_work_product_in_progress 工具创建一个进行中的工作产物

                   - product_type 填"Code Review报告"，file_path 形如 review/{项目文件夹名}/review_report.md

                步骤4：用 write_file 工具写 Code Review 报告，路径必须是 review/{项目文件夹名}/review_report.md

                步骤5：用 update_work_product_status 工具更新为"已完成"

                步骤6：用 register_work_product 工具登记 Code Review 报告，product_type 填"Code Review报告"

                步骤7：用 notify_user 工具发送通知，category 填"task"，title 填"Code Review 已完成"



                **重要**：所有 Review 报告必须放在 review/{项目文件夹名}/ 下，例如 review/snake/review_report.md

                完成后请在最终回复中 @%DISPATCHER% 汇报：「Code Review 报告已完成」，并附上报告 filePath。**只 @ 调度员，不要 @ 运维等其他员工。**

                """).replace("%DISPATCHER%", dispatcherName);

        } else if (role.contains("运维")) {

            toolInstruction = ("""

                你是运维工程师，负责执行最终部署。按顺序执行：



                步骤0：用 find_latest_work_product 工具查询 product_type="Code Review报告" 获取报告 filePath

                步骤1：用 read_file 工具读取上一步返回的 Code Review 报告文件

                步骤2：从 Review 报告文件路径中提取项目文件夹名（如 review/snake/review_report.md 中的 snake）

                步骤3：用 create_work_product_in_progress 工具创建一个进行中的工作产物

                   - product_type 填"部署记录"，file_path 形如 deploy/{项目文件夹名}/deployment.md

                步骤4：用 create_deploy_service 工具创建部署服务

                步骤5：用 write_file 工具写部署记录，路径必须是 deploy/{项目文件夹名}/deployment.md

                步骤6：用 update_work_product_status 工具更新为"已完成"

                步骤7：用 register_work_product 工具登记部署记录，product_type 填"部署记录"

                步骤8：用 notify_user 工具发送通知，category 填"deploy"，title 填"部署已完成"



                **重要**：所有部署记录必须放在 deploy/{项目文件夹名}/ 下，例如 deploy/snake/deployment.md

                完成后请在最终回复中 @%DISPATCHER% 汇报：「部署已完成」，并附上部署记录 filePath。**只 @ 调度员；调度员会做最终收尾。**

                """).replace("%DISPATCHER%", dispatcherName);

        } else {

            toolInstruction = "你必须根据自己的职责选择一个可用工具完成任务，然后根据工具返回结果回复，并 @" + dispatcherName + " 汇报结果。";

        }

        return "你是 AgentOffice 团队中的 AI 员工。员工ID：" + employee.getId()

                + "，姓名：" + employee.getName()

                + "，角色：" + role

                + "，职位：" + value(employee.getPosition(), "-") + "。"

                + "团队成员名单：" + teamRoster + "。"

                + toolInstruction

                + "文件路径必须使用相对路径，例如 prd/xxx.md、code/frontend/xxx.html、code/backend/xxx.java、review/xxx.md、deploy/xxx.md。"

                + "不要编造已完成结果；只有工具返回的数据才可以作为交付依据。"

                + "最终回复必须写明登记成功的工作产物名称和 filePath，方便下游员工继续读取。"

                + "回复中如果需要触发下一阶段，必须使用 @员工姓名（必须是上面名单中的真实姓名）。";

    }



    private String roomForRole(String role) {

        if (role == null) return "workspace";

        if (role.contains("产品")) return "manager";

        if (isDispatcherRole(role)) return "dispatch";

        if (role.contains("前端")) return "frontend";

        if (role.contains("后端")) return "backend";

        if (role.contains("开发")) return "dev";

        if (isReviewerRole(role)) return "review";

        if (role.contains("运维")) return "ops";

        return "workspace";

    }



    private boolean isWorkflowMessage(String message, String role) {

        String text = value(message, "");

        return text.contains("指派下一步")

                || text.contains("PRD")

                || text.contains("需求")

                || text.contains("开发")

                || text.contains("代码")

                || text.contains("Code Review")

                || text.contains("Review")

                || text.contains("评审")

                || text.contains("审查")

                || text.contains("部署")

                || text.contains("调度")

                || role.contains("产品")

                || role.contains("开发")

                || role.contains("前端")

                || role.contains("后端")

                || isDispatcherRole(role)

                || isReviewerRole(role)

                || role.contains("运维");

    }



    private boolean isDispatcherRole(String role) {

        if (role == null) return false;

        return role.contains("调度") || role.toLowerCase().contains("dispatcher");

    }



    private String findEmployeeNameByRole(String... keywords) {

        for (String keyword : keywords) {

            if (keyword == null || keyword.isBlank()) continue;

            for (AgentEmployee emp : employeeMapper.findAll()) {

                String empRole = value(emp.getRole(), "");

                if (empRole.contains(keyword) || empRole.toLowerCase().contains(keyword.toLowerCase())) {

                    return value(emp.getName(), keyword);

                }

            }

        }

        return keywords.length > 0 ? keywords[0] : "";

    }



    private String findReviewerName() {

        for (AgentEmployee emp : employeeMapper.findAll()) {

            if (isReviewerRole(emp.getRole())) {

                return value(emp.getName(), "CodeReviewer");

            }

        }

        return "CodeReviewer";

    }



    private String buildWorkflowTeamRoster(AgentEmployee self) {

        return employeeMapper.findAll().stream()

                .filter(item -> item.getId() != null && !item.getId().equals(self.getId()))

                .map(item -> "@" + item.getName()

                        + "（" + value(item.getRole(), "成员")

                        + "，" + (item.getPosition() == null ? roleDuty(item.getRole()) : item.getPosition()) + "）")

                .collect(Collectors.joining("；"));

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

        Map<String, Map<String, Object>> deduped = new LinkedHashMap<>();

        workProductMapper.findByEmployeeId(employeeId).forEach(product -> {

            String key = value(product.getFileUrl(), "id:" + product.getId());

            Map<String, Object> current = deduped.get(key);

            boolean hasContent = product.getContent() != null && !product.getContent().isBlank();

            boolean completed = "已完成".equals(product.getStatus());

            if (current != null) {

                boolean currentHasContent = current.get("content") != null && !String.valueOf(current.get("content")).isBlank();

                boolean currentCompleted = "已完成".equals(String.valueOf(current.get("status")));

                if ((currentHasContent || currentCompleted) && !(hasContent || completed)) {

                    return;

                }

            }

            Map<String, Object> item = new HashMap<>();

            item.put("id", product.getId());

            item.put("name", product.getName());

            item.put("type", product.getProductType());

            item.put("taskName", product.getTaskName() == null ? "-" : product.getTaskName());

            item.put("time", product.getUpdateTime() == null ? "-" : product.getUpdateTime().toString().replace('T', ' '));

            item.put("status", product.getStatus());

            item.put("fileUrl", product.getFileUrl() == null ? "" : product.getFileUrl());

            item.put("content", product.getContent() == null ? "" : product.getContent());

            deduped.put(key, item);

        });

        return deduped.values().stream()

                .map(product -> {

                    return product;

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

    private Map<String, Integer> normalizedStatusOverview(List<AgentEmployee> employees) {
        Map<String, Integer> overview = new LinkedHashMap<>();
        overview.put("工作中", 0);
        overview.put("空闲中", 0);
        for (AgentEmployee employee : employees) {
            String status = normalizeStatus(collaborationStatus(employee));
            overview.put(status, overview.getOrDefault(status, 0) + 1);
        }
        return overview;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank() || "在线".equals(status) || "空闲".equals(status)) {
            return "空闲中";
        }
        if ("工作中".equals(status) || "编码中".equals(status) || "Review中".equals(status)
                || "调度中".equals(status) || "部署中".equals(status) || "思考中".equals(status)) {
            return "工作中";
        }
        return status;
    }

    private String statusColor(String status) {
        if ("工作中".equals(status) || "编码中".equals(status) || "Review中".equals(status) || "调度中".equals(status) || "部署中".equals(status) || "思考中".equals(status)) return "green";
        if ("空闲中".equals(status) || "在线".equals(status) || "空闲".equals(status)) return "yellow";
        return "gray";
    }


    private String collaborationStatus(AgentEmployee employee) {

        String status = employee.getStatus();

        String role = employee.getRole();

        if ("工作中".equals(status) && role != null && (role.contains("开发") || role.contains("前端") || role.contains("后端"))) return "编码中";

        if ("工作中".equals(status) && isReviewerRole(role)) return "Review中";

        if ("工作中".equals(status) && isDispatcherRole(role)) return "调度中";

        return status;

    }



    private String colorForStatus(String status) {
        if ("工作中".equals(status) || "编码中".equals(status)) return "#9be7b0";
        if ("空闲中".equals(status) || "在线".equals(status) || "空闲".equals(status)) return "#ffe7a3";
        return "#b8becb";
    }


    private String roleDuty(String role) {

        if (role == null) return "负责团队协作任务";

        if (role.contains("产品")) return "负责需求分析、原型设计、跨团队沟通与任务拆解";

        if (isDispatcherRole(role)) return "负责接收上游汇报、判断阶段并调度下一步员工，串联整个工作流";

        if (role.contains("前端")) return "负责前端页面、组件、交互与样式实现";

        if (role.contains("后端")) return "负责后端接口、业务逻辑、数据库与性能优化";

        if (isReviewerRole(role)) return "负责代码审查、风险识别、质量建议和 Review 报告输出";

        if (role.contains("运维")) return "负责环境部署、容器编排、监控告警与日志巡检";

        return "负责接口开发、业务逻辑实现、性能优化等工作";

    }



    private List<String> roleSkills(String role) {

        if (role == null) return List.of("协作");

        if (role.contains("产品")) return List.of("PRD", "Figma", "Roadmap");

        if (isDispatcherRole(role)) return List.of("任务拆解", "流程编排", "团队协调");

        if (role.contains("前端")) return List.of("HTML", "CSS", "JavaScript", "Vue/React");

        if (role.contains("后端")) return List.of("Java", "Spring Boot", "MySQL", "Docker");

        if (isReviewerRole(role)) return List.of("Code Review", "Static Analysis", "Risk Report");

        if (role.contains("运维")) return List.of("K8s", "Nginx", "Linux");

        return List.of("Java", "Spring Boot", "MySQL", "Docker");

    }



    private boolean isReviewerRole(String role) {

        if (role == null) {

            return false;

        }

        String lowerRole = role.toLowerCase();

        return lowerRole.contains("review") || role.contains("评审") || role.contains("审查");

    }



    private String value(String text, String fallback) {

        return text == null || text.isBlank() ? fallback : text;

    }



    private record ReplyHandoff(Long employeeId, String sender, String content, List<Long> mentionedEmployeeIds) {

    }



    private record NextHandoff(Long employeeId, String message) {

    }

}



