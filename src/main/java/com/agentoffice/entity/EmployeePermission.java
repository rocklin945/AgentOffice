package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmployeePermission {
    private Long id;
    private Long employeeId;
    private String permissionCode;
    private String permissionName;
    private Integer enabled;
    private LocalDateTime createTime;
}
