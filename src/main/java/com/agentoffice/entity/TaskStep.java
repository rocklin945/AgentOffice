package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskStep {
    private Long id;
    private Long taskId;
    private String stepName;
    private Integer stepOrder;
    private String status;
    private LocalDateTime completeTime;
}
