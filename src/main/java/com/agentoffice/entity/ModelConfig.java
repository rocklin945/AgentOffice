package com.agentoffice.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ModelConfig {
    private Long id;
    private String configName;
    private String provider;
    private String modelName;
    private String apiBase;
    private String apiKey;
    private Integer isDefault;
    private Integer enabled;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
