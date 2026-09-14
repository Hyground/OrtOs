package com.wave.gt.ortos.cita.ui

import java.time.format.DateTimeFormatter
import java.util.Locale

object CitaFormatters {
    private val locale: Locale = Locale.forLanguageTag("es-GT")

    val month: DateTimeFormatter = DateTimeFormatter.ofPattern("MMMM yyyy", locale)
    val monthShort: DateTimeFormatter = DateTimeFormatter.ofPattern("MMM", locale)
    val shortDate: DateTimeFormatter = DateTimeFormatter.ofPattern("EEE d MMM", locale)
    val dayTitle: DateTimeFormatter = DateTimeFormatter.ofPattern("d MMMM yyyy", locale)
    val time: DateTimeFormatter = DateTimeFormatter.ofPattern("h:mm a", locale)
}