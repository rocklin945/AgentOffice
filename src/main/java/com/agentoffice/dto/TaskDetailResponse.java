package com.agentoffice.dto;

import lombok.Data;
import java.util.List;

@Data
public class TaskDetailResponse {
    private Long id;
    private String taskName;
    private String description;
    private String priority;
    private ExecutorInfo executor;
    private String status;
    private Integer progress;
    private List<StepInfo> steps;
    private List<LogInfo> logs;
    private String createTime;

    @Data
    public static class ExecutorInfo {
        private Long id;
        private String name;
        private String avatar;
    }

    @Data
    public static class StepInfo {
        private Long id;
        private String stepName;
        private Integer stepOrder;
        private String status;
        private String completeTime;
    }

    @Data
    public static class LogInfo {
        private String time;
        private String content;
    }
}
