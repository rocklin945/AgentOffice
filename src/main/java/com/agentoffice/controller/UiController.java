package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.service.UiDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ui")
public class UiController {

    @Autowired
    private UiDataService uiDataService;

    @GetMapping("/dashboard")
    public Result<Map<String, Object>> dashboard() {
        return Result.success(uiDataService.dashboard());
    }

    @GetMapping("/employees")
    public Result<Map<String, Object>> employees() {
        return Result.success(uiDataService.employees());
    }

    @GetMapping("/tasks")
    public Result<Map<String, Object>> tasks() {
        return Result.success(uiDataService.tasks());
    }

    @GetMapping("/deploy")
    public Result<Map<String, Object>> deploy() {
        return Result.success(uiDataService.deploy());
    }

    @GetMapping("/dev")
    public Result<Map<String, Object>> dev() {
        return Result.success(uiDataService.dev());
    }

    @GetMapping("/analytics")
    public Result<Map<String, Object>> analytics() {
        return Result.success(uiDataService.analytics());
    }

    @GetMapping("/admin")
    public Result<Map<String, Object>> admin() {
        return Result.success(uiDataService.admin());
    }
}
