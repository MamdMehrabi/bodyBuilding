<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getSupabaseClient } from '../../services/supabase'

const router = useRouter()
const authStore = useAuthStore()
const supabase = getSupabaseClient()

const loading = ref(true)
const stats = ref({
  totalClubs: 0,
  pendingClubs: 0,
  totalUsers: 0,
  totalBookings: 0,
  totalReviews: 0
})

const recentClubs = ref<any[]>([])
const recentUsers = ref<any[]>([])

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
    
    // Fetch stats
    const { count: totalClubs } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
    
    const { count: pendingClubs } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false)
    
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalReviews } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
    
    stats.value = {
      totalClubs: totalClubs || 0,
      pendingClubs: pendingClubs || 0,
      totalUsers: totalUsers || 0,
      totalBookings: totalBookings || 0,
      totalReviews: totalReviews || 0
    }
    
    // Fetch recent clubs
    const { data: clubsData } = await supabase
      .from('clubs')
      .select(`
        *,
        profiles:profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    recentClubs.value = clubsData || []
    
    // Fetch recent users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    recentUsers.value = usersData || []
  } catch (err) {
    console.error('Error fetching admin dashboard data:', err)
  } finally {
    loading.value = false
  }
}

const approveClub = async (clubId: string) => {
  try {
    const { error } = await supabase
      .from('clubs')
      .update({ is_approved: true })
      .eq('id', clubId)
    
    if (error) throw error
    
    // Update local state
    const index = recentClubs.value.findIndex(club => club.id === clubId)
    if (index !== -1) {
      recentClubs.value[index].is_approved = true
    }
    
    // Update stats
    stats.value.pendingClubs--
  } catch (err) {
    console.error('Error approving club:', err)
  }
}
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-6">داشبورد مدیریت</h1>
    
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
        <v-col cols="12" sm="6" md="4" lg="2">
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
        
        <v-col cols="12" sm="6" md="4" lg="2">
          <v-card class="mx-auto" color="warning">
            <v-card-text class="text-center">
              <div class="text-h3 font-weight-bold white--text">
                {{ stats.pendingClubs }}
              </div>
              <div class="text-subtitle-1 white--text">
                در انتظار تایید
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="4" lg="2">
          <v-card class="mx-auto" color="secondary">
            <v-card-text class="text-center">
              <div class="text-h3 font-weight-bold white--text">
                {{ stats.totalUsers }}
              </div>
              <div class="text-subtitle-1 white--text">
                کاربران
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="4" lg="2">
          <v-card class="mx-auto" color="success">
            <v-card-text class="text-center">
              <div class="text-h3 font-weight-bold white--text">
                {{ stats.totalBookings }}
              </div>
              <div class="text-subtitle-1 white--text">
                رزروها
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="4" lg="2">
          <v-card class="mx-auto" color="info">
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
                    color="warning"
                    block
                    prepend-icon="mdi-check-decagram"
                    @click="router.push('/admin/club-approvals')"
                  >
                    تایید باشگاه‌ها
                    <v-badge
                      v-if="stats.pendingClubs > 0"
                      :content="stats.pendingClubs.toString()"
                      color="error"
                      inline
                    ></v-badge>
                  </v-btn>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="primary"
                    block
                    prepend-icon="mdi-account-group"
                  >
                    مدیریت کاربران
                  </v-btn>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="secondary"
                    block
                    prepend-icon="mdi-flag"
                  >
                    گزارش‌های تخلف
                  </v-btn>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="info"
                    block
                    prepend-icon="mdi-chart-bar"
                  >
                    آمار و گزارش‌ها
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Recent Clubs -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>باشگاه‌های اخیر</v-card-title>
            
            <v-list>
              <v-list-item
                v-for="club in recentClubs"
                :key="club.id"
                :title="club.name"
                :subtitle="`${club.city} | ${club.profiles?.full_name || 'صاحب باشگاه'}`"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    <span class="text-h6 text-white">
                      {{ club.name.charAt(0) }}
                    </span>
                  </v-avatar>
                </template>
                
                <template v-slot:append>
                  <v-chip
                    :color="club.is_approved ? 'success' : 'warning'"
                    size="small"
                    class="me-2"
                  >
                    {{ club.is_approved ? 'تایید شده' : 'در انتظار تایید' }}
                  </v-chip>
                  
                  <v-btn
                    v-if="!club.is_approved"
                    icon="mdi-check"
                    color="success"
                    size="small"
                    variant="text"
                    @click="approveClub(club.id)"
                  ></v-btn>
                  
                  <v-btn
                    icon="mdi-eye"
                    color="primary"
                    size="small"
                    variant="text"
                    @click="router.push(`/clubs/${club.id}`)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            
            <v-card-actions>
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
        
        <!-- Recent Users -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>کاربران اخیر</v-card-title>
            
            <v-list>
              <v-list-item
                v-for="user in recentUsers"
                :key="user.id"
                :title="user.full_name"
                :subtitle="`نقش: ${user.role === 'user' ? 'کاربر عادی' : user.role === 'club_owner' ? 'صاحب باشگاه' : 'مدیر'}`"
              >
                <template v-slot:prepend>
                  <v-avatar color="secondary">
                    <v-img
                      v-if="user.avatar_url"
                      :src="user.avatar_url"
                    ></v-img>
                    <span v-else class="text-h6 text-white">
                      {{ user.full_name.charAt(0) }}
                    </span>
                  </v-avatar>
                </template>
                
                <template v-slot:append>
                  <v-chip
                    :color="user.role === 'admin' ? 'error' : user.role === 'club_owner' ? 'warning' : 'success'"
                    size="small"
                  >
                    {{ user.role === 'admin' ? 'مدیر' : user.role === 'club_owner' ? 'صاحب باشگاه' : 'کاربر' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            
            <v-card-actions>
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