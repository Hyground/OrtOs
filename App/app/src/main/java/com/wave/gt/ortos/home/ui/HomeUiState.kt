package com.wave.gt.ortos.home.ui

data class HomeUiState(
    val isLoading: Boolean = true,
    val items: List<HomeItem> = emptyList()
)
