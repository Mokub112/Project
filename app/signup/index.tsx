import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// เบอร์มือถือไทย: 0 ตามด้วยเลข 9 หลัก (ยอมรับช่องว่าง/ขีดคั่นได้)
const PHONE_REGEX = /^0\d{9}$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 3;

export default function SignUpPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    const trimmedUsername = username.trim();
    const trimmedPhone = phone.replace(/[\s-]/g, '');
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedPhone || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert('กรุณากรอกข้อมูล', 'โปรดกรอกข้อมูลให้ครบถ้วนทุกช่องครับพี่');
      return;
    }

    if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
      Alert.alert('ชื่อผู้ใช้สั้นเกินไป', `ชื่อผู้ใช้ต้องมีอย่างน้อย ${MIN_USERNAME_LENGTH} ตัวอักษร`);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบ');
      return;
    }

    if (!PHONE_REGEX.test(trimmedPhone)) {
      Alert.alert('เบอร์โทรไม่ถูกต้อง', 'กรุณากรอกเบอร์มือถือ 10 หลัก ขึ้นต้นด้วย 0');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('รหัสผ่านสั้นเกินไป', `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'โปรดตรวจสอบรหัสผ่านทั้งสองช่องให้ตรงกันครับ');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            username: trimmedUsername,
            phone: trimmedPhone,
          },
        },
      });

      if (error) {
        Alert.alert('สมัครสมาชิกไม่สำเร็จ', error.message);
        return;
      }

      // 🛡️ ตรวจสอบ user enumeration protection: ถ้าอีเมลนี้เคยสมัครไปแล้ว
      // Supabase จะไม่คืน error แต่ identities จะเป็น array ว่าง
      if (data?.user && data.user.identities?.length === 0) {
        Alert.alert(
          'อีเมลนี้ถูกใช้แล้ว',
          'อีเมลนี้มีบัญชีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น'
        );
        return;
      }

      // เคลียร์ session ทันที เผื่อโปรเจกต์ปิด "Confirm email" ไว้แล้ว signUp คืน session มาให้เลย
      await supabase.auth.signOut();

      Alert.alert(
        'สำเร็จ 🎉',
        'ระบบได้ส่งอีเมลยืนยันตัวตนไปให้ท่านแล้ว! โปรดยืนยันอีเมลก่อนเข้าสู่ระบบครับ',
        [
          {
            text: 'ตกลง',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อระบบได้');
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin(provider: string) {
    Alert.alert('เร็ว ๆ นี้', `การสมัครด้วย ${provider} ยังไม่เปิดให้ใช้งานในตอนนี้`);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* 📑 Tab สลับหน้าสไตล์เดียวกับหน้า Sign in เป๊ะๆ */}
          <View style={styles.tabHeader}>
            <TouchableOpacity
              onPress={() => router.replace('/login')}
              activeOpacity={0.6}
              disabled={loading}
            >
              <Text style={styles.tabText}>Sign in</Text>
            </TouchableOpacity>
            <View>
              <Text style={[styles.tabText, styles.activeTab]}>Sign up</Text>
            </View>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to start your journey</Text>

          {/* 👤 ช่องกรอก Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="your username"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* 📞 ช่องกรอก Phone number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              style={styles.input}
              placeholder="08X-XXX-XXXX"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoComplete="tel"
              textContentType="telephoneNumber"
              editable={!loading}
            />
          </View>

          {/* ✉️ ช่องกรอก Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your-email@gmail.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
            />
          </View>

          {/* 🔑 ช่องกรอก Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🔒 ช่องกรอก Confirm password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🔘 แถวปุ่ม Social และปุ่มวงกลมส่งข้อมูล */}
          <View style={styles.buttonRow}>
            <View style={styles.socialIcons}>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialLogin('Google')}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialLogin('Facebook')}
                disabled={loading}
              >
                <Ionicons name="logo-facebook" size={18} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialLogin('Apple')}
                disabled={loading}
              >
                <Ionicons name="logo-apple" size={18} color="#000000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.actionButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Ionicons name="arrow-forward" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  tabHeader: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTab: {
    color: '#0F172A',
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
  },
  eyeButton: {
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#004368',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#004368',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
});