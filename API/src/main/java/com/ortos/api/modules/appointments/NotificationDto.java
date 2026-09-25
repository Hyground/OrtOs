package com.ortos.api.modules.appointments;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class NotificationDto {
    private UUID id;
    private String userId;
    private UUID appointmentId;
    private NotificationType type;
    private String title;
    private String message;
    private boolean isRead;
    private OffsetDateTime createdAt;
    private OffsetDateTime readAt;
}
