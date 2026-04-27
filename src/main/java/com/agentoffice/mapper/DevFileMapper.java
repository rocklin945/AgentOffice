package com.agentoffice.mapper;

import com.agentoffice.entity.DevFile;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface DevFileMapper {

    @Select("SELECT * FROM dev_file WHERE project_id = #{projectId} ORDER BY is_directory DESC, file_name")
    List<DevFile> findByProjectId(@Param("projectId") Long projectId);

    @Select("SELECT * FROM dev_file WHERE id = #{id}")
    DevFile findById(@Param("id") Long id);

    @Select("SELECT * FROM dev_file WHERE parent_id = #{parentId} ORDER BY is_directory DESC, file_name")
    List<DevFile> findByParentId(@Param("parentId") Long parentId);

    @Insert("INSERT INTO dev_file (project_id, file_name, file_path, file_type, content, parent_id, is_directory) " +
            "VALUES (#{projectId}, #{fileName}, #{filePath}, #{fileType}, #{content}, #{parentId}, #{isDirectory})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DevFile file);

    @Update("UPDATE dev_file SET content = #{content}, update_time = NOW() WHERE id = #{id}")
    int updateContent(DevFile file);

    @Update("UPDATE dev_file SET file_name = #{fileName}, file_path = #{filePath} WHERE id = #{id}")
    int updateName(DevFile file);

    @Delete("DELETE FROM dev_file WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    @Delete("DELETE FROM dev_file WHERE project_id = #{projectId}")
    int deleteByProjectId(@Param("projectId") Long projectId);
}
