package com.wave.gt.ortos

import android.app.Application
import com.wave.gt.ortos.di.AppContainer

class OrtosApplication : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
