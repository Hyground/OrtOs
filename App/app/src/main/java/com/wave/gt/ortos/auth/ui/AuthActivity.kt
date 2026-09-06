package com.wave.gt.ortos.auth.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.wave.gt.ortos.MainActivity
import com.wave.gt.ortos.OrtosApplication
import com.wave.gt.ortos.R

class AuthActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val container = (application as OrtosApplication).container
        if (container.sessionManager.isLoggedIn) {
            goToMain()
            return
        }

        setContentView(R.layout.activity_auth)
    }

    fun onAuthenticated() = goToMain()

    private fun goToMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
