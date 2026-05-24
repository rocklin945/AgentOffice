package com.agentoffice.config;

import com.agentoffice.service.JwtService;
import com.agentoffice.service.UserScope;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class UserScopeFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            if (token != null && !token.isBlank() && jwtService.validateToken(token)) {
                UserScope.setUserId(jwtService.getUserIdFromToken(token));
            }
            filterChain.doFilter(request, response);
        } finally {
            UserScope.clear();
        }
    }
}
