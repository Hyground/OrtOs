package com.ortos.api.modules.staff;

import com.ortos.api.shared.exception.ApiException;
import java.util.regex.Pattern;

final class StaffValidation {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private StaffValidation() {}

    static String text(String value, String field, boolean required) {
        return text(value, field, Integer.MAX_VALUE, required);
    }

    static String text(String value, String field, int max, boolean required) {
        String result = value == null ? null : value.trim();
        if (result == null || result.isEmpty()) {
            if (required) throw ApiException.badRequest("El campo " + field + " es obligatorio.");
            return null;
        }
        if (result.length() > max) throw ApiException.badRequest("El campo " + field + " admite hasta " + max + " caracteres.");
        return result;
    }

    static String email(String value, boolean required) {
        String result = text(value, "correo", 254, required);
        if (result != null && !EMAIL.matcher(result).matches()) throw ApiException.badRequest("Ingresa un correo válido.");
        return result == null ? null : result.toLowerCase(java.util.Locale.ROOT);
    }
}
