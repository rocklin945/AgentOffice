package com.agentoffice.dto;

import lombok.Data;

@Data
public class DockerProjectResponse {
    private String projectName;
    private String displayName;
    private String appType;
    private String status;
    private String path;
    private String imageName;
    private String containerName;
    private String containerId;
    private Integer port;
    private Integer backendPort;
    private Integer internalPort;
    private Integer internalBackendPort;
    private String url;
    private String backendUrl;
    private Boolean deployable;
    private String message;
}
