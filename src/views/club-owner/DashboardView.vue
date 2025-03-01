<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getSupabaseClient } from '../../services/supabase'

const router = useRouter()
const authStore = useAuthStore()
const supabase = getSupabaseClient()

const loading = ref(true)
const clubs = ref<any[]>([])
const bookings = ref<any[]>([])
const stats = ref({
  totalClubs: 0,
  pendingClubs: 0,
  totalBookings: 0,
  pendingBookings: 0,
  totalReviews: 0,
  averageRating: 0
})

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  await fetchData()
})

const fetchData = async () => {
  try {
    loading.value = true
    
    // Fetch owner's clubs
    const { data: clubsData, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .eq('owner_id', authStore.user?.id)
      .order('created_at', { ascending: false })
    
    if (clubsError) throw clubsError
    
    clubs.value = clubsData || []
    
    // Calculate stats
    stats.value.totalClubs = clubs.value.length
    stats.value.pendingClubs = clubs.value.filter(club => !club.is_approved).length
    
    // Fetch bookings for all clubs
    if (clubs.value.length > 0) {
      const clubIds = clubs.value.map(club => club.id)
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:profiles(full_name)
        `)
        .in('club_id', clubIds)
        .order('created_at', { ascending: false })
      
      if (bookingsError) throw bookingsError
      
      bookings.value = bookingsData || []
      
      // Update stats
      stats.value.totalBookings = bookings.value.length
      stats.value.pendingBookings = bookings.value.filter(booking => booking.status === 'pending').length
      
      // Fetch reviews stats
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .in('club_id', clubIds)
      
      if (reviewsError) throw reviewsError
      
      if (reviewsData) {
        stats.value.totalReviews = reviewsData.length
        
        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0)
          stats.value.averageRating = parseFloat((sum / reviewsData.length).toFixed(1))
        }
      }
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  } finally {
    loading.value = false
  }
}

const updateBookingStatus = async (bookingId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
    
    if (error) throw error
    
    // Update local state
    const index = bookings.value.findIndex(booking => booking.id === bookingId)
    if (index !== -1) {
      bookings.value[index].status = status
    }
    
    // Update stats
    stats.value.pendingBookings = bookings.value.filter(booking => booking.status === 'pending').length
  } catch (err) {
    console.error('Error updating booking status:', err)
  }
}
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-6">داشبورد مدیریت باشگاه</h1>
    
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
    
    <template v-else>
      <!-- Stats Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="primary">
            <v-card-text class="text-center">
              <div class="text-h3 font-weight-bold white--text">
                {{ stats.totalClubs }}
              </div>
              <div class="text-subtitle-1 white--text">
                باشگاه‌ها
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="secondary">
            <v-card-text class="text-center">
              <div class="text-h3  <v-card-text class="text-center">
              <div class="text-h3 font-weight-bold white--text">
                {{ stats.totalBookings }}
              </div>
              <div class="text-subtitle-1 white--text">
                رزروها
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="success">
            <v-card-text class="text-center">
              <div class="text-h3 font-weight-bold white--text">
                {{ stats.totalReviews }}
              </div>
              <div class="text-subtitle-1 white--text">
                نظرات
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="info">
            <v-card-text class="text-center">
              <div class="text-h3 font-weight-bold white--text">
                {{ stats.averageRating }}
              </div>
              <div class="text-subtitle-1 white--text">
                میانگین امتیاز
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Quick Actions -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>عملیات سریع</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="primary"
                    block
                    prepend-icon="mdi-plus"
                    @click="router.push('/club-owner/add-club')"
                  >
                    افزودن باشگاه جدید
                  </v-btn>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="secondary"
                    block
                    prepend-icon="mdi-calendar-check"
                    :disabled="clubs.length === 0"
                  >
                    مدیریت رزروها
                  </v-btn>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="success"
                    block
                    prepend-icon="mdi-star"
                    :disabled="clubs.length === 0"
                  >
                    مشاهده نظرات
                  </v-btn>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="info"
                    block
                    prepend-icon="mdi-chart-bar"
                    :disabled="clubs.length === 0"
                  >
                    گزارش‌ها
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Clubs List -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>باشگاه‌های شما</v-card-title>
            
            <div v-if="clubs.length === 0" class="text-center py-5">
              <v-icon size="large" color="grey">mdi-domain</v-icon>
              <p class="mt-2">شما هنوز باشگاهی ثبت نکرده‌اید</p>
              <v-btn
                color="primary"
                class="mt-2"
                @click="router.push('/club-owner/add-club')"
              >
                افزودن باشگاه
              </v-btn>
            </div>
            
            <v-table v-else>
              <thead>
                <tr>
                  <th>نام</th>
                  <th>وضعیت</th>
                  <th>شهر</th>
                  <th>امتیاز</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="club in clubs" :key="club.id">
                  <td>{{ club.name }}</td>
                  <td>
                    <v-chip
                      :color="club.is_approved ? 'success' : 'warning'"
                      size="small"
                    >
                      {{ club.is_approved ? 'تایید شده' : 'در انتظار تایید' }}
                    </v-chip>
                  </td>
                  <td>{{ club.city }}</td>
                  <td>
                    <div class="d-flex align-center">
                      <v-rating
                        :model-value="club.rating || 0"
                        color="amber"
                        density="compact"
                        size="small"
                        readonly
                      ></v-rating>
                      <span class="ms-2">{{ club.rating || 'بدون امتیاز' }}</span>
                    </div>
                  </td>
                  <td>
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      size="small"
                      @click="router.push(`/clubs/${club.id}`)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    
                    <v-btn
                      icon
                      variant="text"
                      color="secondary"
                      size="small"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Recent Bookings -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>رزروهای اخیر</v-card-title>
            
            <div v-if="bookings.length === 0" class="text-center py-5">
              <v-icon size="large" color="grey">mdi-calendar</v-icon>
              <p class="mt-2">هنوز رزروی ثبت نشده است</p>
            </div>
            
            <v-table v-else>
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>باشگاه</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th>پرداخت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookings.slice(0, 5)" :key="booking.id">
                  <td>{{ booking.profiles?.full_name || 'کاربر' }}</td>
                  <td>{{ clubs.find(c => c.id === booking.club_id)?.name || 'باشگاه' }}</td>
                  <td>{{ new Date(booking.date).toLocaleDateString('fa-IR') }}</td>
                  <td>
                    <v-chip
                      :color="booking.status === 'approved' ? 'success' : booking.status === 'rejected' ? 'error' : 'warning'"
                      size="small"
                    >
                      {{ booking.status === 'approved' ? 'تایید شده' : booking.status === 'rejected' ? 'رد شده' : 'در انتظار' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-chip
                      :color="booking.payment_status === 'paid' ? 'success' : 'warning'"
                      size="small"
                    >
                      {{ booking.payment_status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn
                      v-if="booking.status === 'pending'"
                      color="success"
                      size="small"
                      variant="text"
                      @click="updateBookingStatus(booking.id, 'approved')"
                    >
                      تایید
                    </v-btn>
                    
                    <v-btn
                      v-if="booking.status === 'pending'"
                      color="error"
                      size="small"
                      variant="text"
                      @click="updateBookingStatus(booking.id, 'rejected')"
                    >
                      رد
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            
            <v-card-actions v-if="bookings.length > 5">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
              >
                مشاهده همه
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>