<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')
const role = ref('user') // Default role is user
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const roles = [
  { title: 'کاربر عادی', value: 'user' },
  { title: 'صاحب باشگاه', value: 'club_owner' }
]

const handleRegister = async () => {
  // Validate form
  if (!email.value || !password.value || !confirmPassword.value || !fullName.value) {
    errorMessage.value = 'لطفا تمام فیلدها را پر کنید'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'رمز عبور و تکرار آن مطابقت ندارند'
    return
  }
  
  if (password.value.length < 6) {
    errorMessage.value = 'رمز عبور باید حداقل 6 کاراکتر باشد'
    return
  }
  
  loading.value = true
  const result = await authStore.register(email.value, password.value, fullName.value, role.value)
  loading.value = false
  
  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.error || 'خطا در ثبت نام'
  }
}
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
          <v-card-title class="text-center text-h4 mb-4">
            ثبت نام
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
          
          <v-form @submit.prevent="handleRegister">
            <v-text-field
              v-model="fullName"
              label="نام و نام خانوادگی"
              required
              variant="outlined"
              prepend-inner-icon="mdi-account"
            ></v-text-field>
            
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
            
            <v-text-field
              v-model="confirmPassword"
              label="تکرار رمز عبور"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              variant="outlined"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            ></v-text-field>
            
            <v-radio-group v-model="role" inline>
              <template v-slot:label>
                <div>نوع کاربری</div>
              </template>
              <v-radio
                v-for="item in roles"
                :key="item.value"
                :label="item.title"
                :value="item.value"
              ></v-radio>
            </v-radio-group>
            
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              class="mt-4"
            >
              ثبت نام
            </v-btn>
          </v-form>
          
          <div class="text-center mt-4">
            <p>
              قبلا ثبت نام کرده‌اید؟
              <router-link to="/login">وارد شوید</router-link>
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>