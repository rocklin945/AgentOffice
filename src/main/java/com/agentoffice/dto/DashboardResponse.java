package com.agentoffice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardResponse {
    private BigDecimal taskCompletionRate;
    private Integer totalTasks;
    private Integer completedTasks;
    private List<TrendData> trend;
    private Map<String, Object> productStats;
    private Map<String, Object> operationStats;

    @Data
    public static class TrendData {
        private String date;
        private Integer completed;
        private Integer total;
    }
}
