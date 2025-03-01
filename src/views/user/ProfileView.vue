<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getSupabaseClient } from '../../services/supabase'

const router = useRouter()
const authStore = useAuthStore()
const supabase = getSupabaseClient()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const userProfile = ref({
  full_name: '',
  avatar_url: '',
  favorite_sports: [] as string[]
})

const bookings = ref<any[]>([])
const reviews = ref<any[]>([])

const sports = [
  'فوتبال',
  'بسکتبال',
  'والیبال',
  'شنا',
  'بدنسازی',
  'یوگا',
  'کشتی',
  'تنیس'
]

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  await fetchUserData()
})

const fetchUserData = async () => {
  try {
    loading.value = true
    
    // Get user profile
    if (authStore.profile) {
      userProfile.value = {
        full_name: authStore.profile.full_name || '',
        avatar_url: authStore.profile.avatar_url || '',
        favorite_sports: authStore.profile.favorite_sports || []
      }
    }
    
    // Get user bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        clubs:clubs(id, name, city, images)
      `)
      .eq('user_id', authStore.user?.id)
      .order('created_at', { ascending: false })
    
    if (bookingsError) throw bookingsError
    
    bookings.value = bookingsData || []
    
    // Get user reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        clubs:clubs(id, name, city, images)
      `)
      .eq('user_id', authStore.user?.id)
      .order('created_at', { ascending: false })
    
    if (reviewsError) throw reviewsError
    
    reviews.value = reviewsData || []
  } catch (err) {
    console.error('Error fetching user data:', err)
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  if (!authStore.user) return
  
  try {
    saving.value = true
    error.value = null
    success.value = null
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: userProfile.value.full_name,
        favorite_sports: userProfile.value.favorite_sports
      })
      .eq('user_id', authStore.user.id)
    
    if (updateError) throw updateError
    
    // Update local state
    if (authStore.profile) {
      authStore.profile.full_name = userProfile.value.full_name
      authStore.profile.favorite_sports = userProfile.value.favorite_sports
    }
    
    success.value = 'پروفایل با موفقیت بروزرسانی شد'
  } catch (err: any) {
    console.error('Error updating profile:', err)
    error.value = 'خطا در بروزرسانی پروفایل'
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-6">پروفایل کاربری</h1>
    
    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-10">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">در حال بارگذاری...</p>
      </v-col>
    </v-row>
    
    <v-row v-else>
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-text class="text-center">
            <v-avatar size="100" color="primary">
              <v-img
                v-if="userProfile.avatar_url"
                :src="userProfile.avatar_url"
              ></v-img>
              <span v-else class="text-h4 text-white">
                {{ userProfile.full_name.charAt(0) }}
              </span>
            </v-avatar>
            
            <h2 class="text-h5 mt-4">{{ userProfile.full_name }}</h2>
            <p class="text-subtitle-1">{{ authStore.user?.email }}</p>
            
            <v-chip
              :color="authStore.profile?.role === 'admin' ? 'error' : authStore.profile?.role === 'club_owner' ? 'warning' : 'success'"
              class="mt-2"
            >
              {{ authStore.profile?.role === 'admin' ? 'مدیر' : authStore.profile?.role === 'club_owner' ? 'صاحب باشگاه' : 'کاربر' }}
            </v-chip>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions>
            <v-btn
              block
              color="error"
              variant="outlined"
              prepend-icon="mdi-logout"
              @click="handleLogout"
            >
              خروج از حساب کاربری
            </v-btn>
          </v-card-actions>
        </v-card>
        
        <v-card>
          <v-card-title>ویرایش پروفایل</v-card-title>
          
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>
            
            <v-alert
              v-if="success"
              type="success"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="success = null"
            >
              {{ success }}
            </v-alert>
            
            <v-form @submit.prevent="updateProfile">
              <v-text-field
                v-model="userProfile.full_name"
                label="نام و نام خانوادگی"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              
              <v-select
                v-model="userProfile.favorite_sports"
                :items="sports"
                label="ورزش‌های مورد علاقه"
                variant="outlined"
                multiple
                chips
                class="mb-4"
              ></v-select>
              
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="saving"
              >
                بروزرسانی پروفایل
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-tabs v-model="tab">
          <v-tab value="bookings">رزروهای من</v-tab>
          <v-tab value="reviews">نظرات من</v-tab>
        </v-tabs>
        
        <v-window v-model="tab">
          <!-- Bookings Tab -->
          <v-window-item value="bookings">
            <v-card>
              <v-card-text>
                <div v-if="bookings.length === 0" class="text-center py-5">
                  <v-icon size="large" color="grey">mdi-calendar-blank</v-icon>
                  <p class="mt-2">شما هنوز رزروی انجام نداده‌اید</p>
                  <v-btn
                    color="primary"
                    class="mt-2"
                    @click="router.push('/clubs')"
                  >
                    جستجوی باشگاه
                  </v-btn>
                </div>
                
                <v-list v-else>
                  <v-list-item
                    v-for="booking in bookings"
                    :key="booking.id"
                    :title="booking.clubs?.name || 'باشگاه'"
                    :subtitle="`تاریخ: ${new Date(booking.date).toLocaleDateString('fa-IR')}`"
                  >
                    <template v-slot:prepend>
                      <v-avatar rounded>
                        <v-img
                          :src="booking.clubs?.images?.[0] || 'https://via.placeholder.com/100?text=No+Image'"
                        ></v-img>
                      </v-avatar>
                    </template>
                    
                    <template v-slot:append>
                      <v-chip
                        :color="booking.status === 'approved' ? 'success' : booking.status === 'rejected' ? 'error' : 'warning'"
                        size="small"
                        class="me-2"
                      >
                        {{ booking.status === 'approved' ? 'تایید شده' : booking.status === 'rejected' ? 'رد شده' : 'در انتظار' }}
                      </v-chip>
                      
                      <v-btn
                        icon="mdi-eye"
                        color="primary"
                        size="small"
                        variant="text"
                        @click="router.push(`/clubs/${booking.club_id}`)"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-window-item>
          
          <!-- Reviews Tab -->
          <v-window-item value="reviews">
            <v-card>
              <v-card-text>
                <div v-if="reviews.length === 0" class="text-center py-5">
                  <v-icon size="large" color="grey">mdi-comment-outline</v-icon>
                  <p class="mt-2">شما هنوز نظری ثبت نکرده‌اید</p>
                  <v-btn
                    color="primary"
                    class="mt-2"
                    @click="router.push('/clubs')"
                  >
                    جستجوی باشگاه
                  </v-btn>
                </div>
                
                <v-list v-else>
                  <v-list-item
                    v-for="review in reviews"
                    :key="review.id"
                    :title="review.clubs?.name || 'باشگاه'"
                    :subtitle="`تاریخ: ${new Date(review.created_at).toLocaleDateString('fa-IR')}`"
                  >
                    <template v-slot:prepend>
                      <v-avatar rounded>
                        <v-img
                          :src="review.clubs?.images?.[0] || 'https://via.placeholder.com/100?text=No+Image'"
                        ></v-img>
                      </v-avatar>
                    </template>
                    
                    <v-list-item-text>
                      <div class="d-flex align-center mb-2">
                        <v-rating
                          :model-value="review.rating"
                          color="amber"
                          density="compact"
                          size="small"
                          readonly
                        ></v-rating>
                      </div>
                      <p>{{ review.comment }}</p>
                    </v-list-item-text>
                    
                    <template v-slot:append>
                      <v-btn
                        icon="mdi-eye"
                        color="primary"
                        size="small"
                        variant="text"
                        @click="router.push(`/clubs/${review.club_id}`)"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default {
  data() {
    return {
      tab: 'bookings'
    }
  }
}
</script>