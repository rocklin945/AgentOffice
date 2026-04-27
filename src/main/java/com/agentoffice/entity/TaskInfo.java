package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskInfo {
    private Long id;
    private String taskName;
    private String description;
    private String priority;
    private Long executorId;
    private String executorName;
    private String executorAvatar;
    private String status;
    private Integer progress;
    private Long createUser;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private LocalDateTime endTime;
    private List<TaskStep> steps;
}
