package com.agentoffice.mapper;

import com.agentoffice.entity.OfficeDesk;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface OfficeDeskMapper {

    @Select("SELECT * FROM office_desk ORDER BY row_num, col_num")
    List<OfficeDesk> findAll();

    @Select("SELECT * FROM office_desk WHERE id = #{id}")
    OfficeDesk findById(@Param("id") Long id);

    @Select("SELECT * FROM office_desk WHERE employee_id = #{employeeId}")
    OfficeDesk findByEmployeeId(@Param("employeeId") Long employeeId);

    @Insert("INSERT INTO office_desk (desk_code, row_num, col_num, status) " +
            "VALUES (#{deskCode}, #{rowNum}, #{colNum}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(OfficeDesk desk);

    @Update("UPDATE office_desk SET employee_id = #{employeeId}, status = #{status} WHERE id = #{id}")
    int updateEmployee(@Param("id") Long id, @Param("employeeId") Long employeeId, @Param("status") Integer status);

    @Select("SELECT MAX(row_num) FROM office_desk")
    Integer findMaxRow();

    @Select("SELECT MAX(col_num) FROM office_desk WHERE row_num = #{rowNum}")
    Integer findMaxCol(@Param("rowNum") Integer rowNum);
}
