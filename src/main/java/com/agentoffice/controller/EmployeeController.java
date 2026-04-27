package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public Result<List<AgentEmployee>> getList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword) {
        List<AgentEmployee> list = employeeService.getList(status, role, keyword);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<AgentEmployee> getById(@PathVariable Long id) {
        AgentEmployee employee = employeeService.getById(id);
        return Result.success(employee);
    }

    @PostMapping
    public Result<AgentEmployee> create(@RequestBody AgentEmployee employee) {
        AgentEmployee result = employeeService.create(employee);
        return Result.success(result);
    }

    @PutMapping("/{id}")
    public Result<AgentEmployee> update(@PathVariable Long id, @RequestBody AgentEmployee employee) {
        AgentEmployee result = employeeService.update(id, employee);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return Result.success();
    }

    @PatchMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        employeeService.updateStatus(id, body.get("status"));
        return Result.success();
    }
}
