<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useClubsStore } from '../../stores/clubs'

const router = useRouter()
const authStore = useAuthStore()
const clubsStore = useClubsStore()

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const clubData = ref({
  name: '',
  description: '',
  address: '',
  city: '',
  latitude: 35.6892, // Default to Tehran
  longitude: 51.3890,
  sports: [] as string[],
  facilities: [] as string[],
  price_range: '',
  images: [] as string[]
})

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

// For demo purposes, we'll use placeholder images
const demoImages = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
]

const addImage = () => {
  // In a real app, this would upload an image to storage
  // For demo, we'll use a random image from our demo set
  const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)]
  clubData.value.images.push(randomImage)
}

const removeImage = (index: number) => {
  clubData.value.images.splice(index, 1)
}

const submitClub = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  // Validate form
  if (!clubData.value.name || !clubData.value.description || !clubData.value.address || 
      !clubData.value.city || clubData.value.sports.length === 0 || !clubData.value.price_range) {
    error.value = 'لطفا تمام فیلدهای ضروری را پر کنید'
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    const result = await clubsStore.createClub({
      ...clubData.value,
      owner_id: authStore.user.id
    })
    
    if (result.success) {
      success.value = true
      // Reset form
      clubData.value = {
        name: '',
        description: '',
        address: '',
        city: '',
        latitude: 35.6892,
        longitude: 51.3890,
        sports: [],
        facilities: [],
        price_range: '',
        images: []
      }
    } else {
      error.value = result.error || 'خطا در ثبت باشگاه'
    }
  } catch (err: any) {
    console.error('Error creating club:', err)
    error.value = 'خطا در ثبت باشگاه'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-4">
          <v-card-title class="text-h4 mb-4">
            افزودن باشگاه جدید
          </v-card-title>
          
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
            class="mb-4"
          >
            باشگاه شما با موفقیت ثبت شد و در انتظار تایید مدیر است.
          </v-alert>
          
          <v-form @submit.prevent="submitClub">
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-2">اطلاعات اصلی</h3>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="clubData.name"
                  label="نام باشگاه"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="clubData.city"
                  :items="cities"
                  label="شهر"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="clubData.description"
                  label="توضیحات"
                  variant="outlined"
                  rows="3"
                  required
                ></v-textarea>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="clubData.address"
                  label="آدرس"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="clubData.latitude"
                  label="عرض جغرافیایی"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="clubData.longitude"
                  label="طول جغرافیایی"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <h3 class="text-h6 mb-2">ویژگی‌ها</h3>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="clubData.sports"
                  :items="sports"
                  label="ورزش‌ها"
                  variant="outlined"
                  multiple
                  chips
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="clubData.facilities"
                  :items="facilities"
                  label="امکانات"
                  variant="outlined"
                  multiple
                  chips
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="clubData.price_range"
                  :items="priceRanges"
                  label="محدوده قیمت"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <h3 class="text-h6 mb-2">تصاویر</h3>
                
                <div class="d-flex flex-wrap gap-4 mb-4">
                  <v-card
                    v-for="(image, index) in clubData.images"
                    :key="index"
                    width="150"
                    height="150"
                    class="position-relative"
                  >
                    <v-img
                      :src="image"
                      height="150"
                      cover
                    ></v-img>
                    
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      color="error"
                      variant="tonal"
                      class="position-absolute"
                      style="top: 5px; right: 5px;"
                      @click="removeImage(index)"
                    ></v-btn>
                  </v-card>
                  
                  <v-card
                    width="150"
                    height="150"
                    class="d-flex justify-center align-center"
                    variant="outlined"
                    @click="addImage"
                  >
                    <v-icon size="large">mdi-plus</v-icon>
                  </v-card>
                </div>
                
                <p class="text-caption">
                  در نسخه واقعی، امکان آپلود تصاویر وجود خواهد داشت.
                </p>
              </v-col>
              
              <v-col cols="12" class="text-center">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="loading"
                  min-width="200"
                >
                  ثبت باشگاه
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>