package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkProduct {
    private Long id;
    private Long employeeId;
    private Long taskId;
    private String name;
    private String productType;
    private String status;
    private String fileUrl;
    private String content;
    private LocalDateTime updateTime;

    private String employeeName;
    private String taskName;
}
