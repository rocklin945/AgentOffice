package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.LoginRequest;
import com.agentoffice.dto.LoginResponse;
import com.agentoffice.dto.RegisterRequest;
import com.agentoffice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    @PostMapping("/register")
    public Result<Void> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return Result.success();
    }

    @GetMapping("/current")
    public Result<LoginResponse.UserInfo> getCurrentUser(@RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        LoginResponse.UserInfo userInfo = authService.getCurrentUser(userId);
        return Result.success(userInfo);
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }

    private Long extractUserId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // 简化处理，实际应该解析JWT
        return 1L;
    }
}
