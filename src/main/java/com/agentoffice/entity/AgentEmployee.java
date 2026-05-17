package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AgentEmployee {
    private Long id;
    private String name;
    private String avatar;
    private String role;
    private String position;
    private String status;
    private Integer taskCount;
    private Long modelConfigId;
    private String modelConfigName;
    private String modelName;
    private List<EmployeePermission> permissions;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
