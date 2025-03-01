<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClubsStore } from '../stores/clubs'

const router = useRouter()
const clubsStore = useClubsStore()
const searchQuery = ref('')
const selectedCity = ref('')
const selectedSport = ref('')

const cities = [
  'تهران',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'اهواز',
  'قم'
]

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

const featuredClubs = ref([])

onMounted(async () => {
  await clubsStore.fetchClubs()
  // Get premium clubs or top rated clubs
  featuredClubs.value = clubsStore.clubs
    .filter(club => club.is_premium || (club.rating && club.rating > 4))
    .slice(0, 4)
})

const handleSearch = () => {
  clubsStore.setFilters({
    searchQuery: searchQuery.value,
    city: selectedCity.value,
    sports: selectedSport.value ? [selectedSport.value] : []
  })
  router.push('/clubs')
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <v-parallax
      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      height="400"
    >
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h3 font-weight-bold mb-4">باشگاه یاب</h1>
        <h2 class="text-h5 mb-6">باشگاه ورزشی مورد نظر خود را پیدا کنید</h2>
        
        <v-card width="90%" max-width="600" class="pa-4">
          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="selectedCity"
                :items="cities"
                label="شهر"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            
            <v-col cols="12" sm="4">
              <v-select
                v-model="selectedSport"
                :items="sports"
                label="ورزش"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="searchQuery"
                label="جستجو"
                variant="outlined"
                density="compact"
                append-inner-icon="mdi-magnify"
                @click:append-inner="handleSearch"
                @keyup.enter="handleSearch"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-btn
            block
            color="primary"
            size="large"
            @click="handleSearch"
          >
            جستجوی باشگاه
          </v-btn>
        </v-card>
      </div>
    </v-parallax>
    
    <!-- Featured Clubs Section -->
    <v-container class="py-10">
      <h2 class="text-h4 mb-6 text-center">باشگاه‌های برتر</h2>
      
      <v-row>
        <v-col
          v-for="club in featuredClubs"
          :key="club.id"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            class="mx-auto"
            max-width="344"
            @click="router.push(`/clubs/${club.id}`)"
          >
            <v-img
              :src="club.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'"
              height="200"
              cover
            ></v-img>
            
            <v-card-title>{{ club.name }}</v-card-title>
            
            <v-card-subtitle>
              <v-icon size="small">mdi-map-marker</v-icon>
              {{ club.city }}
            </v-card-subtitle>
            
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-rating
                  :model-value="club.rating || 0"
                  color="amber"
                  density="compact"
                  size="small"
                  readonly
                ></v-rating>
                <span class="ms-2 text-caption">{{ club.rating || 'بدون امتیاز' }}</span>
              </div>
              
              <div class="text-caption text-truncate">
                {{ club.description }}
              </div>
            </v-card-text>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="text"
                @click.stop="router.push(`/clubs/${club.id}`)"
              >
                مشاهده
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      
      <div class="text-center mt-6">
        <v-btn
          color="primary"
          variant="outlined"
          size="large"
          @click="router.push('/clubs')"
        >
          مشاهده همه باشگاه‌ها
        </v-btn>
      </div>
    </v-container>
    
    <!-- Features Section -->
    <v-container class="py-10 bg-grey-lighten-4">
      <h2 class="text-h4 mb-10 text-center">ویژگی‌های باشگاه یاب</h2>
      
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="mx-auto" height="100%">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  color="primary"
                  size="x-large"
                >
                  mdi-magnify
                </v-icon>
              </template>
              <v-card-title>جستجوی آسان</v-card-title>
            </v-card-item>
            
            <v-card-text>
              به راحتی باشگاه‌های ورزشی را بر اساس موقعیت، نوع ورزش، امکانات و قیمت جستجو کنید.
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card class="mx-auto" height="100%">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  color="primary"
                  size="x-large"
                >
                  mdi-star
                </v-icon>
              </template>
              <v-card-title>امتیازدهی و نظرات</v-card-title>
            </v-card-item>
            
            <v-card-text>
              نظرات و تجربیات سایر کاربران را مشاهده کنید و تجربه خود را به اشتراک بگذارید.
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card class="mx-auto" height="100%">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  color="primary"
                  size="x-large"
                >
                  mdi-calendar-check
                </v-icon>
              </template>
              <v-card-title>رزرو آنلاین</v-card-title>
            </v-card-item>
            
            <v-card-text>
              به راحتی عضویت در باشگاه را به صورت آنلاین رزرو کنید و هزینه را پرداخت نمایید.
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>