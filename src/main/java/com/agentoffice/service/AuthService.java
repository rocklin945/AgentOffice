package com.agentoffice.service;

import com.agentoffice.dto.LoginRequest;
import com.agentoffice.dto.LoginResponse;
import com.agentoffice.dto.RegisterRequest;
import com.agentoffice.entity.SysUser;
import com.agentoffice.mapper.SysUserMapper;
import com.agentoffice.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private JwtService jwtService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponse login(LoginRequest request) {
        SysUser user = userMapper.findByUsername(request.getUsername());
        if (user == null) {
            throw new BusinessException(401, "用户名或密码错误");
        }
        if (user.getStatus() != 1) {
            throw new BusinessException(401, "账号已被禁用");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername());

        LoginResponse response = new LoginResponse();
        response.setToken(token);

        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setNickname(user.getNickname());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setEmail(user.getEmail());
        response.setUser(userInfo);

        return response;
    }

    public void register(RegisterRequest request) {
        SysUser existUser = userMapper.findByUsername(request.getUsername());
        if (existUser != null) {
            throw new BusinessException(400, "用户名已存在");
        }

        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setEmail(request.getEmail());
        user.setStatus(1);

        userMapper.insert(user);
    }

    public LoginResponse.UserInfo getCurrentUser(Long userId) {
        SysUser user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setNickname(user.getNickname());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setEmail(user.getEmail());

        return userInfo;
    }
}
