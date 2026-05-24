package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.CreateTaskRequest;
import com.agentoffice.dto.TaskDetailResponse;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.service.CurrentUserService;
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

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping
    public Result<List<TaskInfo>> getList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long executorId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        List<TaskInfo> list = taskService.getList(currentUserService.requireUserId(token), status, priority, executorId);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<TaskDetailResponse> getDetail(@PathVariable Long id,
                                                @RequestHeader(value = "Authorization", required = false) String token) {
        TaskDetailResponse detail = taskService.getDetail(currentUserService.requireUserId(token), id);
        return Result.success(detail);
    }

    @GetMapping("/types")
    public Result<List<Map<String, Object>>> getTaskTypes() {
        return Result.success(taskService.getTaskTypes());
    }

    @PostMapping
    public Result<TaskInfo> create(@RequestBody CreateTaskRequest request,
                                   @RequestHeader(value = "Authorization", required = false) String token) {
        TaskInfo task = taskService.create(currentUserService.requireUserId(token), request);
        return Result.success(task);
    }

    @PutMapping("/{id}")
    public Result<TaskInfo> update(@PathVariable Long id, @RequestBody TaskInfo task,
                                   @RequestHeader(value = "Authorization", required = false) String token) {
        TaskInfo result = taskService.update(currentUserService.requireUserId(token), id, task);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @RequestHeader(value = "Authorization", required = false) String token) {
        taskService.delete(currentUserService.requireUserId(token), id);
        return Result.success();
    }

    @PatchMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                     @RequestHeader(value = "Authorization", required = false) String token) {
        taskService.updateStatus(currentUserService.requireUserId(token), id, body.get("status"));
        return Result.success();
    }

    @PostMapping("/{id}/assign")
    public Result<Void> assign(@PathVariable Long id, @RequestBody Map<String, Long> body,
                               @RequestHeader(value = "Authorization", required = false) String token) {
        taskService.assign(currentUserService.requireUserId(token), id, body.get("executorId"));
        return Result.success();
    }
}
