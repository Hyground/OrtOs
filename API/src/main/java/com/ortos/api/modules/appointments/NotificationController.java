package com.ortos.api.modules.appointments;

import com.ortos.api.shared.exception.ApiException;
import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.AuthenticatedUser;
import com.ortos.api.shared.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<NotificationDto> all() {
        AuthenticatedUser user = authenticated();
        return user.isAdmin() ? service.findAll() : service.findByUser(user.id(), null);
    }

    @GetMapping("/{id}")
    public NotificationDto one(@PathVariable UUID id) {
        NotificationDto notification = service.findById(id);
        requireOwnerOrAdmin(notification.getUserId());
        return notification;
    }

    @GetMapping("/user/{userId}")
    public List<NotificationDto> byUser(@PathVariable String userId, @RequestParam(required = false) Boolean read) {
        requireOwnerOrAdmin(userId);
        return service.findByUser(userId, read);
    }

    @GetMapping("/user/{userId}/unread")
    public List<NotificationDto> unread(@PathVariable String userId) {
        requireOwnerOrAdmin(userId);
        return service.findByUser(userId, false);
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markRead(@PathVariable UUID id) {
        NotificationDto notification = service.findById(id);
        requireOwnerOrAdmin(notification.getUserId());
        return service.markRead(id);
    }

    @PatchMapping("/user/{userId}/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@PathVariable String userId) {
        requireOwnerOrAdmin(userId);
        service.markAllRead(userId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        NotificationDto notification = service.findById(id);
        requireOwnerOrAdmin(notification.getUserId());
        service.delete(id);
    }

    private AuthenticatedUser authenticated() {
        AuthenticatedUser user = CurrentUser.get();
        AccessGuard.requireAuthenticated(user);
        return user;
    }

    private void requireOwnerOrAdmin(String userId) {
        AuthenticatedUser user = authenticated();
        if (!user.isAdmin() && !user.id().equals(userId)) {
            throw ApiException.forbidden("No tienes permiso para ver estas notificaciones.");
        }
    }
}
