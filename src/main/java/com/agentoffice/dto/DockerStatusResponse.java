package com.agentoffice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DockerStatusResponse {
    private boolean available;
    private String version;
    private String message;
}
