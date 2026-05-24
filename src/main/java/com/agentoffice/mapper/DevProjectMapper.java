package com.agentoffice.mapper;

import com.agentoffice.entity.DevProject;
import com.agentoffice.service.UserScope;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface DevProjectMapper {

    @Select("SELECT p.*, u.nickname as owner_name FROM dev_project p " +
            "LEFT JOIN sys_user u ON p.owner_id = u.id ORDER BY p.create_time DESC")
    List<DevProject> findAllRaw();

    @Select("SELECT p.*, u.nickname as owner_name FROM dev_project p " +
            "LEFT JOIN sys_user u ON p.owner_id = u.id WHERE (#{userId} IS NULL OR p.owner_id = #{userId}) ORDER BY p.create_time DESC")
    List<DevProject> findAllByUser(@Param("userId") Long userId);

    default List<DevProject> findAll() {
        return findAllByUser(UserScope.getUserId());
    }

    @Select("SELECT * FROM dev_project WHERE id = #{id} AND (#{userId} IS NULL OR owner_id = #{userId})")
    DevProject findByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default DevProject findById(Long id) {
        return findByIdForUser(id, UserScope.getUserId());
    }

    @Insert("INSERT INTO dev_project (project_name, description, language, owner_id, status) " +
            "VALUES (#{projectName}, #{description}, #{language}, #{ownerId}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DevProject project);

    @Update("UPDATE dev_project SET project_name = #{projectName}, description = #{description}, " +
            "language = #{language}, status = #{status}, update_time = NOW() WHERE id = #{id} AND (#{ownerId} IS NULL OR owner_id = #{ownerId})")
    int update(DevProject project);

    @Delete("DELETE FROM dev_project WHERE id = #{id} AND (#{userId} IS NULL OR owner_id = #{userId})")
    int deleteByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default int deleteById(Long id) {
        return deleteByIdForUser(id, UserScope.getUserId());
    }
}
