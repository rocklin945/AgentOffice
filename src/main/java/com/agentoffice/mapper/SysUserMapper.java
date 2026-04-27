package com.agentoffice.mapper;

import com.agentoffice.entity.SysUser;
import org.apache.ibatis.annotations.*;

@Mapper
public interface SysUserMapper {

    @Select("SELECT * FROM sys_user WHERE username = #{username}")
    SysUser findByUsername(@Param("username") String username);

    @Select("SELECT * FROM sys_user WHERE id = #{id}")
    SysUser findById(@Param("id") Long id);

    @Insert("INSERT INTO sys_user (username, password, nickname, email, status) " +
            "VALUES (#{username}, #{password}, #{nickname}, #{email}, 1)")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(SysUser user);

    @Update("UPDATE sys_user SET nickname = #{nickname}, avatar = #{avatar}, email = #{email}, " +
            "phone = #{phone}, update_time = NOW() WHERE id = #{id}")
    int update(SysUser user);
}
