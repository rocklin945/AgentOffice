package com.agentoffice.service;

import com.agentoffice.dto.DashboardResponse;
import com.agentoffice.dto.EmployeeEfficiencyResponse;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private TaskInfoMapper taskMapper;

    @Autowired
    private AgentEmployeeMapper employeeMapper;

    public DashboardResponse getDashboard() {
        DashboardResponse response = new DashboardResponse();

        int totalTasks = taskMapper.countTotal();
        int completedTasks = taskMapper.countCompleted();

        response.setTotalTasks(totalTasks);
        response.setCompletedTasks(completedTasks);

        if (totalTasks > 0) {
            BigDecimal completionRate = BigDecimal.valueOf(completedTasks)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalTasks), 2, RoundingMode.HALF_UP);
            response.setTaskCompletionRate(completionRate);
        } else {
            response.setTaskCompletionRate(BigDecimal.ZERO);
        }

        List<AgentEmployee> employees = employeeMapper.findAll();
        if (!employees.isEmpty()) {
            BigDecimal totalEfficiency = employees.stream()
                    .map(AgentEmployee::getEfficiency)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setAvgEfficiency(totalEfficiency.divide(BigDecimal.valueOf(employees.size()), 2, RoundingMode.HALF_UP));
        } else {
            response.setAvgEfficiency(BigDecimal.ZERO);
        }

        // 模拟趋势数据
        List<DashboardResponse.TrendData> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            DashboardResponse.TrendData data = new DashboardResponse.TrendData();
            data.setDate(LocalDate.now().minusDays(i).format(formatter));
            data.setCompleted((int) (Math.random() * 10) + 5);
            data.setTotal(data.getCompleted() + (int) (Math.random() * 5));
            trend.add(data);
        }
        response.setTrend(trend);

        return response;
    }

    public List<EmployeeEfficiencyResponse> getEmployeeEfficiency() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        List<EmployeeEfficiencyResponse> result = new ArrayList<>();

        for (AgentEmployee employee : employees) {
            EmployeeEfficiencyResponse item = new EmployeeEfficiencyResponse();
            item.setName(employee.getName());
            item.setEfficiency(employee.getEfficiency());
            item.setTaskCount(employee.getTaskCount());
            result.add(item);
        }

        return result;
    }

    public List<DashboardResponse.TrendData> getTaskTrend(LocalDate startDate, LocalDate endDate) {
        // 模拟数据
        List<DashboardResponse.TrendData> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(7);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DashboardResponse.TrendData data = new DashboardResponse.TrendData();
            data.setDate(date.format(formatter));
            data.setCompleted((int) (Math.random() * 15) + 3);
            data.setTotal(data.getCompleted() + (int) (Math.random() * 5));
            trend.add(data);
        }

        return trend;
    }
}
