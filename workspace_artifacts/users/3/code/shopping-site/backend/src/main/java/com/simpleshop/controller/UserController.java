package com.simpleshop.controller;

import com.simpleshop.entity.User;
import com.simpleshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String email = request.get("email");
        
        if (userRepository.existsByUsername(username)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "用户名已存在");
            return ResponseEntity.badRequest().body(response);
        }
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        user.setCreateTime(System.currentTimeMillis());
        
        user = userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "注册成功");
        response.put("data", Map.of(
            "id", user.getId(),
            "username", user.getUsername()
        ));
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        return userRepository.findByUsername(username)
            .filter(user -> user.getPassword().equals(password))
            .map(user -> {
                response.put("success", true);
                response.put("message", "登录成功");
                response.put("data", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
                ));
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                response.put("success", false);
                response.put("message", "用户名或密码错误");
                return ResponseEntity.status(401).body(response);
            });
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
                ));
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.status(404).body(response);
            });
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        return userRepository.findById(id)
            .map(user -> {
                if (request.containsKey("email")) {
                    user.setEmail(request.get("email"));
                }
                if (request.containsKey("phone")) {
                    user.setPhone(request.get("phone"));
                }
                if (request.containsKey("avatarUrl")) {
                    user.setAvatarUrl(request.get("avatarUrl"));
                }
                
                userRepository.save(user);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "用户信息已更新");
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.status(404).body(response);
            });
    }
}