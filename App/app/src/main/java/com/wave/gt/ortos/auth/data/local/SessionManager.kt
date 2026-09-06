package com.wave.gt.ortos.auth.data.local

import android.content.Context
import androidx.core.content.edit
import com.wave.gt.ortos.auth.domain.AuthProvider
import com.wave.gt.ortos.auth.domain.AuthUser

class SessionManager(context: Context) {

    private val prefs = context.applicationContext
        .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    val isLoggedIn: Boolean
        get() = prefs.getBoolean(KEY_LOGGED_IN, false)

    val rememberedEmail: String?
        get() = prefs.getString(KEY_REMEMBERED_EMAIL, null)

    fun save(user: AuthUser) {
        prefs.edit {
            putBoolean(KEY_LOGGED_IN, true)
            putString(KEY_ID, user.id)
            putString(KEY_EMAIL, user.email)
            putString(KEY_NAME, user.displayName)
            putString(KEY_PROVIDER, user.provider.name)
        }
    }

    fun setRememberedEmail(email: String?) {
        prefs.edit {
            if (email.isNullOrBlank()) remove(KEY_REMEMBERED_EMAIL) else putString(KEY_REMEMBERED_EMAIL, email)
        }
    }

    fun currentUser(): AuthUser? {
        if (!isLoggedIn) return null
        val id = prefs.getString(KEY_ID, null) ?: return null
        val email = prefs.getString(KEY_EMAIL, null) ?: return null
        val name = prefs.getString(KEY_NAME, null).orEmpty()
        val provider = prefs.getString(KEY_PROVIDER, null)
            ?.let { runCatching { AuthProvider.valueOf(it) }.getOrNull() }
            ?: AuthProvider.EMAIL
        return AuthUser(id = id, email = email, displayName = name, provider = provider)
    }

    fun clear() {
        prefs.edit {
            remove(KEY_LOGGED_IN)
            remove(KEY_ID)
            remove(KEY_EMAIL)
            remove(KEY_NAME)
            remove(KEY_PROVIDER)
        }
    }

    private companion object {
        const val PREFS_NAME = "ortos_session"
        const val KEY_LOGGED_IN = "logged_in"
        const val KEY_ID = "user_id"
        const val KEY_EMAIL = "user_email"
        const val KEY_NAME = "user_name"
        const val KEY_PROVIDER = "user_provider"
        const val KEY_REMEMBERED_EMAIL = "remembered_email"
    }
}
