package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.dto.CollaborationChatRequest;
import com.agentoffice.dto.OfficeLayoutResponse;
import com.agentoffice.service.JwtService;
import com.agentoffice.service.OfficeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/office")
public class OfficeController {

    @Autowired
    private OfficeService officeService;

    @Autowired
    private JwtService jwtService;

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
    public Result<Map<String, Object>> sendCollaborationMessage(
            @RequestBody CollaborationChatRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(officeService.sendCollaborationMessage(request, extractUserId(token)));
    }

    @PostMapping(value = "/collaboration/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamCollaborationMessage(
            @RequestBody CollaborationChatRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        return officeService.streamCollaborationMessage(request, extractUserId(token));
    }

    @GetMapping("/collaboration/sessions")
    public Result<Map<String, Object>> getCollaborationSessions(
            @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(officeService.getCollaborationSessions(extractUserId(token)));
    }

    @PostMapping("/collaboration/sessions")
    public Result<Map<String, Object>> createCollaborationSession(
            @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(officeService.createCollaborationSession(extractUserId(token), null));
    }

    @GetMapping("/collaboration/sessions/{sessionId}/messages")
    public Result<Map<String, Object>> getCollaborationMessages(
            @PathVariable String sessionId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(officeService.getCollaborationMessages(extractUserId(token), sessionId));
    }

    @DeleteMapping("/collaboration/sessions/{sessionId}")
    public Result<Void> deleteCollaborationSession(
            @PathVariable String sessionId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        officeService.deleteCollaborationSession(extractUserId(token), sessionId);
        return Result.success();
    }

    @GetMapping("/code-reviews/latest")
    public Result<Map<String, Object>> getLatestCodeReview(@RequestParam(required = false) Long taskId) {
        return Result.success(officeService.getLatestCodeReviewReport(taskId));
    }

    @PostMapping("/code-reviews/{taskId}/rerun")
    public Result<Map<String, Object>> rerunCodeReview(@PathVariable Long taskId) {
        return Result.success(officeService.rerunCodeReview(taskId));
    }

    private Long extractUserId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token == null || token.isBlank() || !jwtService.validateToken(token)) {
            throw new BusinessException(401, "Unauthorized");
        }
        return jwtService.getUserIdFromToken(token);
    }
}
