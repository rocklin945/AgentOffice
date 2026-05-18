package com.personalwebsite.controller;

import com.personalwebsite.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 主题偏好 API 控制器
 * 提供暗色/亮色主题切换的存储支持
 * 对应 PRD 中 2.6 节 - 暗色/亮色切换功能
 */
@RestController
@RequestMapping("/api/theme")
@CrossOrigin(origins = "*")
public class ThemeController {

    private final DataStore dataStore;

    public ThemeController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    /**
     * 获取当前主题偏好
     * GET /api/theme
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getTheme() {
        return ResponseEntity.ok(Map.of("theme", dataStore.getThemePreference()));
    }

    /**
     * 设置主题偏好
     * POST /api/theme
     * 请求体: { "theme": "dark" } 或 { "theme": "light" }
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> setTheme(@RequestBody Map<String, String> body) {
        String theme = body.get("theme");
        if (theme == null || (!"light".equals(theme) && !"dark".equals(theme))) {
            return ResponseEntity.badRequest().body(Map.of("error", "主题必须是 'light' 或 'dark'"));
        }
        dataStore.setThemePreference(theme);
        return ResponseEntity.ok(Map.of("theme", dataStore.getThemePreference()));
    }
}
