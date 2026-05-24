package com.agentoffice.service;

import com.agentoffice.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final JwtService jwtService;

    public Long requireUserId(String token) {
        String rawToken = token;
        if (rawToken != null && rawToken.startsWith("Bearer ")) {
            rawToken = rawToken.substring(7);
        }
        if (rawToken == null || rawToken.isBlank() || !jwtService.validateToken(rawToken)) {
            throw new BusinessException(401, "Unauthorized");
        }
        Long userId = jwtService.getUserIdFromToken(rawToken);
        UserScope.setUserId(userId);
        return userId;
    }
}
