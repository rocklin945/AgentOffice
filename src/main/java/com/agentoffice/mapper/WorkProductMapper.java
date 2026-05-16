package com.agentoffice.mapper;

import com.agentoffice.entity.WorkProduct;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface WorkProductMapper {

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "WHERE wp.employee_id = #{employeeId} " +
            "ORDER BY wp.update_time DESC")
    List<WorkProduct> findByEmployeeId(@Param("employeeId") Long employeeId);

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "ORDER BY wp.update_time DESC")
    List<WorkProduct> findAll();

    @Insert("INSERT INTO work_product (employee_id, task_id, name, product_type, status, file_url, content) " +
            "VALUES (#{employeeId}, #{taskId}, #{name}, #{productType}, #{status}, #{fileUrl}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(WorkProduct product);

    @Select("SELECT wp.*, e.name AS employee_name, t.task_name AS task_name " +
            "FROM work_product wp " +
            "LEFT JOIN agent_employee e ON wp.employee_id = e.id " +
            "LEFT JOIN task_info t ON wp.task_id = t.id " +
            "WHERE wp.product_type LIKE CONCAT('%', #{typeKeyword}, '%') " +
            "ORDER BY wp.update_time DESC LIMIT 1")
    WorkProduct findLatestByType(@Param("typeKeyword") String typeKeyword);
}
