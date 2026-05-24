package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.DashboardResponse;
import com.agentoffice.dto.EmployeeWorkloadResponse;
import com.agentoffice.service.CurrentUserService;
import com.agentoffice.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/dashboard")
    public Result<DashboardResponse> getDashboard(@RequestHeader(value = "Authorization", required = false) String token) {
        currentUserService.requireUserId(token);
        DashboardResponse response = analyticsService.getDashboard();
        return Result.success(response);
    }

    @GetMapping("/employees")
    public Result<List<EmployeeWorkloadResponse>> getEmployeeWorkload(@RequestHeader(value = "Authorization", required = false) String token) {
        currentUserService.requireUserId(token);
        List<EmployeeWorkloadResponse> list = analyticsService.getEmployeeWorkload();
        return Result.success(list);
    }

    @GetMapping("/tasks/trend")
    public Result<List<DashboardResponse.TrendData>> getTaskTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader(value = "Authorization", required = false) String token) {
        currentUserService.requireUserId(token);
        List<DashboardResponse.TrendData> trend = analyticsService.getTaskTrend(startDate, endDate);
        return Result.success(trend);
    }

    @GetMapping("/kpi")
    public Result<DashboardResponse> getKpi(@RequestHeader(value = "Authorization", required = false) String token) {
        currentUserService.requireUserId(token);
        DashboardResponse response = analyticsService.getDashboard();
        return Result.success(response);
    }
}
