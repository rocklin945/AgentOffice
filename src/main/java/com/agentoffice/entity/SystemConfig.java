package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SystemConfig {
    private Long id;
    private String configKey;
    private String configLabel;
    private String configDesc;
    private String configValue;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
