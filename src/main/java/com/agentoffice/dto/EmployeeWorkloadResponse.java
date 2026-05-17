package com.agentoffice.dto;

import lombok.Data;

@Data
public class EmployeeWorkloadResponse {
    private String name;
    private String role;
    private Integer taskCount;
}
