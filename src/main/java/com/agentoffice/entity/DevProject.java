package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DevProject {
    private Long id;
    private String projectName;
    private String description;
    private String language;
    private Long ownerId;
    private String ownerName;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
