package com.agentoffice.service;

import com.agentoffice.dto.CreateTaskRequest;
import com.agentoffice.dto.TaskDetailResponse;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.TaskInfoMapper;
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
    private AgentEmployeeMapper employeeMapper;

    public List<TaskInfo> getList(Long userId, String status, String priority, Long executorId) {
        return taskMapper.findListByUser(userId, status, priority, executorId);
    }

    public List<Map<String, Object>> getTaskTypes() {
        List<Map<String, Object>> types = new ArrayList<>();
        types.add(taskType("development", "开发任务", "接口开发、页面开发、功能实现", List.of("需求分析", "接口设计", "代码开发", "Code Review", "部署上线")));
        types.add(taskType("review", "Code Review任务", "代码审查、风险识别、质量建议", List.of("读取代码", "静态审查", "风险记录", "输出Review报告")));
        types.add(taskType("deployment", "部署任务", "服务部署、容器发布、环境巡检", List.of("构建镜像", "配置环境", "发布服务", "健康检查", "监控观察")));
        types.add(taskType("product", "产品任务", "需求分析、原型设计、验收规划", List.of("需求梳理", "原型设计", "评审确认", "任务拆解")));
        types.add(taskType("custom", "自定义任务", "手动填写任务步骤", List.of("任务执行")));
        return types;
    }

    public TaskDetailResponse getDetail(Long userId, Long id) {
        TaskInfo task = taskMapper.findByIdAndUser(id, userId);
        if (task == null) {
            throw new BusinessException(404, "任务不存在");
        }

        TaskDetailResponse response = new TaskDetailResponse();
        response.setId(task.getId());
        response.setTaskName(task.getTaskName());
        response.setDescription(task.getDescription());
        response.setPriority(task.getPriority());
        response.setStatus(task.getStatus());
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

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        response.setCreateTime(task.getCreateTime().format(formatter));

        return response;
    }

    @Transactional
    public TaskInfo create(Long userId, CreateTaskRequest request) {
        TaskInfo task = new TaskInfo();
        task.setTaskName(request.getTaskName());
        task.setTaskType(request.getTaskType() != null ? request.getTaskType() : "custom");
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "中");
        task.setExecutorId(request.getExecutorId());
        task.setStatus(request.getExecutorId() == null ? "待分配" : "进行中");
        task.setCreateUser(userId);

        taskMapper.insert(task);
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
    public TaskInfo update(Long userId, Long id, TaskInfo task) {
        TaskInfo exist = taskMapper.findByIdAndUser(id, userId);
        if (exist == null) {
            throw new BusinessException(404, "任务不存在");
        }
        task.setId(id);
        task.setCreateUser(userId);
        taskMapper.update(task);
        return task;
    }

    @Transactional
    public void delete(Long userId, Long id) {
        taskMapper.deleteByIdForUser(id, userId);
    }

    @Transactional
    public void updateStatus(Long userId, Long id, String status) {
        if ("已完成".equals(status)) {
            taskMapper.completeForUser(id, status, userId);
        } else {
            taskMapper.updateStatusForUser(id, status, userId);
        }
    }

    @Transactional
    public void assign(Long userId, Long taskId, Long executorId) {
        TaskInfo task = taskMapper.findByIdAndUser(taskId, userId);
        if (task == null) {
            throw new BusinessException(404, "任务不存在");
        }
        task.setExecutorId(executorId);
        task.setStatus("进行中");
        task.setCreateUser(userId);
        taskMapper.update(task);
    }
}
