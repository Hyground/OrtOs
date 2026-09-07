package com.wave.gt.ortos.home.domain

interface HomeRepository {

    suspend fun getDashboard(): HomeDashboard
}
