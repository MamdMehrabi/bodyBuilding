export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          address: string
          latitude: number
          longitude: number
          owner_id: string
          is_premium: boolean
          is_approved: boolean
          sports: string[]
          facilities: string[]
          price_range: string
          images: string[]
          rating: number | null
          city: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          address: string
          latitude: number
          longitude: number
          owner_id: string
          is_premium?: boolean
          is_approved?: boolean
          sports: string[]
          facilities: string[]
          price_range: string
          images: string[]
          rating?: number | null
          city: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          address?: string
          latitude?: number
          longitude?: number
          owner_id?: string
          is_premium?: boolean
          is_approved?: boolean
          sports?: string[]
          facilities?: string[]
          price_range?: string
          images?: string[]
          rating?: number | null
          city?: string
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          club_id: string
          user_id: string
          rating: number
          comment: string
        }
        Insert: {
          id?: string
          created_at?: string
          club_id: string
          user_id: string
          rating: number
          comment: string
        }
        Update: {
          id?: string
          created_at?: string
          club_id?: string
          user_id?: string
          rating?: number
          comment?: string
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          club_id: string
          user_id: string
          date: string
          status: string
          payment_status: string
          amount: number
        }
        Insert: {
          id?: string
          created_at?: string
          club_id: string
          user_id: string
          date: string
          status: string
          payment_status: string
          amount: number
        }
        Update: {
          id?: string
          created_at?: string
          club_id?: string
          user_id?: string
          date?: string
          status?: string
          payment_status?: string
          amount?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          full_name: string
          avatar_url: string | null
          role: string
          favorite_sports: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          full_name: string
          avatar_url?: string | null
          role: string
          favorite_sports?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          full_name?: string
          avatar_url?: string | null
          role?: string
          favorite_sports?: string[] | null
        }
      }
    }
  }
}