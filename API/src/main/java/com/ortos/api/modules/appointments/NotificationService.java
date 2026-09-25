package com.ortos.api.modules.appointments;

import com.ortos.api.modules.staff.UsuarioRepository;
import com.ortos.api.shared.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notifications;
    private final UsuarioRepository users;

    public NotificationService(NotificationRepository notifications, UsuarioRepository users) {
        this.notifications = notifications;
        this.users = users;
    }

    public List<NotificationDto> findByUser(String userId, Boolean isRead) {
        ensureUserExists(userId);
        List<Notification> result = isRead == null
                ? notifications.findByUserIdOrderByCreatedAtDesc(userId)
                : notifications.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, isRead);
        return result.stream().map(this::toDto).toList();
    }

    public List<NotificationDto> findAll() {
        return notifications.findAll().stream()
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .map(this::toDto).toList();
    }

    public NotificationDto findById(UUID id) {
        return toDto(getEntity(id));
    }

    @Transactional
    public NotificationDto markRead(UUID id) {
        Notification notification = getEntity(id);
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(now());
            notifications.save(notification);
        }
        return toDto(notification);
    }

    @Transactional
    public void markAllRead(String userId) {
        ensureUserExists(userId);
        notifications.markAllRead(userId, now());
    }

    @Transactional
    public void delete(UUID id) {
        notifications.delete(getEntity(id));
    }

    public void notifyAppointment(String patientId, UUID appointmentId, NotificationType type) {
        users.findUserIdByPatientId(patientId).ifPresent(userId -> createAutomatic(userId, appointmentId, type));
    }

    private void createAutomatic(String userId, UUID appointmentId, NotificationType type) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUserId(userId);
        notification.setAppointmentId(appointmentId);
        notification.setType(type);
        notification.setTitle(titleFor(type));
        notification.setMessage(messageFor(type));
        notification.setRead(false);
        notification.setCreatedAt(now());
        notifications.save(notification);
    }

    private Notification getEntity(UUID id) {
        return notifications.findById(id).orElseThrow(() -> ApiException.notFound("La notificación no existe."));
    }

    private void ensureUserExists(String userId) {
        if (!users.existsById(userId)) throw ApiException.badRequest("El usuario no existe.");
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    private String titleFor(NotificationType type) {
        return switch (type) {
            case APPOINTMENT_CREATED -> "Cita programada";
            case APPOINTMENT_UPDATED -> "Cita actualizada";
            case APPOINTMENT_CANCELLED -> "Cita cancelada";
            case APPOINTMENT_CONFIRMED -> "Cita confirmada";
            case GENERAL -> "Notificación";
        };
    }

    private String messageFor(NotificationType type) {
        return switch (type) {
            case APPOINTMENT_CREATED -> "Se ha programado una cita para ti.";
            case APPOINTMENT_UPDATED -> "Tu cita ha sido actualizada.";
            case APPOINTMENT_CANCELLED -> "Tu cita ha sido cancelada.";
            case APPOINTMENT_CONFIRMED -> "Tu cita ha sido confirmada.";
            case GENERAL -> "Tienes una nueva notificación.";
        };
    }

    private NotificationDto toDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId()); dto.setUserId(notification.getUserId()); dto.setAppointmentId(notification.getAppointmentId());
        dto.setType(notification.getType()); dto.setTitle(notification.getTitle()); dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead()); dto.setCreatedAt(notification.getCreatedAt()); dto.setReadAt(notification.getReadAt());
        return dto;
    }
}
