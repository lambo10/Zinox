import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../theme/colors';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { signInUser, signUpUser, signInWithGoogleFirebase } from '../services/apiService';
import { triggerLocalNotification } from '../services/notificationService';
import { useZinoxStore } from '../store/useZinoxStore';
import { Toast, ToastType } from '../components/Toast';
import { SegmentedControl, SegmentOption } from '../components/SegmentedControl';
import { AnimatedPressable } from '../components/AnimatedPressable';

type AuthMode = 'signin' | 'signup';

const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.42l4.04-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4.04 3.15c.94-2.83 3.57-4.98 6.68-4.98z"
    />
  </Svg>
);

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animations
  const logoPulse = useSharedValue(1);

  useEffect(() => {
    logoPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000 }),
        withTiming(1.0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoPulse.value }],
  }));

  // Toast Notification State
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  const showToast = (title: string, message: string, type: ToastType = 'error') => {
    setToastConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      const msg = 'Please enter your email address and password.';
      setErrorMessage(msg);
      showToast('Required Fields', msg, 'warning');
      return;
    }

    if (mode === 'signup' && (!name.trim() || !title.trim())) {
      const msg = 'Please enter your full name and job title.';
      setErrorMessage(msg);
      showToast('Required Fields', msg, 'warning');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const res = await signInUser(email.trim(), password.trim());
      setLoading(false);

      if (res.success && (res.session || res.data?.session)) {
        const activeSession = res.session || res.data?.session;
        setErrorMessage(null);
        useZinoxStore.getState().setSession(activeSession);
        triggerLocalNotification(
          'Welcome back to Zinox! ⚡',
          'Successfully authenticated.'
        );
      } else {
        const errStr = res.error || 'Invalid credentials';
        setErrorMessage(errStr);
        showToast('Sign In Failed', errStr, 'error');
      }
    } else {
      const res = await signUpUser(
        email.trim(),
        password.trim(),
        name.trim(),
        title.trim()
      );
      setLoading(false);

      if (res.success && (res.session || res.data?.session)) {
        const activeSession = res.session || res.data?.session;
        setErrorMessage(null);
        useZinoxStore.getState().setSession(activeSession);
        useZinoxStore.getState().updateUserProfile(
          name.trim() || 'Zinox User',
          title.trim() || 'Software Developer'
        );
        triggerLocalNotification(
          'Welcome to Zinox! 🚀',
          `Account created for ${name.trim() || 'Zinox User'}.`
        );
      } else {
        const errStr = res.error || 'Could not create account';
        setErrorMessage(errStr);
        showToast('Account Creation Failed', errStr, 'error');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    try {
      const res = await signInWithGoogleFirebase();
      setGoogleLoading(false);

      if (res.success && res.session) {
        const activeSession = res.session;
        setErrorMessage(null);
        useZinoxStore.getState().setSession(activeSession);

        const userName = activeSession.user?.user_metadata?.full_name || 'Google User';
        triggerLocalNotification(
          'Signed in with Google! 🌐',
          `Welcome back to Zinox, ${userName}.`
        );
      } else {
        const errStr = res.error || 'Google Sign-In failed';
        setErrorMessage(errStr);
        showToast('Google Auth Failed', errStr, 'error');
      }
    } catch (err: any) {
      setGoogleLoading(false);
      const errStr = err?.message || 'Google authentication error';
      setErrorMessage(errStr);
      showToast('Google Auth Error', errStr, 'error');
    }
  };

  const modeOptions: SegmentOption<AuthMode>[] = [
    { key: 'signin', label: 'Sign In' },
    { key: 'signup', label: 'Create Account' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <Animated.View style={[styles.logoBadge, logoAnimStyle]}>
              <Sparkles color="#FFFFFF" size={28} />
            </Animated.View>
            <Text style={styles.appName}>ZINOX</Text>
            <Text style={styles.tagline}>
              Work-Life Balance & Upskilling Super-App
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.authCard, SHADOWS.card]}>
            {/* iOS Segmented Control Mode Switcher */}
            <SegmentedControl
              options={modeOptions}
              selectedKey={mode}
              onSelect={handleModeSwitch}
              containerStyle={{ marginBottom: 20 }}
            />

            {/* Inputs */}
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <User color={COLORS.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Alex Vance"
                      placeholderTextColor={COLORS.textMuted}
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Job Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Job Title / Role</Text>
                  <View style={styles.inputWrapper}>
                    <Briefcase color={COLORS.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Senior Software Architect"
                      placeholderTextColor={COLORS.textMuted}
                      value={title}
                      onChangeText={(val) => {
                        setTitle(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail color={COLORS.textSecondary} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="alex.vance@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock color={COLORS.textSecondary} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                />
                <AnimatedPressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeScale={0.88}
                >
                  {showPassword ? (
                    <EyeOff color={COLORS.textSecondary} size={18} />
                  ) : (
                    <Eye color={COLORS.textSecondary} size={18} />
                  )}
                </AnimatedPressable>
              </View>
            </View>

            {/* Error Message Box */}
            {errorMessage ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorCardText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <AnimatedPressable
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading || googleLoading}
              activeScale={0.96}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'signin' ? 'Sign In to Zinox' : 'Create Account'}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={18} />
                </>
              )}
            </AnimatedPressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <AnimatedPressable
              style={[styles.googleButton, (googleLoading || loading) && { opacity: 0.7 }]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading || loading}
              activeScale={0.96}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <>
                  <GoogleIcon size={20} />
                  <Text style={styles.googleButtonText}>
                    {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                  </Text>
                </>
              )}
            </AnimatedPressable>
          </View>

          {/* Footer Security Badge */}
          <View style={styles.securityBadge}>
            <ShieldCheck color={COLORS.success} size={14} />
            <Text style={styles.securityText}>
              Secured with Supabase Postgres Authentication
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Animated Toast */}
      <Toast
        visible={toastConfig.visible}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        onDismiss={() => setToastConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  authCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    height: 48,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    marginLeft: 10,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  errorCardText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 12,
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBgLight,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});

