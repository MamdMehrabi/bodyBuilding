<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getSupabaseClient } from '../../services/supabase'

const router = useRouter()
const authStore = useAuthStore()
const supabase = getSupabaseClient()

const loading = ref(true)
const pendingClubs = ref<any[]>([])
const selectedClub = ref<any>(null)
const showDetails = ref(false)

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  await fetchPendingClubs()
})

const fetchPendingClubs = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('clubs')
      .select(`
        *,
        profiles:profiles(full_name)
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    pendingClubs.value = data || []
  } catch (err) {
    console.error('Error fetching pending clubs:', err)
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
    
    // Remove from list
    pendingClubs.value = pendingClubs.value.filter(club => club.id !== clubId)
    
    if (selectedClub.value && selectedClub.value.id === clubId) {
      showDetails.value = false
      selectedClub.value = null
    }
  } catch (err) {
    console.error('Error approving club:', err)
  }
}

const rejectClub = async (clubId: string) => {
  try {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId)
    
    if (error) throw error
    
    // Remove from list
    pendingClubs.value = pendingClubs.value.filter(club => club.id !== clubId)
    
    if (selectedClub.value && selectedClub.value.id === clubId) {
      showDetails.value = false
      selectedClub.value = null
    }
  } catch (err) {
    console.error('Error rejecting club:', err)
  }
}

const viewClubDetails = (club: any) => {
  selectedClub.value = club
  showDetails.value = true
}
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-6">تایید باشگاه‌ها</h1>
    
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
    
    <v-row v-else-if="pendingClubs.length === 0">
      <v-col cols="12">
        <v-card class="text-center py-10">
          <v-icon size="large" color="success">mdi-check-circle</v-icon>
          <p class="text-h6 mt-4">همه باشگاه‌ها تایید شده‌اند</p>
          <v-btn
            color="primary"
            class="mt-4"
            @click="router.push('/admin')"
          >
            بازگشت به داشبورد
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row v-else>
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>
            باشگاه‌های در انتظار تایید
            <v-chip class="ms-2" color="warning">{{ pendingClubs.length }}</v-chip>
          </v-card-title>
          
          <v-list select-strategy="single-independent" v-model:selected="selectedClub">
            <v-list-item
              v-for="club in pendingClubs"
              :key="club.id"
              :value="club"
              :title="club.name"
              :subtitle="`${club.city} | ${new Date(club.created_at).toLocaleDateString('fa-IR')}`"
              @click="viewClubDetails(club)"
            >
              <template v-slot:prepend>
                <v-avatar color="primary">
                  <span class="text-h6 text-white">
                    {{ club.name.charAt(0) }}
                  </span>
                </v-avatar>
              </template>
              
              <template v-slot:append>
                <v-btn
                  icon="mdi-check"
                  color="success"
                  size="small"
                  variant="text"
                  @click.stop="approveClub(club.id)"
                ></v-btn>
                
                <v-btn
                  icon="mdi-close"
                  color="error"
                  size="small"
                  variant="text"
                  @click.stop="rejectClub(club.id)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="7">
        <v-card v-if="showDetails && selectedClub">
          <v-card-title class="d-flex align-center">
            <span>{{ selectedClub.name }}</span>
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click="approveClub(selectedClub.id)"
            >
              تایید
            </v-btn>
            <v-btn
              color="error"
              class="ms-2"
              @click="rejectClub(selectedClub.id)"
            >
              رد
            </v-btn>
          </v-card-title>
          
          <v-card-subtitle>
            <div class="d-flex align-center">
              <v-icon size="small">mdi-account</v-icon>
              <span class="ms-1">صاحب: {{ selectedClub.profiles?.full_name || 'نامشخص' }}</span>
            </div>
          </v-card-subtitle>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-2">تصاویر</h3>
                <v-carousel
                  v-if="selectedClub.images && selectedClub.images.length > 0"
                  height="200"
                  hide-delimiters
                  show-arrows="hover"
                >
                  <v-carousel-item
                    v-for="(image, i) in selectedClub.images"
                    :key="i"
                    :src="image || 'https://via.placeholder.com/800x400?text=No+Image'"
                    cover
                  ></v-carousel-item>
                </v-carousel>
                
                <v-img
                  v-else
                  src="https://via.placeholder.com/800x400?text=No+Images"
                  height="200"
                  cover
                ></v-img>
              </v-col>
              
              <v-col cols="12">
                <h3 class="text-h6 mb-2">توضیحات</h3>
                <p>{{ selectedClub.description }}</p>
              </v-col>
              
              <v-col cols="12" sm="6">
                <h3 class="text-h6 mb-2">آدرس</h3>
                <p>{{ selectedClub.address }}</p>
                <p>{{ selectedClub.city }}</p>
              </v-col>
              
              <v-col cols="12" sm="6">
                <h3 class="text-h6 mb-2">محدوده قیمت</h3>
                <v-chip color="success" variant="outlined">
                  {{ selectedClub.price_range }}
                </v-chip>
              </v-col>
              
              <v-col cols="12" sm="6">
                <h3 class="text-h6 mb-2">ورزش‌ها</h3>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="sport in selectedClub.sports"
                    :key="sport"
                    color="primary"
                    variant="outlined"
                    size="small"
                  >
                    {{ sport }}
                  </v-chip>
                </div>
              </v-col>
              
              <v-col cols="12" sm="6">
                <h3 class="text-h6 mb-2">امکانات</h3>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="facility in selectedClub.facilities"
                    :key="facility"
                    color="secondary"
                    variant="outlined"
                    size="small"
                  >
                    {{ facility }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        
        <v-card v-else class="d-flex justify-center align-center" style="height: 400px;">
          <div class="text-center">
            <v-icon size="large" color="grey">mdi-gesture-tap</v-icon>
            <p class="mt-2">یک باشگاه را برای مشاهده جزئیات انتخاب کنید</p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>