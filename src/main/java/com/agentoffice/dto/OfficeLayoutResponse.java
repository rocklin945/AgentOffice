package com.agentoffice.dto;

import lombok.Data;
import java.util.List;

@Data
public class OfficeLayoutResponse {
    private Integer rows;
    private Integer cols;
    private List<DeskInfo> desks;

    @Data
    public static class DeskInfo {
        private Long id;
        private String deskCode;
        private Integer rowNum;
        private Integer colNum;
        private Integer status;
        private EmployeeInfo employee;
    }

    @Data
    public static class EmployeeInfo {
        private Long id;
        private String name;
        private String avatar;
        private String role;
        private String position;
        private String status;
    }
}
