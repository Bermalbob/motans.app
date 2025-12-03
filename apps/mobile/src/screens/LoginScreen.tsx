import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../types/navigation";
import { useAppContext, AuthUser } from "../state/AppContext";
import { sanitizeEmail, validateEmail } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { setUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailError(null);
  }, []);

  const handleMagicLink = useCallback(async () => {
    // Sanitizar y validar email
    const sanitizedEmail = sanitizeEmail(email);
    const validation = validateEmail(sanitizedEmail);
    
    if (!validation.isValid) {
      setEmailError(validation.error || "Email inválido");
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear usuario mock para demo
      const mockUser: AuthUser = {
        id: `user-${Date.now()}`,
        email: sanitizedEmail,
        username: sanitizedEmail.split("@")[0],
        displayName: sanitizedEmail.split("@")[0],
        role: "user",
        isBusiness: false,
        townId: null,
        townName: null,
        subscriptionPlan: "free",
        notificationPreferences: { categories: {}, channels: {} },
      };
      
      // Guardar sesión en AppContext
      setUser(mockUser);
      
      setEmailSent(true);
      Alert.alert(
        "¡Bienvenido! 👋",
        `Sesión iniciada como ${sanitizedEmail}`,
        [{ text: "Continuar", onPress: () => navigation.replace("Home") }]
      );
    } catch {
      Alert.alert("Error", "No pudimos iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [email, setUser, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
        </View>

        {/* TÍTULO */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para acceder a tu cuenta
          </Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={emailError ? "#EF4444" : "#6B7280"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError && (
              <Text style={styles.errorText}>{emailError}</Text>
            )}
          </View>

          {/* Success Message */}
          {emailSent && (
            <View style={styles.successMessage}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.successText}>
                ¡Link enviado! Revisa tu correo {email}
              </Text>
            </View>
          )}

          {/* Botón Magic Link */}
          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleMagicLink}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginButtonText}>Enviando...</Text>
            ) : (
              <Text style={styles.loginButtonText}>Enviar link mágico</Text>
            )}
          </Pressable>
        </View>

        {/* Registro */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>Regístrate</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: "#111827",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: "#06B6D4",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#06B6D4",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: "#065F46",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#06B6D4",
  },
});
