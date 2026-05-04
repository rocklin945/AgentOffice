package com.agentoffice.service;

import com.agentoffice.dto.CreateTaskRequest;
import com.agentoffice.dto.TaskDetailResponse;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.entity.TaskStep;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import com.agentoffice.mapper.TaskStepMapper;
import com.agentoffice.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TaskService {

    @Autowired
    private TaskInfoMapper taskMapper;

    @Autowired
    private TaskStepMapper stepMapper;

    @Autowired
    private AgentEmployeeMapper employeeMapper;

    public List<TaskInfo> getList(String status, String priority, Long executorId) {
        return taskMapper.findList(status, priority, executorId);
    }

    public List<Map<String, Object>> getTaskTypes() {
        List<Map<String, Object>> types = new ArrayList<>();
        types.add(taskType("development", "开发任务", "接口开发、页面开发、功能实现", List.of("需求分析", "接口设计", "代码开发", "测试验证", "部署上线")));
        types.add(taskType("testing", "测试任务", "测试用例、自动化测试、回归验证", List.of("用例设计", "环境准备", "执行测试", "缺陷记录", "回归验证")));
        types.add(taskType("deployment", "部署任务", "服务部署、容器发布、环境巡检", List.of("构建镜像", "配置环境", "发布服务", "健康检查", "监控观察")));
        types.add(taskType("product", "产品任务", "需求分析、原型设计、验收规划", List.of("需求梳理", "原型设计", "评审确认", "任务拆解")));
        types.add(taskType("custom", "自定义任务", "手动填写任务步骤", List.of("任务执行")));
        return types;
    }

    public TaskDetailResponse getDetail(Long id) {
        TaskInfo task = taskMapper.findById(id);
        if (task == null) {
            throw new BusinessException(404, "任务不存在");
        }

        TaskDetailResponse response = new TaskDetailResponse();
        response.setId(task.getId());
        response.setTaskName(task.getTaskName());
        response.setDescription(task.getDescription());
        response.setPriority(task.getPriority());
        response.setStatus(task.getStatus());
        response.setProgress(task.getProgress());

        if (task.getExecutorId() != null) {
            AgentEmployee executor = employeeMapper.findById(task.getExecutorId());
            if (executor != null) {
                TaskDetailResponse.ExecutorInfo executorInfo = new TaskDetailResponse.ExecutorInfo();
                executorInfo.setId(executor.getId());
                executorInfo.setName(executor.getName());
                executorInfo.setAvatar(executor.getAvatar());
                response.setExecutor(executorInfo);
            }
        }

        List<TaskStep> steps = stepMapper.findByTaskId(id);
        List<TaskDetailResponse.StepInfo> stepInfoList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (TaskStep step : steps) {
            TaskDetailResponse.StepInfo stepInfo = new TaskDetailResponse.StepInfo();
            stepInfo.setId(step.getId());
            stepInfo.setStepName(step.getStepName());
            stepInfo.setStepOrder(step.getStepOrder());
            stepInfo.setStatus(step.getStatus());
            if (step.getCompleteTime() != null) {
                stepInfo.setCompleteTime(step.getCompleteTime().format(formatter));
            }
            stepInfoList.add(stepInfo);
        }
        response.setSteps(stepInfoList);

        List<TaskDetailResponse.LogInfo> logs = new ArrayList<>();
        TaskDetailResponse.LogInfo log1 = new TaskDetailResponse.LogInfo();
        log1.setTime(task.getCreateTime().format(formatter));
        log1.setContent("任务已创建");
        logs.add(log1);
        response.setLogs(logs);

        response.setCreateTime(task.getCreateTime().format(formatter));

        return response;
    }

    @Transactional
    public TaskInfo create(CreateTaskRequest request) {
        TaskInfo task = new TaskInfo();
        task.setTaskName(request.getTaskName());
        task.setTaskType(request.getTaskType() != null ? request.getTaskType() : "custom");
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "中");
        task.setExecutorId(request.getExecutorId());
        task.setStatus(request.getExecutorId() == null ? "待分配" : "进行中");
        task.setProgress(0);
        task.setCreateUser(1L);

        taskMapper.insert(task);

        List<String> steps = request.getSteps();
        if (steps == null || steps.isEmpty()) {
            steps = defaultSteps(task.getTaskType());
        }

        if (steps != null && !steps.isEmpty()) {
            int order = 1;
            for (String stepName : steps) {
                TaskStep step = new TaskStep();
                step.setTaskId(task.getId());
                step.setStepName(stepName);
                step.setStepOrder(order++);
                step.setStatus("待处理");
                stepMapper.insert(step);
            }
        }

        return task;
    }

    private Map<String, Object> taskType(String value, String label, String description, List<String> steps) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("value", value);
        item.put("label", label);
        item.put("description", description);
        item.put("steps", steps);
        return item;
    }

    private List<String> defaultSteps(String taskType) {
        return getTaskTypes().stream()
                .filter(type -> type.get("value").equals(taskType))
                .findFirst()
                .map(type -> (List<String>) type.get("steps"))
                .orElse(List.of("任务执行"));
    }

    @Transactional
    public TaskInfo update(Long id, TaskInfo task) {
        TaskInfo exist = taskMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "任务不存在");
        }
        task.setId(id);
        taskMapper.update(task);
        return task;
    }

    @Transactional
    public void delete(Long id) {
        stepMapper.deleteByTaskId(id);
        taskMapper.deleteById(id);
    }

    @Transactional
    public void updateProgress(Long id, Integer progress) {
        taskMapper.updateProgress(id, progress);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        if ("已完成".equals(status)) {
            taskMapper.complete(id, status);
        } else {
            taskMapper.updateStatus(id, status);
        }
    }

    @Transactional
    public void updateStepStatus(Long taskId, Long stepId, String status) {
        stepMapper.updateStatus(stepId, status);
    }

    @Transactional
    public void assign(Long taskId, Long executorId) {
        TaskInfo task = taskMapper.findById(taskId);
        if (task == null) {
            throw new BusinessException(404, "任务不存在");
        }
        task.setExecutorId(executorId);
        task.setStatus("进行中");
        taskMapper.update(task);
    }
}
