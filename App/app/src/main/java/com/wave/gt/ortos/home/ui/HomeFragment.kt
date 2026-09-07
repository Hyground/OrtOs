package com.wave.gt.ortos.home.ui

import android.os.Bundle
import android.view.View
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.material.snackbar.Snackbar
import com.wave.gt.ortos.R
import com.wave.gt.ortos.core.navigateTo
import com.wave.gt.ortos.databinding.FragmentHomeBinding
import com.wave.gt.ortos.di.ViewModelFactory
import com.wave.gt.ortos.di.appContainer
import com.wave.gt.ortos.home.domain.Promotion
import kotlinx.coroutines.launch

class HomeFragment : Fragment(R.layout.fragment_home), HomeActions {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val viewModel: HomeViewModel by viewModels {
        ViewModelFactory { HomeViewModel(appContainer.getHomeDashboardUseCase) }
    }

    private val homeAdapter by lazy { HomeAdapter(this) }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentHomeBinding.bind(view)
        binding.recyclerHome.adapter = homeAdapter
        observeState()
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    binding.progress.isVisible = state.isLoading
                    homeAdapter.submitList(state.items)
                }
            }
        }
    }

    override fun onOpenTreatment() = findNavController().navigateTo(R.id.nav_cita)

    override fun onOpenAppointments() = findNavController().navigateTo(R.id.nav_cita)

    override fun onOpenPayments() = findNavController().navigateTo(R.id.nav_pagos)

    override fun onPromotionClick(promotion: Promotion) {
        Snackbar.make(binding.root, promotion.title, Snackbar.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        binding.recyclerHome.adapter = null
        _binding = null
        super.onDestroyView()
    }
}
