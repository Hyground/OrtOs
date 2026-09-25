package com.ortos.api.modules.appointments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, boolean isRead);

    @Modifying
    @Query("update Notification n set n.isRead = true, n.readAt = :readAt where n.userId = :userId and n.isRead = false")
    int markAllRead(@Param("userId") String userId, @Param("readAt") OffsetDateTime readAt);
}
