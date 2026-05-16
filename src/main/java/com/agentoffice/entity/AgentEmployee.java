package com.agentoffice.entity;

import lombok.Data;
import java.math.BigDecimal;
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
    private BigDecimal efficiency;
    private Long deskId;
    private Long modelConfigId;
    private String modelConfigName;
    private String modelName;
    private String deskCode;
    private List<EmployeePermission> permissions;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
