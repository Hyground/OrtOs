package com.ortos.api.security;

public record AuthenticatedUser(String id, String email, String displayName, String role, String patientId) {
    public boolean isAdmin() {
        return "admin".equals(role);
    }

    public boolean isOdontologo() {
        return "odontologo".equals(role);
    }

    public boolean isAsistente() {
        return "asistente".equals(role);
    }

    public boolean isPaciente() {
        return "paciente".equals(role);
    }

    public boolean ownsPatient(String patientId) {
        return isPaciente() && patientId != null && patientId.equals(this.patientId);
    }
}
