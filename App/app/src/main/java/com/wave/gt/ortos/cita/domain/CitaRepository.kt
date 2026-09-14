package com.wave.gt.ortos.cita.domain

interface CitaRepository {
    suspend fun getMyAppointments(): List<PatientAppointment>
}