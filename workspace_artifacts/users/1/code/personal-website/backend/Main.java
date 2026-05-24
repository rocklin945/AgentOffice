package com.personalwebsite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 个人网站后端 - 主启动类
 * 提供 RESTful API 支持，包括：
 * - 作品集数据管理
 * - 博客文章管理
 * - 联系表单提交
 * - 暗色/亮色主题偏好存储
 */
@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}
