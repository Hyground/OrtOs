package com.wave.gt.ortos.cita.ui

import java.time.LocalTime

object CitaCatalog {
    val treatments: List<String> = listOf(
        "Control de alineadores",
        "Revision de progreso",
        "Limpieza dental",
        "Control de retenedores"
    )

    val doctors: List<String> = listOf(
        "Dra. Ana Lopez",
        "Dr. Carlos Mendez",
        "Clinica OrtOs"
    )

    val availableTimes: List<LocalTime> = listOf(
        LocalTime.of(8, 0),
        LocalTime.of(9, 30),
        LocalTime.of(11, 0),
        LocalTime.of(14, 0),
        LocalTime.of(16, 30)
    )
}