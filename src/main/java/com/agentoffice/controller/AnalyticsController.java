package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.DashboardResponse;
import com.agentoffice.dto.EmployeeEfficiencyResponse;
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

    @GetMapping("/dashboard")
    public Result<DashboardResponse> getDashboard() {
        DashboardResponse response = analyticsService.getDashboard();
        return Result.success(response);
    }

    @GetMapping("/employees")
    public Result<List<EmployeeEfficiencyResponse>> getEmployeeEfficiency() {
        List<EmployeeEfficiencyResponse> list = analyticsService.getEmployeeEfficiency();
        return Result.success(list);
    }

    @GetMapping("/tasks/trend")
    public Result<List<DashboardResponse.TrendData>> getTaskTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DashboardResponse.TrendData> trend = analyticsService.getTaskTrend(startDate, endDate);
        return Result.success(trend);
    }

    @GetMapping("/kpi")
    public Result<DashboardResponse> getKpi() {
        DashboardResponse response = analyticsService.getDashboard();
        return Result.success(response);
    }
}
