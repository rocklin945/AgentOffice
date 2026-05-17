package com.agentoffice.controller;

import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.common.result.Result;
import com.agentoffice.service.JwtService;
import com.agentoffice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public Result<List<Map<String, Object>>> getList(
            @RequestParam(required = false) Integer readStatus,
            @RequestParam(required = false) String category,
            @RequestHeader(value = "Authorization", required = false) String token) {
        return Result.success(notificationService.getList(extractUserId(token), readStatus, category));
    }

    @PatchMapping("/{id}/read")
    public Result<Void> markRead(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        notificationService.markRead(extractUserId(token), id);
        return Result.success();
    }

    @PatchMapping("/read-all")
    public Result<Void> markAllRead(
            @RequestHeader(value = "Authorization", required = false) String token) {
        notificationService.markAllRead(extractUserId(token));
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        notificationService.delete(extractUserId(token), id);
        return Result.success();
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
