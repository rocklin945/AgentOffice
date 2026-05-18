package com.agentoffice.dto;

import lombok.Data;

@Data
public class DeployRequest {
    private Integer port;
    private Integer internalPort;
    private Boolean forceRebuild;
}
