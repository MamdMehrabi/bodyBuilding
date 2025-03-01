<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClubsStore } from '../../stores/clubs'

const router = useRouter()
const clubsStore = useClubsStore()
const loading = ref(false)
const mapView = ref(false)

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

const facilities = [
  'پارکینگ',
  'کافه',
  'سونا',
  'جکوزی',
  'استخر',
  'فروشگاه',
  'مربی خصوصی',
  'رختکن'
]

const priceRanges = [
  'اقتصادی',
  'متوسط',
  'گران',
  'خیلی گران'
]

const selectedCity = ref('')
const selectedSports = ref([])
const selectedFacilities = ref([])
const selectedPriceRange = ref('')
const searchQuery = ref('')

const filteredClubs = computed(() => {
  return clubsStore.filteredClubs
})

onMounted(async () => {
  loading.value = true
  await clubsStore.fetchClubs()
  loading.value = false
  
  // Apply any existing filters from the store
  selectedCity.value = clubsStore.filters.city
  selectedSports.value = clubsStore.filters.sports
  selectedFacilities.value = clubsStore.filters.facilities
  selectedPriceRange.value = clubsStore.filters.priceRange
  searchQuery.value = clubsStore.filters.searchQuery
})

const applyFilters = () => {
  clubsStore.setFilters({
    city: selectedCity.value,
    sports: selectedSports.value,
    facilities: selectedFacilities.value,
    priceRange: selectedPriceRange.value,
    searchQuery: searchQuery.value
  })
}

const resetFilters = () => {
  selectedCity.value = ''
  selectedSports.value = []
  selectedFacilities.value = []
  selectedPriceRange.value = ''
  searchQuery.value = ''
  
  clubsStore.setFilters({
    city: '',
    sports: [],
    facilities: [],
    priceRange: '',
    searchQuery: ''
  })
}
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-6">جستجوی باشگاه‌های ورزشی</h1>
    
    <v-row>
      <!-- Filters Sidebar -->
      <v-col cols="12" md="3">
        <v-card class="mb-4">
          <v-card-title class="text-h6">
            فیلترها
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              density="compact"
              @click="resetFilters"
            >
              پاک کردن
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              label="جستجو"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              class="mb-4"
              @update:model-value="applyFilters"
            ></v-text-field>
            
            <v-select
              v-model="selectedCity"
              :items="cities"
              label="شهر"
              variant="outlined"
              density="compact"
              class="mb-4"
              @update:model-value="applyFilters"
            ></v-select>
            
            <v-select
              v-model="selectedSports"
              :items="sports"
              label="ورزش‌ها"
              variant="outlined"
              density="compact"
              multiple
              chips
              class="mb-4"
              @update:model-value="applyFilters"
            ></v-select>
            
            <v-select
              v-model="selectedFacilities"
              :items="facilities"
              label="امکانات"
              variant="outlined"
              density="compact"
              multiple
              chips
              class="mb-4"
              @update:model-value="applyFilters"
            ></v-select>
            
            <v-select
              v-model="selectedPriceRange"
              :items="priceRanges"
              label="محدوده قیمت"
              variant="outlined"
              density="compact"
              class="mb-4"
              @update:model-value="applyFilters"
            ></v-select>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Results -->
      <v-col cols="12" md="9">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>{{ filteredClubs.length }} باشگاه یافت شد</span>
            <v-spacer></v-spacer>
            <v-btn-toggle
              v-model="mapView"
              color="primary"
              density="compact"
              mandatory
            >
              <v-btn :value="false" prepend-icon="mdi-view-list">
                لیست
              </v-btn>
              <v-btn :value="true" prepend-icon="mdi-map">
                نقشه
              </v-btn>
            </v-btn-toggle>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <v-row v-if="!mapView">
              <v-col
                v-for="club in filteredClubs"
                :key="club.id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card
                  class="mx-auto h-100"
                  @click="router.push(`/clubs/${club.id}`)"
                >
                  <v-img
                    :src="club.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'"
                    height="200"
                    cover
                  ></v-img>
                  
                  <v-card-title>
                    {{ club.name }}
                    <v-chip
                      v-if="club.is_premium"
                      color="amber"
                      size="small"
                      class="ms-2"
                    >
                      ویژه
                    </v-chip>
                  </v-card-title>
                  
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
                    
                    <div class="d-flex flex-wrap gap-1 mb-2">
                      <v-chip
                        v-for="sport in club.sports.slice(0, 2)"
                        :key="sport"
                        size="x-small"
                        class="me-1"
                      >
                        {{ sport }}
                      </v-chip>
                      <v-chip
                        v-if="club.sports.length > 2"
                        size="x-small"
                      >
                        +{{ club.sports.length - 2 }}
                      </v-chip>
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
            
            <div v-else class="map-container" style="height: 600px;">
              <p class="text-center py-10">
                نمایش نقشه در نسخه بعدی اضافه خواهد شد
              </p>
              <!-- Map view will be implemented in the future -->
            </div>
            
            <div v-if="filteredClubs.length === 0 && !loading" class="text-center py-10">
              <v-icon size="large" color="grey">mdi-emoticon-sad</v-icon>
              <p class="text-h6 mt-4">هیچ باشگاهی با این مشخصات یافت نشد</p>
              <v-btn
                color="primary"
                variant="text"
                @click="resetFilters"
              >
                پاک کردن فیلترها
              </v-btn>
            </div>
            
            <div v-if="loading" class="text-center py-10">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="mt-4">در حال بارگذاری...</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>