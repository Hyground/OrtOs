package com.ortos.api.modules.appointments;

import com.ortos.api.modules.staff.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class NotificationServiceTest {
    private NotificationRepository notifications;
    private UsuarioRepository users;
    private NotificationService service;

    @BeforeEach
    void setUp() {
        notifications = mock(NotificationRepository.class);
        users = mock(UsuarioRepository.class);
        service = new NotificationService(notifications, users);
    }

    @Test
    void createsAppointmentNotificationWhenPatientHasUser() {
        UUID appointmentId = UUID.randomUUID();
        when(users.findUserIdByPatientId("patient-1")).thenReturn(Optional.of("user-1"));

        service.notifyAppointment("patient-1", appointmentId, NotificationType.APPOINTMENT_CREATED);

        ArgumentCaptor<Notification> saved = ArgumentCaptor.forClass(Notification.class);
        verify(notifications).save(saved.capture());
        assertEquals("user-1", saved.getValue().getUserId());
        assertEquals(appointmentId, saved.getValue().getAppointmentId());
        assertEquals(NotificationType.APPOINTMENT_CREATED, saved.getValue().getType());
    }

    @Test
    void doesNotCreateNotificationWhenPatientHasNoUser() {
        when(users.findUserIdByPatientId("patient-1")).thenReturn(Optional.empty());

        service.notifyAppointment("patient-1", UUID.randomUUID(), NotificationType.APPOINTMENT_CREATED);

        verify(notifications, never()).save(any());
    }

    @Test
    void getsUnreadNotificationsForUser() {
        when(users.existsById("user-1")).thenReturn(true);
        Notification notification = notification(false);
        when(notifications.findByUserIdAndIsReadOrderByCreatedAtDesc("user-1", false)).thenReturn(List.of(notification));

        assertEquals(1, service.findByUser("user-1", false).size());
    }

    @Test
    void marksNotificationReadIdempotently() {
        Notification notification = notification(false);
        when(notifications.findById(notification.getId())).thenReturn(Optional.of(notification));

        service.markRead(notification.getId());
        service.markRead(notification.getId());

        assertEquals(true, notification.isRead());
        verify(notifications, times(1)).save(notification);
    }

    @Test
    void marksAllUnreadNotificationsRead() {
        when(users.existsById("user-1")).thenReturn(true);

        service.markAllRead("user-1");

        verify(notifications).markAllRead(eq("user-1"), any(OffsetDateTime.class));
    }

    @Test
    void deletesOnlyNotification() {
        Notification notification = notification(true);
        when(notifications.findById(notification.getId())).thenReturn(Optional.of(notification));

        service.delete(notification.getId());

        verify(notifications).delete(notification);
    }

    private Notification notification(boolean read) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID()); notification.setUserId("user-1"); notification.setRead(read);
        notification.setCreatedAt(OffsetDateTime.of(2026, 9, 24, 10, 0, 0, 0, ZoneOffset.UTC));
        return notification;
    }
}
