package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.CreateEmployeeRequest;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.service.CurrentUserService;
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

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping
    public Result<List<AgentEmployee>> getList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword,
            @RequestHeader(value = "Authorization", required = false) String token) {
        List<AgentEmployee> list = employeeService.getList(currentUserService.requireUserId(token), status, role, keyword);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<AgentEmployee> getById(@PathVariable Long id,
                                         @RequestHeader(value = "Authorization", required = false) String token) {
        AgentEmployee employee = employeeService.getById(currentUserService.requireUserId(token), id);
        return Result.success(employee);
    }

    @PostMapping
    public Result<AgentEmployee> create(@RequestBody CreateEmployeeRequest request,
                                        @RequestHeader(value = "Authorization", required = false) String token) {
        AgentEmployee result = employeeService.create(currentUserService.requireUserId(token), request);
        return Result.success(result);
    }

    @PutMapping("/{id}")
    public Result<AgentEmployee> update(@PathVariable Long id, @RequestBody CreateEmployeeRequest employee,
                                        @RequestHeader(value = "Authorization", required = false) String token) {
        AgentEmployee result = employeeService.update(currentUserService.requireUserId(token), id, employee);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @RequestHeader(value = "Authorization", required = false) String token) {
        employeeService.delete(currentUserService.requireUserId(token), id);
        return Result.success();
    }

    @PatchMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                     @RequestHeader(value = "Authorization", required = false) String token) {
        employeeService.updateStatus(currentUserService.requireUserId(token), id, body.get("status"));
        return Result.success();
    }
}
