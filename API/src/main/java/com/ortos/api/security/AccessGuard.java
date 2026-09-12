package com.ortos.api.security;

import com.ortos.api.exception.ApiException;

public final class AccessGuard {
    private AccessGuard() {}

    public static void requireAuthenticated(AuthenticatedUser user) {
        if (user == null) throw ApiException.unauthorized("Debes iniciar sesión.");
    }

    public static void requireStaff(AuthenticatedUser user) {
        requireAuthenticated(user);
        if (!user.isAdmin() && !user.isOdontologo()) {
            throw ApiException.forbidden("No tienes permiso para realizar esta acción.");
        }
    }

    public static void requireAdmin(AuthenticatedUser user) {
        requireAuthenticated(user);
        if (!user.isAdmin()) {
            throw ApiException.forbidden("Solo un administrador puede gestionar usuarios.");
        }
    }

    /** Read access to a record scoped to a patientId: staff always, a paciente only for their own record. */
    public static void requireReadAccess(AuthenticatedUser user, String patientId) {
        requireAuthenticated(user);
        if (user.isAdmin() || user.isOdontologo()) return;
        if (user.ownsPatient(patientId)) return;
        throw ApiException.forbidden("No tienes permiso para ver esta información.");
    }

    /** Same as requireStaff, but also admits the asistente role (patients, appointments and payments only). */
    public static void requireBasicStaff(AuthenticatedUser user) {
        requireAuthenticated(user);
        if (!user.isAdmin() && !user.isOdontologo() && !user.isAsistente()) {
            throw ApiException.forbidden("No tienes permiso para realizar esta acción.");
        }
    }

    /** Same as requireReadAccess, but also admits the asistente role (patients, appointments and payments only). */
    public static void requireBasicReadAccess(AuthenticatedUser user, String patientId) {
        requireAuthenticated(user);
        if (user.isAdmin() || user.isOdontologo() || user.isAsistente()) return;
        if (user.ownsPatient(patientId)) return;
        throw ApiException.forbidden("No tienes permiso para ver esta información.");
    }
}
