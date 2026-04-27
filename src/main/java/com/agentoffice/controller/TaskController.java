package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.CreateTaskRequest;
import com.agentoffice.dto.TaskDetailResponse;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public Result<List<TaskInfo>> getList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long executorId) {
        List<TaskInfo> list = taskService.getList(status, priority, executorId);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<TaskDetailResponse> getDetail(@PathVariable Long id) {
        TaskDetailResponse detail = taskService.getDetail(id);
        return Result.success(detail);
    }

    @PostMapping
    public Result<TaskInfo> create(@RequestBody CreateTaskRequest request) {
        TaskInfo task = taskService.create(request);
        return Result.success(task);
    }

    @PutMapping("/{id}")
    public Result<TaskInfo> update(@PathVariable Long id, @RequestBody TaskInfo task) {
        TaskInfo result = taskService.update(id, task);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return Result.success();
    }

    @PatchMapping("/{id}/progress")
    public Result<Void> updateProgress(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        taskService.updateProgress(id, body.get("progress"));
        return Result.success();
    }

    @PatchMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        taskService.updateStatus(id, body.get("status"));
        return Result.success();
    }

    @PatchMapping("/{taskId}/steps/{stepId}")
    public Result<Void> updateStepStatus(
            @PathVariable Long taskId,
            @PathVariable Long stepId,
            @RequestBody Map<String, String> body) {
        taskService.updateStepStatus(taskId, stepId, body.get("status"));
        return Result.success();
    }

    @PostMapping("/{id}/assign")
    public Result<Void> assign(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        taskService.assign(id, body.get("executorId"));
        return Result.success();
    }
}
