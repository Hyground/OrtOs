package com.wave.gt.ortos.core

import androidx.annotation.IdRes
import androidx.navigation.NavController

fun NavController.navigateTo(@IdRes destinationId: Int) {
    if (currentDestination?.id != destinationId) navigate(destinationId)
}
