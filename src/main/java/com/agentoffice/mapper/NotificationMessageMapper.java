package com.agentoffice.mapper;

import com.agentoffice.entity.NotificationMessage;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface NotificationMessageMapper {

    @Select("<script>" +
            "SELECT * FROM notification_message " +
            "WHERE (user_id IS NULL OR user_id = #{userId}) " +
            "<if test='readStatus != null'>AND read_status = #{readStatus} </if>" +
            "<if test='category != null and category != \"\"'>AND category = #{category} </if>" +
            "ORDER BY create_time DESC, id DESC" +
            "</script>")
    List<NotificationMessage> findList(@Param("userId") Long userId,
                                       @Param("readStatus") Integer readStatus,
                                       @Param("category") String category);

    @Insert("INSERT INTO notification_message (user_id, category, title, content, source_type, source_id, read_status, priority) " +
            "VALUES (#{userId}, #{category}, #{title}, #{content}, #{sourceType}, #{sourceId}, #{readStatus}, #{priority})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(NotificationMessage message);

    @Update("UPDATE notification_message SET read_status = 1, update_time = NOW() WHERE id = #{id} AND (user_id IS NULL OR user_id = #{userId})")
    int markRead(@Param("id") Long id, @Param("userId") Long userId);

    @Update("UPDATE notification_message SET read_status = 1, update_time = NOW() WHERE read_status = 0 AND (user_id IS NULL OR user_id = #{userId})")
    int markAllRead(@Param("userId") Long userId);

    @Delete("DELETE FROM notification_message WHERE id = #{id} AND (user_id IS NULL OR user_id = #{userId})")
    int deleteById(@Param("id") Long id, @Param("userId") Long userId);
}
