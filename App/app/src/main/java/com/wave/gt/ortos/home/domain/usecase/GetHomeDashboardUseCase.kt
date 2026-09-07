package com.wave.gt.ortos.home.domain.usecase

import com.wave.gt.ortos.home.domain.HomeDashboard
import com.wave.gt.ortos.home.domain.HomeRepository

class GetHomeDashboardUseCase(
    private val repository: HomeRepository
) {

    suspend operator fun invoke(): HomeDashboard = repository.getDashboard()
}
