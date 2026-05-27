import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native'; // ✅ ดึงตัวเช็กระบบปฏิบัติการมาใช้

// 1. สร้างตัวจัดเก็บข้อมูลล็อกอิน โดยป้องกันการพังเมื่อรันบน Web/Node
const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    if (Platform.OS === 'web') return Promise.resolve(null); // ถ้ารันบนเว็บให้ข้ามไป
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    if (Platform.OS === 'web') return Promise.resolve();
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    if (Platform.OS === 'web') return Promise.resolve();
    return SecureStore.deleteItemAsync(key);
  },
};

// 2. ดึงค่าคีย์จากไฟล์ตั้งค่าของ Expo หรือ .env
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ หลุดขบวน! ตรวจสอบว่าใส่คีย์ในไฟล์ตั้งค่าครบถ้วนแล้วหรือยัง");
}

// 3. เริ่มต้นทำงานระบบ Supabase Client สำหรับโมบายแอป
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter, // ✅ ตอนนี้จะไม่พังบนเว็บแล้ว
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});