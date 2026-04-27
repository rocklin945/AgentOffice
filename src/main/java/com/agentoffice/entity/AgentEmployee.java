package com.agentoffice.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private String deskCode;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
