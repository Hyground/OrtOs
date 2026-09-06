package com.wave.gt.ortos.di

import androidx.fragment.app.Fragment
import com.wave.gt.ortos.OrtosApplication

val Fragment.appContainer: AppContainer
    get() = (requireActivity().application as OrtosApplication).container
