package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.CollaborationChatRequest;
import com.agentoffice.dto.OfficeLayoutResponse;
import com.agentoffice.entity.OfficeDesk;
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

    @GetMapping("/collaboration")
    public Result<Map<String, Object>> getCollaboration() {
        return Result.success(officeService.getCollaboration());
    }

    @PostMapping("/collaboration/messages")
    public Result<Map<String, Object>> sendCollaborationMessage(@RequestBody CollaborationChatRequest request) {
        return Result.success(officeService.sendCollaborationMessage(request));
    }

    @PostMapping("/desks")
    public Result<OfficeDesk> createDesk() {
        return Result.success(officeService.createDesk());
    }

    @PatchMapping("/desks/{deskId}/employee")
    public Result<Void> assignDesk(@PathVariable Long deskId, @RequestBody Map<String, Long> body) {
        officeService.assignDesk(deskId, body.get("employeeId"));
        return Result.success();
    }
}
