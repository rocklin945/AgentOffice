package com.agentoffice.mapper;

import com.agentoffice.entity.SysUser;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface SysUserMapper {

    @Select("SELECT * FROM sys_user WHERE username = #{username}")
    SysUser findByUsername(@Param("username") String username);

    @Select("SELECT * FROM sys_user WHERE id = #{id}")
    SysUser findById(@Param("id") Long id);

    @Select("SELECT * FROM sys_user WHERE email = #{email}")
    SysUser findByEmail(@Param("email") String email);

    @Update("UPDATE sys_user SET password = #{password}, update_time = NOW() WHERE id = #{id}")
    int updatePassword(@Param("id") Long id, @Param("password") String password);

    @Select("SELECT id, username, nickname, avatar, email, phone, role, status, create_time, update_time " +
            "FROM sys_user ORDER BY create_time DESC")
    List<SysUser> findAll();

    @Insert("INSERT INTO sys_user (username, password, nickname, email, role, status) " +
            "VALUES (#{username}, #{password}, #{nickname}, #{email}, #{role}, 1)")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(SysUser user);

    @Update("UPDATE sys_user SET nickname = #{nickname}, avatar = #{avatar}, email = #{email}, " +
            "phone = #{phone}, update_time = NOW() WHERE id = #{id}")
    int update(SysUser user);

    @Update("UPDATE sys_user SET username = #{username}, nickname = #{nickname}, email = #{email}, " +
            "phone = #{phone}, role = #{role}, status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateAdmin(SysUser user);

    @Delete("DELETE FROM sys_user WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
