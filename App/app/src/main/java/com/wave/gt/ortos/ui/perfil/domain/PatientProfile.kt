package com.wave.gt.ortos.ui.perfil.domain

data class PatientProfile(
    val patientId: String,
    val fullName: String,
    val dpi: String,
    val birthDate: String,
    val phone: String,
    val contactEmail: String,
    val address: String,
    val municipality: String,
    val accessEmail: String,
    val folio: String,
    val status: String
) {
    val initials: String
        get() = fullName
            .split(Regex("\\s+"))
            .filter(String::isNotBlank)
            .take(2)
            .mapNotNull { it.firstOrNull()?.uppercase() }
            .joinToString("")
}
