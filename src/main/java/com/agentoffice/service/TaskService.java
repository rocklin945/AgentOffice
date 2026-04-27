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
import java.util.List;

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

        // 模拟日志数据
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
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "中");
        task.setExecutorId(request.getExecutorId());
        task.setStatus("待分配");
        task.setProgress(0);
        task.setCreateUser(1L);

        taskMapper.insert(task);

        if (request.getSteps() != null && !request.getSteps().isEmpty()) {
            int order = 1;
            for (String stepName : request.getSteps()) {
                TaskStep step = new TaskStep();
                step.setTaskId(task.getId());
                step.setStepName(stepName);
                step.setStepOrder(order++);
                step.setStatus("待处理");
                stepMapper.insertBatch(task.getId(), List.of(stepName), order - 1);
            }
        }

        return task;
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
