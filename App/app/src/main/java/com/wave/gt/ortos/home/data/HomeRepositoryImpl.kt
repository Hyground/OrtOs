package com.wave.gt.ortos.home.data

import com.wave.gt.ortos.home.data.local.LocalHomeDataSource
import com.wave.gt.ortos.home.domain.HomeDashboard
import com.wave.gt.ortos.home.domain.HomeRepository

class HomeRepositoryImpl(
    private val local: LocalHomeDataSource
) : HomeRepository {

    override suspend fun getDashboard(): HomeDashboard = local.getDashboard()
}
