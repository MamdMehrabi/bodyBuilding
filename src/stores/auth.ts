import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSupabaseClient } from '../services/supabase'
import type { User } from '@supabase/supabase-js'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const supabase = getSupabaseClient()

  async function initializeAuth() {
    try {
      loading.value = true
      
      // Check if user is already logged in
      const { data } = await supabase.auth.getSession()
      
      if (data.session) {
        user.value = data.session.user
        await fetchUserProfile()
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchUserProfile() {
    if (!user.value) return

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (profileError) throw profileError
      profile.value = data
    } catch (err: any) {
      console.error('Error fetching profile:', err.message)
    }
  }

  async function register(email: string, password: string, fullName: string, role: string) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (signUpError) throw signUpError
      
      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          full_name: fullName,
          role: role
        })
        
        if (profileError) throw profileError
        
        user.value = data.user
        await fetchUserProfile()
        
        return { success: true }
      }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) throw signInError
      
      user.value = data.user
      await fetchUserProfile()
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError
      
      user.value = null
      profile.value = null
      
      router.push('/')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    initializeAuth,
    register,
    login,
    logout,
    fetchUserProfile
  }
})