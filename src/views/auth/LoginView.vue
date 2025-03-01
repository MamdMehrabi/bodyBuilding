<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'لطفا ایمیل و رمز عبور را وارد کنید'
    return
  }
  
  loading.value = true
  const result = await authStore.login(email.value, password.value)
  loading.value = false
  
  if (result.success) {
    const redirectPath = route.query.redirect as string || '/'
    router.push(redirectPath)
  } else {
    errorMessage.value = result.error || 'خطا در ورود به سیستم'
  }
}
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
          <v-card-title class="text-center text-h4 mb-4">
            ورود به حساب کاربری
          </v-card-title>
          
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
          
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="ایمیل"
              type="email"
              required
              variant="outlined"
              prepend-inner-icon="mdi-email"
            ></v-text-field>
            
            <v-text-field
              v-model="password"
              label="رمز عبور"
              :type="showPassword ? 'text' : 'password'"
              required
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
            
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              class="mt-4"
            >
              ورود
            </v-btn>
          </v-form>
          
          <div class="text-center mt-4">
            <p>
              حساب کاربری ندارید؟
              <router-link to="/register">ثبت نام کنید</router-link>
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>