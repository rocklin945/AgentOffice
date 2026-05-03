package com.agentoffice.mapper;

import com.agentoffice.entity.TaskStep;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface TaskStepMapper {

    @Select("SELECT * FROM task_step WHERE task_id = #{taskId} ORDER BY step_order")
    List<TaskStep> findByTaskId(@Param("taskId") Long taskId);

    @Select("SELECT * FROM task_step WHERE id = #{id}")
    TaskStep findById(@Param("id") Long id);

    @Insert("<script>" +
            "INSERT INTO task_step (task_id, step_name, step_order, status) VALUES " +
            "<foreach collection='steps' item='step' separator=','>" +
            "(#{taskId}, #{step}, #{stepOrder}, '待处理')" +
            "</foreach>" +
            "</script>")
    int insertBatch(@Param("taskId") Long taskId,
                    @Param("steps") List<String> steps,
                    @Param("stepOrder") int stepOrder);

    @Insert("INSERT INTO task_step (task_id, step_name, step_order, status) " +
            "VALUES (#{taskId}, #{stepName}, #{stepOrder}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TaskStep step);

    @Update("UPDATE task_step SET status = #{status}, complete_time = CASE WHEN #{status} = '已完成' THEN NOW() ELSE complete_time END WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Delete("DELETE FROM task_step WHERE task_id = #{taskId}")
    int deleteByTaskId(@Param("taskId") Long taskId);
}
