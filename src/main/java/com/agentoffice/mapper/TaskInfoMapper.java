package com.agentoffice.mapper;

import com.agentoffice.entity.TaskInfo;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface TaskInfoMapper {

    @Select("<script>" +
            "SELECT t.*, e.name as executor_name, e.avatar as executor_avatar " +
            "FROM task_info t " +
            "LEFT JOIN agent_employee e ON t.executor_id = e.id " +
            "WHERE 1=1" +
            "<if test='status != null'> AND t.status = #{status}</if>" +
            "<if test='priority != null'> AND t.priority = #{priority}</if>" +
            "<if test='executorId != null'> AND t.executor_id = #{executorId}</if>" +
            " ORDER BY t.create_time DESC" +
            "</script>")
    List<TaskInfo> findList(@Param("status") String status,
                            @Param("priority") String priority,
                            @Param("executorId") Long executorId);

    @Select("SELECT t.*, e.name as executor_name, e.avatar as executor_avatar " +
            "FROM task_info t " +
            "LEFT JOIN agent_employee e ON t.executor_id = e.id " +
            "WHERE t.id = #{id}")
    TaskInfo findById(@Param("id") Long id);

    @Insert("INSERT INTO task_info (task_name, description, priority, executor_id, status, progress, create_user) " +
            "VALUES (#{taskName}, #{description}, #{priority}, #{executorId}, #{status}, #{progress}, #{createUser})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TaskInfo task);

    @Update("UPDATE task_info SET task_name = #{taskName}, description = #{description}, " +
            "priority = #{priority}, executor_id = #{executorId}, status = #{status}, " +
            "progress = #{progress}, update_time = NOW() WHERE id = #{id}")
    int update(TaskInfo task);

    @Delete("DELETE FROM task_info WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    @Update("UPDATE task_info SET progress = #{progress}, update_time = NOW() WHERE id = #{id}")
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress);

    @Update("UPDATE task_info SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Update("UPDATE task_info SET status = #{status}, progress = 100, end_time = NOW(), update_time = NOW() WHERE id = #{id}")
    int complete(@Param("id") Long id, @Param("status") String status);

    @Select("SELECT COUNT(*) FROM task_info")
    int countTotal();

    @Select("SELECT COUNT(*) FROM task_info WHERE status = '已完成'")
    int countCompleted();

    @Select("SELECT COUNT(*) FROM task_info WHERE status = #{status}")
    int countByStatus(@Param("status") String status);
}
