package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OfficeDesk {
    private Long id;
    private String deskCode;
    private Integer rowNum;
    private Integer colNum;
    private Long employeeId;
    private Integer status;
    private LocalDateTime createTime;
}
