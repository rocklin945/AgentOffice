package com.agentoffice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EmployeeEfficiencyResponse {
    private String name;
    private BigDecimal efficiency;
    private Integer taskCount;
}
