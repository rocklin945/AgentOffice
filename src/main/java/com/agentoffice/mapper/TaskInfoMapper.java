package com.agentoffice.mapper;

import com.agentoffice.service.UserScope;
import com.agentoffice.entity.TaskInfo;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface TaskInfoMapper {

    @Select("<script>" +
            "SELECT t.*, e.name as executor_name, e.avatar as executor_avatar " +
            "FROM task_info t " +
            "LEFT JOIN agent_employee e ON t.executor_id = e.id " +
            "WHERE (#{userId} IS NULL OR t.create_user = #{userId})" +
            "<if test='status != null'> AND t.status = #{status}</if>" +
            "<if test='priority != null'> AND t.priority = #{priority}</if>" +
            "<if test='executorId != null'> AND t.executor_id = #{executorId}</if>" +
            " ORDER BY t.create_time DESC" +
            "</script>")
    List<TaskInfo> findListByUser(@Param("userId") Long userId,
                                  @Param("status") String status,
                                  @Param("priority") String priority,
                                  @Param("executorId") Long executorId);

    default List<TaskInfo> findList(String status, String priority, Long executorId) {
        return findListByUser(UserScope.getUserId(), status, priority, executorId);
    }

    @Select("SELECT t.*, e.name as executor_name, e.avatar as executor_avatar " +
            "FROM task_info t " +
            "LEFT JOIN agent_employee e ON t.executor_id = e.id " +
            "WHERE t.id = #{id} AND (#{userId} IS NULL OR t.create_user = #{userId})")
    TaskInfo findByIdAndUser(@Param("id") Long id, @Param("userId") Long userId);

    default TaskInfo findById(Long id) {
        return findByIdAndUser(id, UserScope.getUserId());
    }

    @Insert("INSERT INTO task_info (task_name, task_type, description, priority, executor_id, status, create_user) " +
            "VALUES (#{taskName}, #{taskType}, #{description}, #{priority}, #{executorId}, #{status}, #{createUser})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TaskInfo task);

    @Update("UPDATE task_info SET task_name = #{taskName}, task_type = #{taskType}, description = #{description}, " +
            "priority = #{priority}, executor_id = #{executorId}, status = #{status}, " +
            "update_time = NOW() WHERE id = #{id} AND (#{createUser} IS NULL OR create_user = #{createUser})")
    int update(TaskInfo task);

    @Delete("DELETE FROM task_info WHERE id = #{id} AND (#{userId} IS NULL OR create_user = #{userId})")
    int deleteByIdForUser(@Param("id") Long id, @Param("userId") Long userId);

    default int deleteById(Long id) {
        return deleteByIdForUser(id, UserScope.getUserId());
    }

    @Update("UPDATE task_info SET status = #{status}, update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR create_user = #{userId})")
    int updateStatusForUser(@Param("id") Long id, @Param("status") String status, @Param("userId") Long userId);

    default int updateStatus(Long id, String status) {
        return updateStatusForUser(id, status, UserScope.getUserId());
    }

    @Update("UPDATE task_info SET status = #{status}, end_time = NOW(), update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR create_user = #{userId})")
    int completeForUser(@Param("id") Long id, @Param("status") String status, @Param("userId") Long userId);

    default int complete(Long id, String status) {
        return completeForUser(id, status, UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM task_info WHERE (#{userId} IS NULL OR create_user = #{userId})")
    int countTotalByUser(@Param("userId") Long userId);

    default int countTotal() {
        return countTotalByUser(UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM task_info WHERE status = '已完成' AND (#{userId} IS NULL OR create_user = #{userId})")
    int countCompletedByUser(@Param("userId") Long userId);

    default int countCompleted() {
        return countCompletedByUser(UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM task_info WHERE status = #{status} AND (#{userId} IS NULL OR create_user = #{userId})")
    int countByStatusForUser(@Param("status") String status, @Param("userId") Long userId);

    default int countByStatus(String status) {
        return countByStatusForUser(status, UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM task_info WHERE executor_id = #{executorId} AND (#{userId} IS NULL OR create_user = #{userId})")
    int countByExecutorForUser(@Param("executorId") Long executorId, @Param("userId") Long userId);

    default int countByExecutor(Long executorId) {
        return countByExecutorForUser(executorId, UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM task_info WHERE DATE(create_time) = #{date} AND (#{userId} IS NULL OR create_user = #{userId})")
    int countCreatedByDateForUser(@Param("date") java.time.LocalDate date, @Param("userId") Long userId);

    default int countCreatedByDate(java.time.LocalDate date) {
        return countCreatedByDateForUser(date, UserScope.getUserId());
    }

    @Select("SELECT COUNT(*) FROM task_info WHERE status = '已完成' AND DATE(COALESCE(end_time, update_time)) = #{date} AND (#{userId} IS NULL OR create_user = #{userId})")
    int countCompletedByDateForUser(@Param("date") java.time.LocalDate date, @Param("userId") Long userId);

    default int countCompletedByDate(java.time.LocalDate date) {
        return countCompletedByDateForUser(date, UserScope.getUserId());
    }
}
