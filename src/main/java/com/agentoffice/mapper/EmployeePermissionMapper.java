package com.agentoffice.mapper;

import com.agentoffice.entity.EmployeePermission;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface EmployeePermissionMapper {

    @Select("SELECT * FROM employee_permission WHERE employee_id = #{employeeId} ORDER BY id")
    List<EmployeePermission> findByEmployeeId(@Param("employeeId") Long employeeId);

    @Insert("INSERT INTO employee_permission (employee_id, permission_code, permission_name, enabled) " +
            "VALUES (#{employeeId}, #{permissionCode}, #{permissionName}, #{enabled})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(EmployeePermission permission);

    @Delete("DELETE FROM employee_permission WHERE employee_id = #{employeeId}")
    int deleteByEmployeeId(@Param("employeeId") Long employeeId);
}
