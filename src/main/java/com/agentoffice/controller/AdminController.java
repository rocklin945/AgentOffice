package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.entity.SysUser;
import com.agentoffice.entity.SystemConfig;
import com.agentoffice.mapper.SysUserMapper;
import com.agentoffice.mapper.SystemConfigMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private SystemConfigMapper systemConfigMapper;

    @PutMapping("/users/{id}")
    public Result<SysUser> updateUser(@PathVariable Long id, @RequestBody SysUser user) {
        user.setId(id);
        userMapper.updateAdmin(user);
        return Result.success(userMapper.findById(id));
    }

    @DeleteMapping("/users/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userMapper.deleteById(id);
        return Result.success();
    }

    @GetMapping("/system-settings")
    public Result<List<SystemConfig>> getSystemSettings() {
        return Result.success(systemConfigMapper.findAll());
    }

    @PutMapping("/system-settings")
    public Result<Void> updateSystemSettings(@RequestBody Map<String, String> values) {
        values.forEach((key, value) -> systemConfigMapper.updateValue(key, value));
        return Result.success();
    }
}
