package com.agentoffice.mapper;

import com.agentoffice.entity.DevProject;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface DevProjectMapper {

    @Select("SELECT p.*, u.nickname as owner_name FROM dev_project p " +
            "LEFT JOIN sys_user u ON p.owner_id = u.id ORDER BY p.create_time DESC")
    List<DevProject> findAll();

    @Select("SELECT * FROM dev_project WHERE id = #{id}")
    DevProject findById(@Param("id") Long id);

    @Insert("INSERT INTO dev_project (project_name, description, language, owner_id, status) " +
            "VALUES (#{projectName}, #{description}, #{language}, #{ownerId}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DevProject project);

    @Update("UPDATE dev_project SET project_name = #{projectName}, description = #{description}, " +
            "language = #{language}, status = #{status}, update_time = NOW() WHERE id = #{id}")
    int update(DevProject project);

    @Delete("DELETE FROM dev_project WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
