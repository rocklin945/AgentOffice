package com.agentoffice.service;

import com.agentoffice.dto.DashboardResponse;
import com.agentoffice.dto.EmployeeWorkloadResponse;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.TaskInfo;
import com.agentoffice.entity.WorkProduct;
import com.agentoffice.entity.OperationLog;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import com.agentoffice.mapper.WorkProductMapper;
import com.agentoffice.mapper.OperationLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private TaskInfoMapper taskMapper;

    @Autowired
    private AgentEmployeeMapper employeeMapper;

    @Autowired
    private WorkProductMapper workProductMapper;

    @Autowired
    private OperationLogMapper operationLogMapper;

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

        List<DashboardResponse.TrendData> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            DashboardResponse.TrendData data = new DashboardResponse.TrendData();
            data.setDate(date.format(formatter));
            data.setCompleted(taskMapper.countCompletedByDate(date));
            data.setTotal(taskMapper.countCreatedByDate(date));
            trend.add(data);
        }
        response.setTrend(trend);

        // 添加工作产物统计
        List<WorkProduct> allProducts = workProductMapper.findAll();
        Map<String, Object> productStats = new HashMap<>();
        productStats.put("total", allProducts.size());
        productStats.put("completed", allProducts.stream().filter(p -> "已完成".equals(p.getStatus())).count());
        productStats.put("inProgress", allProducts.stream().filter(p -> "进行中".equals(p.getStatus())).count());
        
        Map<String, Long> productTypeCount = new HashMap<>();
        for (WorkProduct product : allProducts) {
            String type = product.getProductType() != null ? product.getProductType() : "其他";
            productTypeCount.put(type, productTypeCount.getOrDefault(type, 0L) + 1);
        }
        productStats.put("byType", productTypeCount);
        response.setProductStats(productStats);

        // 添加操作日志统计
        List<OperationLog> recentLogs = operationLogMapper.findRecent(100);
        Map<String, Object> operationStats = new HashMap<>();
        operationStats.put("total", recentLogs.size());
        
        Map<String, Long> operationTypeCount = new HashMap<>();
        for (OperationLog log : recentLogs) {
            String type = log.getOperationType() != null ? log.getOperationType() : "其他";
            operationTypeCount.put(type, operationTypeCount.getOrDefault(type, 0L) + 1);
        }
        operationStats.put("byType", operationTypeCount);
        response.setOperationStats(operationStats);

        return response;
    }

    public List<EmployeeWorkloadResponse> getEmployeeWorkload() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        List<EmployeeWorkloadResponse> result = new ArrayList<>();

        for (AgentEmployee employee : employees) {
            EmployeeWorkloadResponse item = new EmployeeWorkloadResponse();
            item.setName(employee.getName());
            item.setTaskCount(taskMapper.countByExecutor(employee.getId()));
            result.add(item);
        }

        return result;
    }

    public List<DashboardResponse.TrendData> getTaskTrend(LocalDate startDate, LocalDate endDate) {
        List<DashboardResponse.TrendData> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(7);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DashboardResponse.TrendData data = new DashboardResponse.TrendData();
            data.setDate(date.format(formatter));
            data.setCompleted(taskMapper.countCompletedByDate(date));
            data.setTotal(taskMapper.countCreatedByDate(date));
            trend.add(data);
        }

        return trend;
    }
}
