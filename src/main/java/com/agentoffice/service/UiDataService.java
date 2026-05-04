package com.agentoffice.service;

import com.agentoffice.dto.DashboardResponse;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.DeployService;
import com.agentoffice.entity.DevFile;
import com.agentoffice.entity.DevProject;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.entity.TaskStep;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.DeployServiceMapper;
import com.agentoffice.mapper.DevFileMapper;
import com.agentoffice.mapper.DevProjectMapper;
import com.agentoffice.mapper.EmployeePermissionMapper;
import com.agentoffice.mapper.SysUserMapper;
import com.agentoffice.mapper.SystemConfigMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import com.agentoffice.mapper.TaskStepMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UiDataService {

    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final String[] AVATAR_COLORS = {"#8b5cf6", "#2bb36b", "#2f6bff", "#ff8a32", "#14b8a6", "#f43f5e", "#7c3aed", "#64748b"};
    private static final List<Map<String, String>> PERMISSION_CATALOG = List.of(
            Map.of("code", "task.view", "name", "查看任务"),
            Map.of("code", "task.execute", "name", "执行任务"),
            Map.of("code", "log.view", "name", "查看日志"),
            Map.of("code", "report.write", "name", "输出报告"),
            Map.of("code", "dev.code", "name", "代码开发"),
            Map.of("code", "deploy.manage", "name", "部署服务"),
            Map.of("code", "task.assign", "name", "任务拆解"),
            Map.of("code", "product.plan", "name", "产品规划")
    );

    @Autowired private AgentEmployeeMapper employeeMapper;
    @Autowired private TaskInfoMapper taskMapper;
    @Autowired private TaskStepMapper stepMapper;
    @Autowired private DeployServiceMapper deployMapper;
    @Autowired private DevProjectMapper projectMapper;
    @Autowired private DevFileMapper fileMapper;
    @Autowired private SysUserMapper userMapper;
    @Autowired private EmployeePermissionMapper employeePermissionMapper;
    @Autowired private SystemConfigMapper systemConfigMapper;
    @Autowired private AnalyticsService analyticsService;

    public Map<String, Object> dashboard() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        List<TaskInfo> tasks = taskMapper.findList(null, null, null);
        List<DeployService> services = deployMapper.findAll();
        DashboardResponse metrics = analyticsService.getDashboard();
        Map<String, Object> data = new HashMap<>();
        data.put("overviewStats", List.of(
                Map.of("label", "员工总数", "value", String.valueOf(employees.size()), "color", "bg-[#edf4ff] text-[#2f6bff]", "icon", "team"),
                Map.of("label", "进行中任务", "value", String.valueOf(countTasks(tasks, "进行中")), "color", "bg-[#ebfbf1] text-[#2bb36b]", "icon", "check"),
                Map.of("label", "今日完成", "value", String.valueOf(countTasks(tasks, "已完成")), "color", "bg-[#fff4ea] text-[#ff9b42]", "icon", "play"),
                Map.of("label", "系统状态", "value", "正常", "color", "bg-[#ebfbf1] text-[#2bb36b]", "icon", "check")
        ));
        data.put("employeeRows", employees.stream().map(e -> List.of(n(e.getName()), n(e.getRole()), uiStatus(e), String.valueOf(nz(e.getTaskCount())), percent(e.getEfficiency()))).toList());
        data.put("taskRows", tasks.stream().map(t -> List.of(n(t.getTaskName()), n(t.getPriority()), owner(t), uiTaskStatus(t.getStatus()), nz(t.getProgress()), time(t.getCreateTime()))).toList());
        data.put("deployRows", services.stream().map(s -> List.of(n(s.getServiceName()), n(s.getStatus()), image(s), n(s.getVersion()), runningTime(s.getRunningTime()))).toList());
        data.put("analyticsStats", List.of(
                List.of("任务完成率", percent(metrics.getTaskCompletionRate()), "来自后端统计"),
                List.of("总任务数", String.valueOf(metrics.getTotalTasks()), "来自后端统计"),
                List.of("完成任务数", String.valueOf(metrics.getCompletedTasks()), "来自后端统计"),
                List.of("平均效率", percent(metrics.getAvgEfficiency()), "来自后端统计")
        ));
        data.put("trend", metrics.getTrend());
        return data;
    }

    public Map<String, Object> employees() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        Map<String, Object> data = new HashMap<>();
        data.put("employees", employees.stream().map(this::employeeCard).toList());
        data.put("roleCards", List.of(
                List.of("开发工程师", "负责代码开发、实现功能需求"),
                List.of("测试工程师", "负责测试用例编写、功能测试"),
                List.of("运维工程师", "负责系统部署、运维与监控"),
                List.of("产品经理", "负责需求分析、产品规划")
        ));
        return data;
    }

    public Map<String, Object> tasks() {
        List<TaskInfo> tasks = taskMapper.findList(null, null, null);
        Map<String, Object> data = new HashMap<>();
        data.put("tasks", tasks.stream().map(this::taskRow).toList());
        data.put("details", tasks.stream().collect(HashMap::new, (map, task) -> map.put(String.valueOf(task.getId()), taskDetail(task)), HashMap::putAll));
        return data;
    }

    public Map<String, Object> deploy() {
        List<DeployService> services = deployMapper.findAll();
        Map<String, Object> data = new HashMap<>();
        List<Map<String, Object>> serviceRows = services.stream().map(s -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", s.getId());
            item.put("name", s.getServiceName());
            item.put("status", s.getStatus());
            item.put("image", image(s));
            item.put("version", empty(s.getVersion()));
            item.put("time", runningTime(s.getRunningTime()));
            item.put("containerId", empty(s.getContainerId()));
            item.put("port", s.getPort() == null ? "-" : String.valueOf(s.getPort()));
            item.put("cpu", percent(s.getCpuUsage()));
            item.put("memory", percent(s.getMemoryUsage()));
            return item;
        }).toList();
        data.put("services", serviceRows);
        data.put("containers", serviceRows.stream().map(s -> Map.of(
                "id", "c" + s.get("id"),
                "name", s.get("name") + "-container",
                "image", s.get("image"),
                "status", s.get("status"),
                "cpu", s.get("cpu"),
                "memory", s.get("memory")
        )).toList());
        data.put("images", serviceRows.stream().map(s -> Map.of("name", s.get("name"), "tag", s.get("version"), "size", "-", "created", "-")).toList());
        data.put("logs", List.of());
        return data;
    }

    public Map<String, Object> dev() {
        List<DevProject> projects = projectMapper.findAll();
        DevProject project = projects.isEmpty() ? null : projects.get(0);
        List<DevFile> files = project == null ? List.of() : fileMapper.findByProjectId(project.getId());
        DevFile first = files.stream().filter(f -> f.getIsDirectory() == null || f.getIsDirectory() == 0).findFirst().orElse(null);
        Map<String, Object> data = new HashMap<>();
        data.put("projectName", project == null ? "-" : project.getProjectName());
        data.put("fileName", first == null ? "-" : first.getFilePath());
        data.put("files", files.stream().map(f -> Map.of("name", f.getFileName(), "active", first != null && first.getId().equals(f.getId()), "directory", f.getIsDirectory() != null && f.getIsDirectory() == 1)).toList());
        data.put("codeLines", first == null || first.getContent() == null ? List.of() : Arrays.asList(first.getContent().split("\\n")));
        data.put("runResult", Map.of("title", "等待运行", "duration", "-", "tests", "-", "passed", "-", "failed", "-", "coverage", "-", "logs", List.of("[INFO] 请选择文件并运行")));
        return data;
    }

    public Map<String, Object> analytics() {
        DashboardResponse metrics = analyticsService.getDashboard();
        List<AgentEmployee> employees = employeeMapper.findAll();
        List<TaskInfo> tasks = taskMapper.findList(null, null, null);
        Map<String, Object> data = new HashMap<>();
        data.put("metrics", metrics);
        data.put("employeeEfficiency", employees.stream().map(e -> Map.of("label", n(e.getName()), "value", nz(e.getEfficiency()))).toList());
        data.put("taskCounts", Map.of("running", countTasks(tasks, "进行中"), "completed", countTasks(tasks, "已完成"), "failed", countTasks(tasks, "已失败"), "pending", countTasks(tasks, "待分配")));
        return data;
    }

    public Map<String, Object> admin() {
        Map<String, Object> data = new HashMap<>();
        List<AgentEmployee> employees = employeeMapper.findAll();
        employees.forEach(employee -> employee.setPermissions(employeePermissionMapper.findByEmployeeId(employee.getId())));
        data.put("users", userMapper.findAll());
        data.put("employees", employees);
        data.put("tasks", taskMapper.findList(null, null, null));
        data.put("services", deployMapper.findAll());
        data.put("dashboard", analyticsService.getDashboard());
        data.put("systemSettings", systemConfigMapper.findAll());
        return data;
    }

    private Map<String, Object> employeeCard(AgentEmployee e) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", e.getId());
        item.put("name", n(e.getName()));
        item.put("role", n(e.getRole()));
        item.put("status", uiStatus(e));
        item.put("tasks", String.valueOf(nz(e.getTaskCount())));
        item.put("efficiency", percent(e.getEfficiency()));
        item.put("color", avatarColor(e));
        item.put("employeeNo", "EMP" + String.format("%04d", e.getId()));
        item.put("joinedAt", time(e.getCreateTime()).split(" ")[0]);
        item.put("duty", n(e.getPosition()));
        item.put("skills", List.of(n(e.getRole()), "协作", "自动化"));
        item.put("task", nz(e.getTaskCount()) > 0 ? "处理当前分配任务" : "暂无进行中任务");
        item.put("progress", nz(e.getEfficiency()));
        item.put("workingTime", "0分钟");
        item.put("commits", "0次");
        item.put("testPass", "0个");
        item.put("deployCount", "0次");
        Map<String, Boolean> enabledMap = employeePermissionMapper.findByEmployeeId(e.getId()).stream()
                .collect(HashMap::new,
                        (map, permission) -> map.put(n(permission.getPermissionCode()), permission.getEnabled() == null || permission.getEnabled() == 1),
                        HashMap::putAll);
        List<Map<String, Object>> permissions = PERMISSION_CATALOG.stream()
                .map(permission -> Map.<String, Object>of(
                        "code", permission.get("code"),
                        "name", permission.get("name"),
                        "enabled", enabledMap.getOrDefault(permission.get("code"), false)
                ))
                .toList();
        item.put("permissions", permissions);
        return item;
    }

    private Map<String, Object> taskRow(TaskInfo t) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", String.valueOf(t.getId()));
        item.put("name", n(t.getTaskName()));
        item.put("description", empty(t.getDescription()));
        item.put("taskType", empty(t.getTaskType()));
        item.put("executorId", t.getExecutorId());
        item.put("level", n(t.getPriority()));
        item.put("owner", empty(t.getExecutorName()));
        item.put("role", "执行员工");
        item.put("status", uiTaskStatus(t.getStatus()));
        item.put("progress", nz(t.getProgress()));
        item.put("createdAt", time(t.getCreateTime()));
        return item;
    }

    private Map<String, Object> taskDetail(TaskInfo task) {
        List<TaskStep> steps = stepMapper.findByTaskId(task.getId());
        return Map.of(
                "executionSteps", steps.stream().map(s -> Map.of("step", s.getStepOrder(), "name", s.getStepName(), "role", "执行员工", "owner", empty(task.getExecutorName()), "status", uiTaskStatus(s.getStatus()))).toList(),
                "executionLogs", List.of(time(task.getCreateTime()) + " 任务创建"),
                "results", List.of(Map.of("label", "当前进度", "value", nz(task.getProgress()) + "%")),
                "files", List.of()
        );
    }

    private int countTasks(List<TaskInfo> tasks, String status) {
        return (int) tasks.stream().filter(t -> status.equals(t.getStatus())).count();
    }

    private String owner(TaskInfo task) {
        return empty(task.getExecutorName());
    }

    private String uiStatus(AgentEmployee employee) {
        if ("工作中".equals(employee.getStatus()) && employee.getRole() != null && employee.getRole().contains("开发")) return "编码中";
        if ("工作中".equals(employee.getStatus()) && employee.getRole() != null && employee.getRole().contains("测试")) return "测试中";
        return n(employee.getStatus());
    }

    private String uiTaskStatus(String status) {
        if ("进行中".equals(status)) return "开发中";
        return n(status);
    }

    private String image(DeployService service) {
        return n(service.getImage()) + ":" + n(service.getVersion());
    }

    private String runningTime(Long seconds) {
        if (seconds == null || seconds <= 0) return "-";
        long days = seconds / 86400;
        long hours = (seconds % 86400) / 3600;
        return days > 0 ? days + "天" + hours + "小时" : hours + "小时";
    }

    private String time(java.time.LocalDateTime time) {
        return time == null ? "-" : time.format(TIME);
    }

    private String percent(Number number) {
        return number == null ? "0%" : number.intValue() + "%";
    }

    private int nz(Number number) {
        return number == null ? 0 : number.intValue();
    }

    private String n(String text) {
        return text == null ? "-" : text;
    }

    private String empty(String text) {
        return text == null || text.isBlank() ? "-" : text;
    }

    private String avatarColor(AgentEmployee employee) {
        String source = String.valueOf(employee.getId()) + n(employee.getName());
        int seed = 0;
        for (int i = 0; i < source.length(); i++) {
            seed += source.charAt(i);
        }
        return AVATAR_COLORS[Math.floorMod(seed, AVATAR_COLORS.length)];
    }
}
