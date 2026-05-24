package com.personalwebsite.controller;

import com.personalwebsite.model.ContactForm;
import com.personalwebsite.service.DataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

/**
 * 联系表单 API 控制器
 * 提供联系表单提交的 RESTful 接口
 * 对应 PRD 中 2.5 节 - 联系方式功能
 */
@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final DataStore dataStore;

    public ContactController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    /**
     * 提交联系表单
     * POST /api/contact
     * 包含基础数据校验
     * 对应 PRD 验收标准：表单提交有基础校验
     */
    @PostMapping
    public ResponseEntity<?> submitContact(@Valid @RequestBody ContactForm form, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<Map<String, String>> errors = bindingResult.getFieldErrors().stream()
                    .map(error -> Map.of(
                            "field", error.getField(),
                            "message", error.getDefaultMessage() == null ? "字段校验失败" : error.getDefaultMessage()
                    ))
                    .toList();
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "联系表单校验失败",
                    "errors", errors
            ));
        }

        // 基础校验
        if (form.getName() == null || form.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "姓名不能为空"));
        }
        if (form.getEmail() == null || !form.getEmail().contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "邮箱格式不正确"));
        }
        if (form.getMessage() == null || form.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "留言内容不能为空"));
        }

        ContactForm submitted = dataStore.submitContactForm(form);
        return ResponseEntity.status(HttpStatus.CREATED).body(submitted);
    }

    /**
     * 获取所有联系表单记录（管理后台用）
     * GET /api/contact
     */
    @GetMapping
    public ResponseEntity<?> getAllContacts() {
        return ResponseEntity.ok(dataStore.getAllContactForms());
    }
}
