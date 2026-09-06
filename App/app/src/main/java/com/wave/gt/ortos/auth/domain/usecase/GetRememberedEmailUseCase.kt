package com.wave.gt.ortos.auth.domain.usecase

import com.wave.gt.ortos.auth.domain.AuthRepository

class GetRememberedEmailUseCase(
    private val repository: AuthRepository
) {

    operator fun invoke(): String? = repository.rememberedEmail()
}
