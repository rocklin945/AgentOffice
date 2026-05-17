package com.agentoffice.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateEmployeeRequest {
    private String name;
    private String avatar;
    private String role;
    private String position;
    private String status;
    private Long deskId;
    private Long modelConfigId;
    private List<PermissionItem> permissions;

    @Data
    public static class PermissionItem {
        private String code;
        private String name;
        private Boolean enabled;
    }
}
