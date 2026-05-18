package com.agentoffice.dto;

import lombok.Data;

@Data
public class DeployRequest {
    private Integer port;
    private Integer backendPort;
    private Integer internalPort;
    private Integer internalBackendPort;
    private Boolean forceRebuild;
}
