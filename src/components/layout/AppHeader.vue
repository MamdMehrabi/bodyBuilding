<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(false)

const isLoggedIn = computed(() => !!authStore.user)
const userRole = computed(() => authStore.profile?.role || '')

const handleLogout = async () => {
  await authStore.logout()
  drawer.value = false
}

const navigateTo = (route: string) => {
  router.push(route)
  drawer.value = false
}
</script>

<template>
  <div>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white">
          باشگاه یاب
        </router-link>
      </v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn icon @click="navigateTo('/clubs')">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      
      <template v-if="isLoggedIn">
        <v-btn icon @click="navigateTo('/profile')">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>
      <template v-else>
        <v-btn variant="text" @click="navigateTo('/login')">
          ورود
        </v-btn>
      </template>
    </v-app-bar>
    
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item title="باشگاه یاب" prepend-icon="mdi-home" @click="navigateTo('/')"></v-list-item>
        <v-list-item title="جستجوی باشگاه" prepend-icon="mdi-magnify" @click="navigateTo('/clubs')"></v-list-item>
        
        <v-divider></v-divider>
        
        <template v-if="isLoggedIn">
          <v-list-item title="پروفایل" prepend-icon="mdi-account" @click="navigateTo('/profile')"></v-list-item>
          
          <template v-if="userRole === 'club_owner'">
            <v-list-item title="داشبورد مدیریت باشگاه" prepend-icon="mdi-view-dashboard" @click="navigateTo('/club-owner')"></v-list-item>
            <v-list-item title="افزودن باشگاه جدید" prepend-icon="mdi-plus" @click="navigateTo('/club-owner/add-club')"></v-list-item>
          </template>
          
          <template v-if="userRole === 'admin'">
            <v-list-item title="داشبورد مدیریت" prepend-icon="mdi-view-dashboard" @click="navigateTo('/admin')"></v-list-item>
            <v-list-item title="تایید باشگاه‌ها" prepend-icon="mdi-check-decagram" @click="navigateTo('/admin/club-approvals')"></v-list-item>
          </template>
          
          <v-list-item title="خروج" prepend-icon="mdi-logout" @click="handleLogout"></v-list-item>
        </template>
        <template v-else>
          <v-list-item title="ورود" prepend-icon="mdi-login" @click="navigateTo('/login')"></v-list-item>
          <v-list-item title="ثبت نام" prepend-icon="mdi-account-plus" @click="navigateTo('/register')"></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>