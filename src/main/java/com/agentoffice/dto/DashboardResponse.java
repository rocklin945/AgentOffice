package com.agentoffice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardResponse {
    private BigDecimal taskCompletionRate;
    private Integer totalTasks;
    private Integer completedTasks;
    private BigDecimal avgEfficiency;
    private List<TrendData> trend;

    @Data
    public static class TrendData {
        private String date;
        private Integer completed;
        private Integer total;
    }
}
