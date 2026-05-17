package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.entity.SysUser;
import com.agentoffice.mapper.SysUserMapper;
import com.agentoffice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private AuthService authService;

    @GetMapping("/users")
    public Result<List<SysUser>> getUsers(
            @RequestHeader(value = "Authorization", required = false) String token) {
        authService.requireAdmin(token);
        return Result.success(userMapper.findAll());
    }

    @PutMapping("/users/{id}")
    public Result<SysUser> updateUser(
            @PathVariable Long id,
            @RequestBody SysUser user,
            @RequestHeader(value = "Authorization", required = false) String token) {
        authService.requireAdmin(token);
        user.setId(id);
        userMapper.updateAdmin(user);
        return Result.success(userMapper.findById(id));
    }

    @DeleteMapping("/users/{id}")
    public Result<Void> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        authService.requireAdmin(token);
        userMapper.deleteById(id);
        return Result.success();
    }

}
