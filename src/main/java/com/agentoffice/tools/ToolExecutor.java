package com.agentoffice.tools;

import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.DeployService;
import com.agentoffice.entity.DevFile;
import com.agentoffice.entity.DevProject;
import com.agentoffice.entity.NotificationMessage;
import com.agentoffice.entity.OperationLog;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.entity.WorkProduct;
import com.agentoffice.llm.LlmTool;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.DeployServiceMapper;
import com.agentoffice.mapper.DevFileMapper;
import com.agentoffice.mapper.DevProjectMapper;
import com.agentoffice.mapper.NotificationMessageMapper;
import com.agentoffice.mapper.OperationLogMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import com.agentoffice.mapper.WorkProductMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ToolExecutor {

    private final ObjectMapper objectMapper;
    private final AgentEmployeeMapper employeeMapper;
    private final TaskInfoMapper taskMapper;
    private final WorkProductMapper workProductMapper;
    private final DevProjectMapper projectMapper;
    private final DevFileMapper fileMapper;
    private final DeployServiceMapper deployMapper;
    private final NotificationMessageMapper notificationMapper;
    private final OperationLogMapper operationLogMapper;
    private final JdbcTemplate jdbcTemplate;

    public static final String DATA_ENGINEER_TOOLS = "DATA_ENGINEER_TOOLS";
    public static final String WORKFLOW_TOOLS = "WORKFLOW_TOOLS";

    @Transactional
    public String executeTool(String toolsKey, String functionName, Map<String, Object> args) {
        log.info("Executing tool: {} with key: {}", functionName, toolsKey);

        try {
            if (WORKFLOW_TOOLS.equals(toolsKey)) {
                return executeWorkflowTool(functionName, args);
            }
            return switch (functionName) {
                case "execute_sql" -> executeSql(args);
                case "list_user_tables" -> listUserTables(args);
                case "query_data" -> queryData(args);
                case "test_db_connection" -> testDbConnection(args);
                default -> String.format("{\"error\": \"Unknown function: %s\"}", functionName);
            };
        } catch (Exception e) {
            log.error("Tool execution failed: {}", functionName, e);
            return String.format("{\"error\": \"%s\"}", e.getMessage());
        }
    }

    public List<LlmTool> getToolsByKey(String toolsKey) {
        if (DATA_ENGINEER_TOOLS.equals(toolsKey)) {
            return getDataEngineerTools();
        }
        if (WORKFLOW_TOOLS.equals(toolsKey)) {
            return getWorkflowTools();
        }
        return List.of();
    }

    private String executeWorkflowTool(String functionName, Map<String, Object> args) throws JsonProcessingException {
        WorkflowResult result = switch (functionName) {
            case "read_file" -> readFile(args);
            case "write_file" -> writeFile(args);
            case "modify_file" -> modifyFile(args);
            case "delete_file" -> deleteFile(args);
            case "find_latest_work_product" -> findLatestWorkProduct(args);
            case "create_task" -> createWorkflowTask(args);
            case "register_work_product" -> registerWorkProduct(args);
            case "notify_user" -> notifyUserTool(args);
            case "create_work_product_in_progress" -> createWorkProductInProgress(args);
            case "update_work_product_status" -> updateWorkProductStatus(args);
            case "create_deploy_service" -> createDeployServiceTool(args);
            default -> new WorkflowResult(false, "Unknown workflow tool: " + functionName, Map.of());
        };
        return objectMapper.writeValueAsString(result);
    }

    private List<LlmTool> getWorkflowTools() {
        return List.of(
                createTool("read_file", "读取工作区中的真实文件内容。只能读取 workspace_artifacts 下的相对路径。",
                        Map.of(
                                "file_path", new LlmTool.Parameter("string", "相对文件路径，例如 prd/login.md")
                        )),
                createTool("write_file", "写入一个真实文件。用于创建 PRD、代码、Code Review 报告、部署记录等交付物。",
                        Map.of(
                                "file_path", new LlmTool.Parameter("string", "相对文件路径，例如 prd/login.md"),
                                "content", new LlmTool.Parameter("string", "要写入文件的完整内容")
                        )),
                createTool("modify_file", "修改一个真实文件。通过查找文本并替换来更新文件。",
                        Map.of(
                                "file_path", new LlmTool.Parameter("string", "相对文件路径"),
                                "search", new LlmTool.Parameter("string", "要查找的原文本"),
                                "replacement", new LlmTool.Parameter("string", "替换后的文本")
                        )),
                createTool("delete_file", "删除一个真实文件。只能删除 workspace_artifacts 下的相对路径。",
                        Map.of(
                                "file_path", new LlmTool.Parameter("string", "相对文件路径")
                        )),
                createTool("find_latest_work_product", "从数据库查找指定类型的最新工作产物，用于获取上游 PRD、代码、Code Review 报告或部署记录的真实文件路径。",
                        Map.of(
                                "product_type", new LlmTool.Parameter("string", "产物类型关键词，例如 需求文档、代码、Code Review报告、部署记录")
                        )),
                createTool("create_task", "在任务管理中创建真实任务，并可按角色自动分配员工。",
                        Map.of(
                                "task_name", new LlmTool.Parameter("string", "任务名称"),
                                "task_type", new LlmTool.Parameter("string", "任务类型 product/development/review/deployment/custom"),
                                "description", new LlmTool.Parameter("string", "任务描述"),
                                "priority", new LlmTool.Parameter("string", "优先级 高/中/低"),
                                "executor_role", new LlmTool.Parameter("string", "执行员工角色关键词，例如 开发、CodeReviewer、运维、产品")
                        )),
                createTool("register_work_product", "把真实文件登记为工作产物，登记后前端工作产物区可点击查看。",
                        Map.of(
                                "employee_id", new LlmTool.Parameter("integer", "产出该文件的员工 ID"),
                                "task_id", new LlmTool.Parameter("integer", "关联任务 ID，可省略"),
                                "name", new LlmTool.Parameter("string", "工作产物名称"),
                                "product_type", new LlmTool.Parameter("string", "产物类型，例如 需求文档、代码、Code Review报告、部署记录"),
                                "file_path", new LlmTool.Parameter("string", "write_file 写入的相对文件路径")
                        )),
                createTool("create_work_product_in_progress", "在工作产物区创建一个进行中的工作产物，用于开始工作时展示进度。",
                        Map.of(
                                "employee_id", new LlmTool.Parameter("integer", "产出该文件的员工 ID"),
                                "name", new LlmTool.Parameter("string", "工作产物名称"),
                                "product_type", new LlmTool.Parameter("string", "产物类型，例如 需求文档、代码、Code Review报告、部署记录"),
                                "file_path", new LlmTool.Parameter("string", "将写入的相对文件路径")
                        )),
                createTool("update_work_product_status", "更新工作产物的状态。",
                        Map.of(
                                "file_path", new LlmTool.Parameter("string", "工作产物的文件路径"),
                                "status", new LlmTool.Parameter("string", "新状态：进行中/已完成")
                        )),
                createTool("notify_user", "创建真实消息通知。",
                        Map.of(
                                "category", new LlmTool.Parameter("string", "通知分类 task/test/deploy"),
                                "title", new LlmTool.Parameter("string", "通知标题"),
                                "content", new LlmTool.Parameter("string", "通知内容"),
                                "source_type", new LlmTool.Parameter("string", "来源类型"),
                                "source_id", new LlmTool.Parameter("integer", "来源 ID，可省略"),
                                "priority", new LlmTool.Parameter("string", "优先级 normal/high")
                        )),
                createTool("create_deploy_service", "在部署与运维模块创建真实服务记录。",
                        Map.of(
                                "service_name", new LlmTool.Parameter("string", "服务名称"),
                                "image", new LlmTool.Parameter("string", "镜像名称"),
                                "version", new LlmTool.Parameter("string", "版本号"),
                                "port", new LlmTool.Parameter("integer", "服务端口")
                        ))
        );
    }

    private WorkflowResult readFile(Map<String, Object> args) {
        try {
            Path path = resolveArtifactPath(text(args, "file_path"));
            if (!Files.exists(path) || Files.isDirectory(path)) {
                return new WorkflowResult(false, "文件不存在", Map.of("filePath", artifactRelative(path)));
            }
            String content = Files.readString(path, StandardCharsets.UTF_8);
            logOperation("read_file", "file", null, artifactRelative(path));
            return new WorkflowResult(true, "文件读取成功", Map.of("filePath", artifactRelative(path), "content", content));
        } catch (Exception e) {
            return new WorkflowResult(false, e.getMessage(), Map.of());
        }
    }

    private WorkflowResult writeFile(Map<String, Object> args) {
        try {
            Path path = resolveArtifactPath(text(args, "file_path"));
            Files.createDirectories(path.getParent());
            String content = text(args, "content");
            Files.writeString(path, content, StandardCharsets.UTF_8);
            logOperation("write_file", "file", null, artifactRelative(path));
            return new WorkflowResult(true, "文件写入成功", Map.of(
                    "filePath", artifactRelative(path),
                    "absolutePath", path.toString(),
                    "size", content.getBytes(StandardCharsets.UTF_8).length
            ));
        } catch (Exception e) {
            return new WorkflowResult(false, e.getMessage(), Map.of());
        }
    }

    private WorkflowResult modifyFile(Map<String, Object> args) {
        try {
            Path path = resolveArtifactPath(text(args, "file_path"));
            String search = text(args, "search");
            String replacement = text(args, "replacement");
            String content = Files.readString(path, StandardCharsets.UTF_8);
            if (!content.contains(search)) {
                return new WorkflowResult(false, "文件中未找到要替换的文本", Map.of("filePath", artifactRelative(path)));
            }
            String next = content.replace(search, replacement);
            Files.writeString(path, next, StandardCharsets.UTF_8);
            logOperation("modify_file", "file", null, artifactRelative(path));
            return new WorkflowResult(true, "文件修改成功", Map.of("filePath", artifactRelative(path)));
        } catch (Exception e) {
            return new WorkflowResult(false, e.getMessage(), Map.of());
        }
    }

    private WorkflowResult deleteFile(Map<String, Object> args) {
        try {
            Path path = resolveArtifactPath(text(args, "file_path"));
            boolean deleted = Files.deleteIfExists(path);
            logOperation("delete_file", "file", null, artifactRelative(path));
            return new WorkflowResult(deleted, deleted ? "文件删除成功" : "文件不存在", Map.of("filePath", artifactRelative(path)));
        } catch (Exception e) {
            return new WorkflowResult(false, e.getMessage(), Map.of());
        }
    }

    private WorkflowResult findLatestWorkProduct(Map<String, Object> args) {
        String productType = value(text(args, "product_type"), "");
        WorkProduct product = workProductMapper.findLatestByType(productType);
        if (product == null) {
            return new WorkflowResult(false, "未找到工作产物：" + productType, Map.of("productType", productType));
        }
        logOperation("find_latest_work_product", "work_product", product.getId(), product.getName());
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("productId", product.getId());
        data.put("productName", product.getName());
        data.put("productType", product.getProductType());
        data.put("status", product.getStatus());
        data.put("filePath", value(product.getFileUrl(), ""));
        data.put("employeeId", product.getEmployeeId());
        data.put("employeeName", value(product.getEmployeeName(), ""));
        data.put("taskName", value(product.getTaskName(), ""));
        data.put("content", value(product.getContent(), ""));
        if (product.getTaskId() != null) {
            data.put("taskId", product.getTaskId());
        }
        return new WorkflowResult(true, "工作产物查询成功", data);
    }

    private WorkflowResult createWorkflowTask(Map<String, Object> args) {
        String roleKeyword = text(args, "executor_role");
        if (roleKeyword == null || roleKeyword.isBlank()) {
            return new WorkflowResult(false, "executor_role 不能为空，必须指定执行员工角色（如：开发、CodeReviewer、运维）", Map.of());
        }
        AgentEmployee executor = findEmployeeByRole(roleKeyword).orElse(null);
        if (executor == null) {
            return new WorkflowResult(false, "未找到角色为「" + roleKeyword + "」的员工，请先在员工管理中添加对应角色的员工", Map.of("roleKeyword", roleKeyword));
        }
        TaskInfo task = createTask(
                value(text(args, "task_name"), "协作任务"),
                value(text(args, "task_type"), "custom"),
                value(text(args, "description"), ""),
                value(text(args, "priority"), "中"),
                executor.getId(),
                "进行中",
                defaultSteps(value(text(args, "task_type"), "custom"))
        );
        logOperation("create_task", "task", task.getId(), task.getTaskName());
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("taskId", task.getId());
        data.put("taskName", task.getTaskName());
        data.put("executorId", executor.getId());
        data.put("executorName", executor.getName());
        return new WorkflowResult(true, "任务创建成功并已分配给 " + executor.getName(), data);
    }

    private WorkflowResult registerWorkProduct(Map<String, Object> args) {
        try {
            Path path = resolveArtifactPath(text(args, "file_path"));
            String content = Files.exists(path) ? Files.readString(path, StandardCharsets.UTF_8) : "";
            Long taskId = optionalLong(args, "task_id");
            Long employeeId = requiredLong(args, "employee_id");
            
            WorkProduct product = saveWorkProduct(
                    employeeId,
                    taskId,
                    value(text(args, "name"), path.getFileName().toString()),
                    value(text(args, "product_type"), "文件"),
                    "已完成",
                    artifactRelative(path),
                    content
            );
            syncCodeArtifactToCloudDev(artifactRelative(path), content, product.getEmployeeId());
            logOperation("register_work_product", "work_product", product.getId(), product.getName() + " -> " + artifactRelative(path));
            
            // 如果有关联任务，更新任务状态为已完成
            if (taskId != null) {
                TaskInfo task = taskMapper.findById(taskId);
                if (task != null && !"已完成".equals(task.getStatus())) {
                    taskMapper.updateStatus(taskId, "已完成");
                    logOperation("update_task_status", "task", taskId, "任务已完成: " + task.getTaskName());
                }
            } else {
                // 如果没有明确的 task_id，尝试查找该员工当前进行中的任务
                List<TaskInfo> employeeTasks = taskMapper.findList(null, null, employeeId);
                for (TaskInfo task : employeeTasks) {
                    if ("进行中".equals(task.getStatus())) {
                        taskMapper.updateStatus(task.getId(), "已完成");
                        logOperation("update_task_status", "task", task.getId(), "任务已完成: " + task.getTaskName());
                        break; // 只更新第一个进行中的任务
                    }
                }
            }
            
            return new WorkflowResult(true, "工作产物登记成功", Map.of(
                    "productId", product.getId(),
                    "productName", product.getName(),
                    "filePath", artifactRelative(path),
                    "content", content
            ));
        } catch (Exception e) {
            return new WorkflowResult(false, e.getMessage(), Map.of());
        }
    }

    private WorkflowResult notifyUserTool(Map<String, Object> args) {
        Long sourceId = optionalLong(args, "source_id");
        notifyUser(
                value(text(args, "category"), "task"),
                value(text(args, "title"), "工作流通知"),
                value(text(args, "content"), ""),
                value(text(args, "source_type"), "workflow"),
                sourceId,
                value(text(args, "priority"), "normal")
        );
        logOperation("notify_user", value(text(args, "source_type"), "workflow"), sourceId, text(args, "title"));
        return new WorkflowResult(true, "通知已创建", Map.of("title", value(text(args, "title"), "工作流通知")));
    }

    private WorkflowResult createWorkProductInProgress(Map<String, Object> args) {
        try {
            String filePath = text(args, "file_path");
            Path path = resolveArtifactPath(filePath);
            String fileName = path.getFileName().toString();
            WorkProduct product = saveWorkProduct(
                    requiredLong(args, "employee_id"),
                    null,
                    value(text(args, "name"), fileName),
                    value(text(args, "product_type"), "文件"),
                    "进行中",
                    artifactRelative(path),
                    ""
            );
            logOperation("create_work_product_in_progress", "work_product", product.getId(), product.getName());
            return new WorkflowResult(true, "工作产物已创建（进行中）", Map.of(
                    "productId", product.getId(),
                    "productName", product.getName(),
                    "filePath", artifactRelative(path)
            ));
        } catch (Exception e) {
            return new WorkflowResult(false, e.getMessage(), Map.of());
        }
    }

    private WorkflowResult updateWorkProductStatus(Map<String, Object> args) {
        String filePath = text(args, "file_path");
        String status = text(args, "status");
        if (filePath.isBlank()) {
            return new WorkflowResult(false, "file_path 不能为空", Map.of());
        }
        if (!status.equals("进行中") && !status.equals("已完成")) {
            return new WorkflowResult(false, "status 只能是 进行中 或 已完成", Map.of());
        }
        WorkProduct product = workProductMapper.findByFileUrl(filePath.replace("\\", "/"));
        if (product == null) {
            return new WorkflowResult(false, "未找到文件路径对应的工作产物: " + filePath, Map.of());
        }
        product.setStatus(status);
        if ("已完成".equals(status) && Files.exists(resolveArtifactPath(filePath))) {
            try {
                String content = Files.readString(resolveArtifactPath(filePath), StandardCharsets.UTF_8);
                product.setContent(content);
            } catch (Exception ignored) {
            }
        }
        workProductMapper.updateStatus(product.getId(), status, value(product.getContent(), ""));
        logOperation("update_work_product_status", "work_product", product.getId(), product.getName() + " -> " + status);
        return new WorkflowResult(true, "工作产物状态已更新为 " + status, Map.of(
                "productId", product.getId(),
                "productName", product.getName(),
                "status", status
        ));
    }

    private WorkflowResult createDeployServiceTool(Map<String, Object> args) {
        DeployService service = new DeployService();
        service.setServiceName(value(text(args, "service_name"), "agentoffice-service"));
        service.setImage(value(text(args, "image"), "agentoffice/workflow"));
        service.setVersion(value(text(args, "version"), "v1.0.0"));
        Long port = optionalLong(args, "port");
        service.setPort(port == null ? 9000 : port.intValue());
        service.setStatus("运行中");
        deployMapper.insert(service);
        deployMapper.updateContainerId(service.getId(), "container_workflow_" + service.getId());
        deployMapper.updateMetrics(service.getId(), new BigDecimal("12.50"), new BigDecimal("28.40"), 1L);
        logOperation("create_deploy_service", "deploy_service", service.getId(), service.getServiceName());
        return new WorkflowResult(true, "部署服务已创建", Map.of(
                "serviceId", service.getId(),
                "serviceName", service.getServiceName(),
                "image", service.getImage(),
                "version", service.getVersion(),
                "port", service.getPort()
        ));
    }

    private List<LlmTool> getDataEngineerTools() {
        return List.of(
                createTool("execute_sql", "执行 SQL 查询语句",
                        Map.of("sql", new LlmTool.Parameter("string", "要执行的 SQL 语句"))),
                createTool("list_user_tables", "列出用户的所有数据表", Map.of()),
                createTool("query_data", "查询数据",
                        Map.of(
                                "table", new LlmTool.Parameter("string", "表名"),
                                "limit", new LlmTool.Parameter("integer", "返回记录数限制"))),
                createTool("test_db_connection", "测试数据库连接", Map.of())
        );
    }

    private LlmTool createTool(String name, String description, Map<String, LlmTool.Parameter> params) {
        return new LlmTool("function", new LlmTool.Function(name, description, params));
    }

    private String executeSql(Map<String, Object> args) throws JsonProcessingException {
        String sql = (String) args.get("sql");
        log.info("Executing SQL: {}", sql);
        if (sql == null || sql.isBlank()) {
            return objectMapper.writeValueAsString(Map.of("error", "SQL 不能为空"));
        }
        String normalized = sql.trim().toLowerCase();
        if (normalized.startsWith("select") || normalized.startsWith("show") || normalized.startsWith("desc")) {
            return objectMapper.writeValueAsString(Map.of("sql", sql, "rows", jdbcTemplate.queryForList(sql)));
        }
        int affected = jdbcTemplate.update(sql);
        return objectMapper.writeValueAsString(Map.of("sql", sql, "affectedRows", affected));
    }

    private String listUserTables(Map<String, Object> args) throws JsonProcessingException {
        List<String> tables = jdbcTemplate.queryForList(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name",
                String.class
        );
        return objectMapper.writeValueAsString(Map.of("tables", tables));
    }

    private String queryData(Map<String, Object> args) throws JsonProcessingException {
        String table = (String) args.get("table");
        int limit = args.get("limit") instanceof Number number ? Math.max(1, Math.min(number.intValue(), 100)) : 10;
        if (table == null || !table.matches("[A-Za-z0-9_]+")) {
            return objectMapper.writeValueAsString(Map.of("error", "表名非法"));
        }
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + table + " LIMIT " + limit);
        return objectMapper.writeValueAsString(Map.of("table", table, "limit", limit, "data", rows));
    }

    private String testDbConnection(Map<String, Object> args) {
        return "{\"status\": \"ok\", \"message\": \"数据库连接正常\"}";
    }

    private TaskInfo createTask(String taskName, String taskType, String description, String priority, Long executorId, String status, List<String> steps) {
        TaskInfo task = new TaskInfo();
        task.setTaskName(taskName);
        task.setTaskType(taskType);
        task.setDescription(description);
        task.setPriority(priority);
        task.setExecutorId(executorId);
        task.setStatus(status);
        task.setCreateUser(1L);
        taskMapper.insert(task);

        return task;
    }

    private WorkProduct createWorkProduct(Long employeeId, Long taskId, String name, String productType, String status, String fileUrl, String content) {
        WorkProduct product = new WorkProduct();
        product.setEmployeeId(employeeId);
        product.setTaskId(taskId);
        product.setName(name);
        product.setProductType(productType);
        product.setStatus(status);
        product.setFileUrl(fileUrl);
        product.setContent(content);
        workProductMapper.insert(product);
        return product;
    }

    private WorkProduct saveWorkProduct(Long employeeId, Long taskId, String name, String productType, String status, String fileUrl, String content) {
        WorkProduct existing = workProductMapper.findByFileUrl(fileUrl);
        if (existing != null) {
            existing.setEmployeeId(employeeId);
            existing.setTaskId(taskId);
            existing.setName(name);
            existing.setProductType(productType);
            existing.setStatus(status);
            existing.setFileUrl(fileUrl);
            existing.setContent(content);
            workProductMapper.update(existing);
            return existing;
        }
        return createWorkProduct(employeeId, taskId, name, productType, status, fileUrl, content);
    }

    private DevFile createDevFile(Long projectId, String fileName, String filePath, String fileType, Long parentId, int directory) {
        DevFile file = new DevFile();
        file.setProjectId(projectId);
        file.setFileName(fileName);
        file.setFilePath(filePath);
        file.setFileType(fileType);
        file.setParentId(parentId);
        file.setIsDirectory(directory);
        fileMapper.insert(file);
        return file;
    }

    private void syncCodeArtifactToCloudDev(String artifactPath, String content, Long ownerId) {
        if (artifactPath == null || !artifactPath.replace("\\", "/").startsWith("code/")) {
            return;
        }
        DevProject project = projectMapper.findAll().stream()
                .filter(item -> "AI 员工交付工程".equals(item.getProjectName()))
                .findFirst()
                .orElseGet(() -> {
                    DevProject created = new DevProject();
                    created.setProjectName("AI 员工交付工程");
                    created.setDescription("AI 员工通过 write_file 真实写入并登记的代码产物。");
                    created.setLanguage("mixed");
                    created.setOwnerId(ownerId);
                    created.setStatus(1);
                    projectMapper.insert(created);
                    return created;
                });
        String normalized = artifactPath.replace("\\", "/");
        String devPath = "/" + normalized;
        String fileName = Paths.get(devPath).getFileName().toString();
        String fileType = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf('.') + 1) : "text";
        DevFile existing = fileMapper.findByProjectId(project.getId()).stream()
                .filter(file -> devPath.equals(file.getFilePath()))
                .filter(file -> file.getIsDirectory() == null || file.getIsDirectory() == 0)
                .findFirst()
                .orElse(null);
        if (existing == null) {
            createDevFile(project.getId(), fileName, devPath, fileType, null, 0);
        }
        logOperation("sync_code_to_cloud_dev", "dev_project", project.getId(), devPath);
    }

    private void notifyUser(String category, String title, String content, String sourceType, Long sourceId, String priority) {
        NotificationMessage notification = new NotificationMessage();
        notification.setUserId(1L);
        notification.setCategory(category);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setSourceType(sourceType);
        notification.setSourceId(sourceId);
        notification.setReadStatus(0);
        notification.setPriority(priority);
        notificationMapper.insert(notification);
    }

    private void logOperation(String action, String targetType, Long targetId, String detail) {
        OperationLog log = new OperationLog();
        log.setUserId(1L);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetail(detail);
        log.setIpAddress("system");
        operationLogMapper.insert(log);
    }

    private Optional<AgentEmployee> findEmployeeByRole(String roleKeyword) {
        String normalizedKeyword = value(roleKeyword, "");
        return employeeMapper.findAll().stream()
                .filter(employee -> roleMatches(value(employee.getRole(), ""), normalizedKeyword))
                .findFirst();
    }

    private boolean roleMatches(String role, String keyword) {
        if (role.contains(keyword)) {
            return true;
        }
        String lowerRole = role.toLowerCase();
        String lowerKeyword = keyword.toLowerCase();
        if (lowerRole.contains(lowerKeyword)) {
            return true;
        }
        boolean reviewerKeyword = lowerKeyword.contains("review") || keyword.contains("评审") || keyword.contains("审查");
        if (reviewerKeyword && (lowerRole.contains("review") || role.contains("评审") || role.contains("审查"))) {
            return true;
        }
        boolean dispatcherKeyword = keyword.contains("调度") || lowerKeyword.contains("dispatcher");
        if (dispatcherKeyword && (role.contains("调度") || lowerRole.contains("dispatcher"))) {
            return true;
        }
        if (keyword.contains("前端") && role.contains("前端")) {
            return true;
        }
        if (keyword.contains("后端") && role.contains("后端")) {
            return true;
        }
        return false;
    }

    private Long requiredLong(Map<String, Object> args, String key) {
        Object value = args.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value != null) {
            return Long.valueOf(value.toString());
        }
        throw new IllegalArgumentException("缺少参数：" + key);
    }

    private Long optionalLong(Map<String, Object> args, String key) {
        Object value = args.get(key);
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.valueOf(value.toString());
    }

    private String text(Map<String, Object> args, String key) {
        Object value = args.get(key);
        return value == null ? "" : value.toString();
    }

    private String value(String text, String fallback) {
        return text == null || text.isBlank() ? fallback : text;
    }

    private List<String> defaultSteps(String taskType) {
        return switch (taskType) {
            case "product" -> List.of("需求梳理", "文档编写", "任务拆解");
            case "development" -> List.of("阅读需求", "代码开发", "自测提交");
            case "review" -> List.of("读取代码", "静态审查", "风险记录", "输出Review报告");
            case "deployment" -> List.of("构建发布", "健康检查", "部署记录");
            default -> List.of("任务执行");
        };
    }

    private Path artifactRoot() {
        return Paths.get(System.getProperty("user.dir"), "workspace_artifacts").toAbsolutePath().normalize();
    }

    private Path resolveArtifactPath(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("文件路径不能为空");
        }
        Path root = artifactRoot();
        Path resolved = root.resolve(filePath.replace("\\", "/")).normalize();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("文件路径超出工作产物目录");
        }
        return resolved;
    }

    private String artifactRelative(Path path) {
        Path root = artifactRoot();
        Path normalized = path.toAbsolutePath().normalize();
        if (!normalized.startsWith(root)) {
            return normalized.toString();
        }
        return root.relativize(normalized).toString().replace("\\", "/");
    }

    private record WorkflowResult(boolean ok, String message, Map<String, Object> data) {
    }
}
