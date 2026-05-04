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

    @Select("SELECT * FROM sys_user ORDER BY create_time DESC")
    List<SysUser> findAll();

    @Insert("INSERT INTO sys_user (username, password, nickname, email, status) " +
            "VALUES (#{username}, #{password}, #{nickname}, #{email}, 1)")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(SysUser user);

    @Update("UPDATE sys_user SET nickname = #{nickname}, avatar = #{avatar}, email = #{email}, " +
            "phone = #{phone}, update_time = NOW() WHERE id = #{id}")
    int update(SysUser user);

    @Update("UPDATE sys_user SET username = #{username}, nickname = #{nickname}, email = #{email}, " +
            "phone = #{phone}, status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateAdmin(SysUser user);

    @Delete("DELETE FROM sys_user WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
