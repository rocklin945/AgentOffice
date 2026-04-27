package com.agentoffice.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DeployService {
    private Long id;
    private String serviceName;
    private String image;
    private String version;
    private String status;
    private Integer port;
    private String containerId;
    private BigDecimal cpuUsage;
    private BigDecimal memoryUsage;
    private Long runningTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
