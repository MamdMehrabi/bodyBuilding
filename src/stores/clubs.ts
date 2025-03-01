import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSupabaseClient } from '../services/supabase'
import type { Database } from '../types/supabase'

type Club = Database['public']['Tables']['clubs']['Row']

export const useClubsStore = defineStore('clubs', () => {
  const clubs = ref<Club[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref({
    city: '',
    sports: [] as string[],
    priceRange: '',
    facilities: [] as string[],
    searchQuery: ''
  })

  const supabase = getSupabaseClient()

  const filteredClubs = computed(() => {
    return clubs.value.filter(club => {
      // Filter by city
      if (filters.value.city && club.city !== filters.value.city) {
        return false
      }
      
      // Filter by sports
      if (filters.value.sports.length > 0 && 
          !filters.value.sports.some(sport => club.sports.includes(sport))) {
        return false
      }
      
      // Filter by price range
      if (filters.value.priceRange && club.price_range !== filters.value.priceRange) {
        return false
      }
      
      // Filter by facilities
      if (filters.value.facilities.length > 0 && 
          !filters.value.facilities.some(facility => club.facilities.includes(facility))) {
        return false
      }
      
      // Filter by search query
      if (filters.value.searchQuery) {
        const query = filters.value.searchQuery.toLowerCase()
        return (
          club.name.toLowerCase().includes(query) ||
          club.description.toLowerCase().includes(query) ||
          club.address.toLowerCase().includes(query)
        )
      }
      
      return true
    })
  })

  async function fetchClubs() {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_approved', true)
      
      if (fetchError) throw fetchError
      
      clubs.value = data || []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchClubById(id: string) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function createClub(clubData: Omit<Database['public']['Tables']['clubs']['Insert'], 'id' | 'created_at' | 'is_approved' | 'is_premium' | 'rating'>) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: insertError } = await supabase
        .from('clubs')
        .insert({
          ...clubData,
          is_approved: false,
          is_premium: false
        })
        .select()
      
      if (insertError) throw insertError
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function updateClub(id: string, clubData: Partial<Database['public']['Tables']['clubs']['Update']>) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('clubs')
        .update(clubData)
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      // Update local state
      const index = clubs.value.findIndex(club => club.id === id)
      if (index !== -1 && data && data.length > 0) {
        clubs.value[index] = data[0]
      }
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    clubs,
    filteredClubs,
    loading,
    error,
    filters,
    fetchClubs,
    fetchClubById,
    createClub,
    updateClub,
    setFilters
  }
})