package com.agentoffice.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateTaskRequest {
    private String taskName;
    private String taskType;
    private String description;
    private String priority;
    private Long executorId;
    private List<String> steps;
}
