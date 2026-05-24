package com.agentoffice.mapper;

import com.agentoffice.entity.WorkProduct;
import com.agentoffice.service.UserScope;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface WorkProductMapper {

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "WHERE wp.employee_id = #{employeeId} AND (#{userId} IS NULL OR wp.user_id = #{userId}) " +
            "ORDER BY wp.update_time DESC")
    List<WorkProduct> findByEmployeeIdForUser(@Param("employeeId") Long employeeId, @Param("userId") Long userId);

    default List<WorkProduct> findByEmployeeId(Long employeeId) {
        return findByEmployeeIdForUser(employeeId, UserScope.getUserId());
    }

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "WHERE (#{userId} IS NULL OR wp.user_id = #{userId}) " +
            "ORDER BY wp.update_time DESC")
    List<WorkProduct> findAllForUser(@Param("userId") Long userId);

    default List<WorkProduct> findAll() {
        return findAllForUser(UserScope.getUserId());
    }

    @Insert("INSERT INTO work_product (user_id, employee_id, task_id, name, product_type, status, file_url, content) " +
            "VALUES (#{userId}, #{employeeId}, #{taskId}, #{name}, #{productType}, #{status}, #{fileUrl}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(WorkProduct product);

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "WHERE wp.product_type LIKE CONCAT('%', #{typeKeyword}, '%') AND (#{userId} IS NULL OR wp.user_id = #{userId}) " +
            "ORDER BY wp.update_time DESC LIMIT 1")
    WorkProduct findLatestByTypeForUser(@Param("typeKeyword") String typeKeyword, @Param("userId") Long userId);

    default WorkProduct findLatestByType(String typeKeyword) {
        return findLatestByTypeForUser(typeKeyword, UserScope.getUserId());
    }

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "WHERE wp.file_url = #{fileUrl} AND (#{userId} IS NULL OR wp.user_id = #{userId}) " +
            "ORDER BY wp.update_time DESC, wp.id DESC LIMIT 1")
    WorkProduct findByFileUrlForUser(@Param("fileUrl") String fileUrl, @Param("userId") Long userId);

    default WorkProduct findByFileUrl(String fileUrl) {
        return findByFileUrlForUser(fileUrl, UserScope.getUserId());
    }

    @Update("UPDATE work_product SET status = #{status}, content = #{content}, update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    int updateStatusForUser(@Param("id") Long id, @Param("status") String status, @Param("content") String content, @Param("userId") Long userId);

    default int updateStatus(Long id, String status, String content) {
        return updateStatusForUser(id, status, content, UserScope.getUserId());
    }

    @Update("UPDATE work_product SET employee_id = #{employeeId}, task_id = #{taskId}, name = #{name}, product_type = #{productType}, " +
            "status = #{status}, file_url = #{fileUrl}, content = #{content}, update_time = NOW() WHERE id = #{id} AND (#{userId} IS NULL OR user_id = #{userId})")
    int update(WorkProduct product);

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "WHERE wp.product_type LIKE CONCAT('%', #{typeKeyword}, '%') " +
            "AND wp.task_id = #{taskId} " +
            "AND (#{userId} IS NULL OR wp.user_id = #{userId}) " +
            "ORDER BY wp.update_time DESC LIMIT 1")
    WorkProduct findLatestByTypeAndTaskIdForUser(@Param("typeKeyword") String typeKeyword, @Param("taskId") Long taskId, @Param("userId") Long userId);

    default WorkProduct findLatestByTypeAndTaskId(String typeKeyword, Long taskId) {
        return findLatestByTypeAndTaskIdForUser(typeKeyword, taskId, UserScope.getUserId());
    }
}
