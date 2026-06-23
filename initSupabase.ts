import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "https://towudjvbysimfwwngxoz.supabase.co";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvd3VkanZieXNpbWZ3d25neG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzM0MDksImV4cCI6MjA3ODk0OTQwOX0.4kNe8-tZ64QXR8DuDa8_mgsEn3pMAn7IbBSsBYukb48";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
