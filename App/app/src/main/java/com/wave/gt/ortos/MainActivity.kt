package com.wave.gt.ortos

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.activity.enableEdgeToEdge
import androidx.annotation.OptIn
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.onNavDestinationSelected
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.wave.gt.ortos.auth.ui.AuthActivity
import com.wave.gt.ortos.core.navigateTo
import com.google.android.material.badge.BadgeDrawable
import com.google.android.material.badge.BadgeUtils
import com.google.android.material.badge.ExperimentalBadgeUtils
import com.wave.gt.ortos.databinding.ActivityMainBinding

@OptIn(markerClass = [ExperimentalBadgeUtils::class])
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var navController: NavController

    private var notificacionesBadge: BadgeDrawable? = null
    private var notificacionesCount: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        appBarConfiguration = AppBarConfiguration(
            setOf(R.id.nav_home, R.id.nav_cita, R.id.nav_pagos, R.id.nav_chat, R.id.nav_perfil),
            binding.drawerLayout
        )

        setupActionBarWithNavController(navController, appBarConfiguration)
        binding.navView.setupWithNavController(navController)
        binding.navView.setNavigationItemSelectedListener { item ->
            if (item.itemId == R.id.nav_logout) {
                logout()
                true
            } else {
                val handled = item.onNavDestinationSelected(navController)
                if (handled) binding.drawerLayout.closeDrawers()
                handled
            }
        }
    }

    private fun logout() {
        (application as OrtosApplication).container.sessionManager.clear()
        binding.drawerLayout.closeDrawers()
        startActivity(
            Intent(this, AuthActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        )
        finish()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_toolbar, menu)

        val badge = notificacionesBadge ?: BadgeDrawable.create(this).also {
            notificacionesBadge = it
        }
        binding.toolbar.post {
            BadgeUtils.attachBadgeDrawable(badge, binding.toolbar, R.id.action_notificaciones)
            applyNotificacionesCount()
        }
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_chat -> {
                navController.navigateTo(R.id.nav_chat)
                true
            }
            R.id.action_notificaciones -> {
                navController.navigateTo(R.id.nav_notificaciones)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

    fun setNotificacionesCount(count: Int) {
        notificacionesCount = count.coerceAtLeast(0)
        applyNotificacionesCount()
    }

    private fun applyNotificacionesCount() {
        notificacionesBadge?.apply {
            isVisible = notificacionesCount > 0
            number = notificacionesCount
        }
    }

    override fun onDestroy() {
        notificacionesBadge?.let {
            BadgeUtils.detachBadgeDrawable(it, binding.toolbar, R.id.action_notificaciones)
        }
        notificacionesBadge = null
        super.onDestroy()
    }
}
