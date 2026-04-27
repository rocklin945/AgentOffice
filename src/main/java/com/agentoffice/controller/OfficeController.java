package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.OfficeLayoutResponse;
import com.agentoffice.service.OfficeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/office")
public class OfficeController {

    @Autowired
    private OfficeService officeService;

    @GetMapping("/layout")
    public Result<OfficeLayoutResponse> getLayout() {
        OfficeLayoutResponse response = officeService.getLayout();
        return Result.success(response);
    }

    @GetMapping("/employees/status")
    public Result<Map<String, Integer>> getEmployeeStatusOverview() {
        Map<String, Integer> overview = officeService.getStatusOverview();
        return Result.success(overview);
    }
}
