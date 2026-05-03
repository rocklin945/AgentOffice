package com.agentoffice.controller;

import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.common.result.Result;
import com.agentoffice.dto.LoginRequest;
import com.agentoffice.dto.LoginResponse;
import com.agentoffice.dto.RegisterRequest;
import com.agentoffice.service.AuthService;
import com.agentoffice.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

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
    public Result<LoginResponse.UserInfo> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String token) {
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
        if (token == null || token.isBlank() || !jwtService.validateToken(token)) {
            throw new BusinessException(401, "Unauthorized");
        }
        return jwtService.getUserIdFromToken(token);
    }
}
