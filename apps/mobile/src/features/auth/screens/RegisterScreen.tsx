import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Switch, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../types/navigation";
import type { RegisterRole, RegisterDataBase, RegisterDataBusiness } from "../types/auth";
import { useUserProfile } from "../../../hooks/useUserProfile";
import type { UserProfile as LegacyUser } from "../../../types/user";
import { searchMunicipios, type Municipio } from "../../../data/municipios";

// Colores Motans
const LIME = "#84CC16";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const BORDER_INPUT = "#9CA3AF";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const ERROR = "#DC2626";

type MutableRegister = Partial<RegisterDataBase> & Partial<Omit<RegisterDataBusiness, keyof RegisterDataBase>> & { 
  role?: RegisterRole;
  address?: string;
  businessNif?: string;
  billingAddress?: string;
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { saveProfile } = useUserProfile();
  const [step, setStep] = useState<0 | 1>(0);
  const [role, setRole] = useState<RegisterRole | null>(null);
  const [form, setForm] = useState<MutableRegister>({ language: "es", acceptTerms: false, isAdult: false });
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [differentBilling, setDifferentBilling] = useState(false);

  // Town search modal
  const [townModalOpen, setTownModalOpen] = useState(false);
  const [townQuery, setTownQuery] = useState("");
  const [townResults, setTownResults] = useState<Municipio[]>([]);

  const setField = <K extends keyof MutableRegister>(k: K, v: MutableRegister[K]) => setForm((prev) => ({ ...prev, [k]: v }));

  // Password validation
  const validatePassword = (pwd: string) => {
    if (!pwd || pwd.length < 8) return { ok: false, msg: "Mínimo 8 caracteres" };
    if (!/[A-Z]/.test(pwd)) return { ok: false, msg: "Debe tener al menos una mayúscula" };
    if (!/[a-z]/.test(pwd)) return { ok: false, msg: "Debe tener al menos una minúscula" };
    if (!/[^a-zA-Z0-9]/.test(pwd)) return { ok: false, msg: "Debe tener un carácter especial (@, %, /, etc.)" };
    return { ok: true, msg: "" };
  };

  const pwdValidation = validatePassword(form.password ?? "");

  const canProceed = () => {
    const usernameOk = !!form.username && /^\w{3,20}$/.test(form.username);
    const emailOk = !!form.email;
    const phoneOk = !!form.phone;
    const pwdOk = pwdValidation.ok;
    const confirmOk = passwordConfirm === form.password;
    const townOk = !!form.town;
    const checksOk = form.acceptTerms && form.isAdult;
    
    if (role === "business") {
      const businessOk = !!form.fullName && !!form.businessType && !!form.businessNif;
      return usernameOk && emailOk && phoneOk && pwdOk && confirmOk && townOk && checksOk && businessOk;
    }
    return usernameOk && emailOk && phoneOk && pwdOk && confirmOk && townOk && checksOk;
  };

  const handleTownSearch = (text: string) => {
    setTownQuery(text);
    if (text.length >= 2) {
      setTownResults(searchMunicipios(text, 10));
    } else {
      setTownResults([]);
    }
  };

  const onSubmit = async () => {
    if (!role || !canProceed()) {
      Alert.alert("Faltan datos", "Completa todos los campos obligatorios");
      return;
    }

    const now = new Date().toISOString();
    const lang = form.language === "es" || form.language === "en" ? form.language : "other";
    const legacy: LegacyUser = {
      id: `user_${Date.now()}`,
      username: String(form.username),
      fullName: String(form.fullName || ""),
      email: form.email ? String(form.email) : "",
      phone: form.phone ? String(form.phone) : undefined,
      avatarUrl: null,
      townId: undefined,
      townName: String(form.town),
      role: role === "business" ? "business" : "personal",
      businessName: role === "business" ? String(form.fullName) : undefined,
      businessCategory: role === "business" ? form.businessType : undefined,
      businessAddress: role === "business" ? form.address : undefined,
      businessDescription: undefined,
      language: lang,
      notificationsEnabled: true,
      marketingEmails: !!form.marketing,
      createdAt: now,
      updatedAt: now,
    };

    const res = await saveProfile(legacy);
    if (res.ok) {
      Alert.alert("¡Bienvenido!", "Tu cuenta ha sido creada correctamente.");
      navigation.replace("Account");
    } else {
      Alert.alert("Error", res.message ?? "No se pudo crear la cuenta");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        {step > 0 && (
          <Pressable style={styles.backBtn} onPress={() => setStep(0)}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.headerTitle}>Crea tu cuenta</Text>
      <Text style={styles.headerSubtitle}>Únete a tu pueblo en Motans</Text>

      {/* PASO 0: Selección de rol */}
      {step === 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¿Cómo te registras?</Text>
          <View style={styles.roleRow}>
            <Pressable 
              style={[styles.roleBtn, role === "user" && styles.roleBtnActive]} 
              onPress={() => { setRole("user"); setStep(1); }}
            >
              <Text style={styles.roleEmoji}>👤</Text>
              <Text style={styles.roleLabel}>Soy particular</Text>
            </Pressable>
            <Pressable 
              style={[styles.roleBtn, role === "business" && styles.roleBtnActive]} 
              onPress={() => { setRole("business"); setStep(1); }}
            >
              <Text style={styles.roleEmoji}>🏪</Text>
              <Text style={styles.roleLabel}>Soy negocio</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* PASO 1: Formulario */}
      {step === 1 && (
        <>
          {/* ==================== DATOS BÁSICOS ==================== */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos básicos</Text>

            <Text style={styles.label}>
              Nombre de usuario<Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.inputWithClear}>
              <TextInput
                style={styles.inputInner}
                value={form.username ?? ""}
                onChangeText={(t) => setField("username", t)}
                placeholder={role === "business" ? "ej. bar_el_rincon" : "ej. juan_pueblo"}
                placeholderTextColor={TEXT_MUTED}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {form.username ? (
                <Pressable style={styles.clearBtn} onPress={() => setField("username", "")}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </Pressable>
              ) : null}
            </View>

            {role === "business" ? (
              <>
                <Text style={styles.label}>
                  Tipo de negocio<Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.inputWithClear}>
                  <TextInput
                    style={styles.inputInner}
                    value={form.businessType ?? ""}
                    onChangeText={(t) => setField("businessType", t)}
                    placeholder="bar, restaurante, tienda..."
                    placeholderTextColor={TEXT_MUTED}
                  />
                  {form.businessType ? (
                    <Pressable style={styles.clearBtn} onPress={() => setField("businessType", "")}>
                      <Text style={styles.clearBtnText}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Nombre completo</Text>
                <View style={styles.inputWithClear}>
                  <TextInput
                    style={styles.inputInner}
                    value={form.fullName ?? ""}
                    onChangeText={(t) => setField("fullName", t)}
                    placeholder="Juan García López"
                    placeholderTextColor={TEXT_MUTED}
                  />
                  {form.fullName ? (
                    <Pressable style={styles.clearBtn} onPress={() => setField("fullName", "")}>
                      <Text style={styles.clearBtnText}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            )}

            <Text style={styles.label}>
              Pueblo<Text style={styles.required}> *</Text>
            </Text>
            <Pressable style={styles.inputTouchable} onPress={() => setTownModalOpen(true)}>
              <Text style={form.town ? styles.inputText : styles.inputPlaceholder}>
                {form.town ? String(form.town) : "Buscar pueblo..."}
              </Text>
              {form.town ? (
                <Pressable style={styles.clearBtn} onPress={() => setField("town", undefined)}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </Pressable>
              ) : (
                <Text style={styles.searchIcon}>🔍</Text>
              )}
            </Pressable>
          </View>

          {/* ==================== DATOS DEL NEGOCIO (solo business) ==================== */}
          {role === "business" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Datos del negocio</Text>

              <Text style={styles.label}>
                Nombre social<Text style={styles.required}> *</Text>
              </Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.fullName ?? ""}
                  onChangeText={(t) => { setField("fullName", t); setField("businessName", t); }}
                  placeholder="Bar El Rincón S.L."
                  placeholderTextColor={TEXT_MUTED}
                />
                {form.fullName ? (
                  <Pressable style={styles.clearBtn} onPress={() => { setField("fullName", ""); setField("businessName", ""); }}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>
                NIF / CIF<Text style={styles.required}> *</Text>
              </Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.businessNif ?? ""}
                  onChangeText={(t) => setField("businessNif", t)}
                  placeholder="B12345678"
                  placeholderTextColor={TEXT_MUTED}
                  autoCapitalize="characters"
                />
                {form.businessNif ? (
                  <Pressable style={styles.clearBtn} onPress={() => setField("businessNif", "")}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>
                Teléfono<Text style={styles.required}> *</Text>
              </Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.phone ?? ""}
                  onChangeText={(t) => setField("phone", t)}
                  placeholder="612 345 678"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="phone-pad"
                />
                {form.phone ? (
                  <Pressable style={styles.clearBtn} onPress={() => setField("phone", "")}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>Dirección completa</Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.address ?? ""}
                  onChangeText={(t) => setField("address", t)}
                  placeholder="Calle Mayor 5, 28001 Madrid"
                  placeholderTextColor={TEXT_MUTED}
                />
                {form.address ? (
                  <Pressable style={styles.clearBtn} onPress={() => setField("address", "")}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}

          {/* ==================== DATOS DE FACTURACIÓN (solo business) ==================== */}
          {role === "business" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Datos de facturación</Text>
              
              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Usar datos diferentes para facturación</Text>
                <Switch
                  value={differentBilling}
                  onValueChange={setDifferentBilling}
                  trackColor={{ false: BORDER, true: LIME }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {differentBilling ? (
                <>
                  <Text style={styles.label}>Dirección fiscal</Text>
                  <View style={styles.inputWithClear}>
                    <TextInput
                      style={styles.inputInner}
                      value={form.billingAddress ?? ""}
                      onChangeText={(t) => setField("billingAddress", t)}
                      placeholder="Dirección para facturas"
                      placeholderTextColor={TEXT_MUTED}
                    />
                    {form.billingAddress ? (
                      <Pressable style={styles.clearBtn} onPress={() => setField("billingAddress", "")}>
                        <Text style={styles.clearBtnText}>✕</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </>
              ) : (
                <Text style={styles.infoText}>Se usarán los datos del negocio para facturación.</Text>
              )}
            </View>
          )}

          {/* ==================== CONTACTO (solo particular) ==================== */}
          {role === "user" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Contacto</Text>

              <Text style={styles.label}>
                Email<Text style={styles.required}> *</Text>
              </Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.email ?? ""}
                  onChangeText={(t) => setField("email", t)}
                  placeholder="tu@email.com"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {form.email ? (
                  <Pressable style={styles.clearBtn} onPress={() => setField("email", "")}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>
                Teléfono<Text style={styles.required}> *</Text>
              </Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.phone ?? ""}
                  onChangeText={(t) => setField("phone", t)}
                  placeholder="612 345 678"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="phone-pad"
                />
                {form.phone ? (
                  <Pressable style={styles.clearBtn} onPress={() => setField("phone", "")}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>Dirección</Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.address ?? ""}
                  onChangeText={(t) => setField("address", t)}
                  placeholder="Calle, número, piso..."
                  placeholderTextColor={TEXT_MUTED}
                />
                {form.address ? (
                  <Pressable style={styles.clearBtn} onPress={() => setField("address", "")}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}

          {/* ==================== EMAIL (solo business, después de datos negocio) ==================== */}
          {role === "business" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Contacto digital</Text>

              <Text style={styles.label}>
                Email<Text style={styles.required}> *</Text>
              </Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  style={styles.inputInner}
                  value={form.email ?? ""}
                  onChangeText={(t) => setField("email", t)}
                  placeholder="negocio@email.com"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {form.email ? (
                  <Pressable style={styles.clearBtn} onPress={() => setField("email", "")}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}

          {/* ==================== SEGURIDAD ==================== */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seguridad</Text>

            <Text style={styles.label}>
              Contraseña<Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.inputWithClear}>
              <TextInput
                style={styles.inputInner}
                value={form.password ?? ""}
                onChangeText={(t) => setField("password", t)}
                placeholder="Mín. 8, mayúscula, minúscula y símbolo"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showPassword}
              />
              {form.password ? (
                <Pressable style={styles.clearBtn} onPress={() => setField("password", "")}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁"}</Text>
              </Pressable>
            </View>
            {form.password && !pwdValidation.ok && (
              <Text style={styles.errorHint}>{pwdValidation.msg}</Text>
            )}

            <Text style={styles.label}>
              Repite la contraseña<Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.inputWithClear}>
              <TextInput
                style={styles.inputInner}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="Escribe de nuevo tu contraseña"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showConfirm}
              />
              {passwordConfirm ? (
                <Pressable style={styles.clearBtn} onPress={() => setPasswordConfirm("")}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "👁"}</Text>
              </Pressable>
            </View>
            {passwordConfirm && passwordConfirm !== form.password && (
              <Text style={styles.errorHint}>Las contraseñas no coinciden</Text>
            )}
          </View>

          {/* ==================== TÉRMINOS ==================== */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Condiciones</Text>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>Acepto los términos y condiciones<Text style={styles.required}> *</Text></Text>
              <Switch
                value={!!form.acceptTerms}
                onValueChange={(v) => setField("acceptTerms", v)}
                trackColor={{ false: BORDER, true: LIME }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>Soy mayor de edad<Text style={styles.required}> *</Text></Text>
              <Switch
                value={!!form.isAdult}
                onValueChange={(v) => setField("isAdult", v)}
                trackColor={{ false: BORDER, true: LIME }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ==================== BOTÓN CREAR CUENTA ==================== */}
          <Pressable
            style={[styles.submitBtn, !canProceed() && styles.submitBtnDisabled]}
            disabled={!canProceed()}
            onPress={onSubmit}
          >
            <Text style={styles.submitBtnText}>Crear cuenta</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </>
      )}

      {/* ==================== MODAL BÚSQUEDA PUEBLO ==================== */}
      <Modal visible={townModalOpen} transparent animationType="fade" onRequestClose={() => setTownModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona tu pueblo</Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Buscar pueblo..."
                placeholderTextColor={TEXT_MUTED}
                autoCapitalize="words"
                autoCorrect={false}
                value={townQuery}
                onChangeText={handleTownSearch}
                autoFocus
              />
              {townQuery ? (
                <Pressable style={styles.modalInputClear} onPress={() => { setTownQuery(""); setTownResults([]); }}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {townResults.map((m) => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [styles.modalRow, pressed && { backgroundColor: "#F3F4F6" }]}
                  onPress={() => {
                    setField("town", m.nm);
                    setTownModalOpen(false);
                    setTownQuery("");
                    setTownResults([]);
                  }}
                >
                  <Text style={styles.modalRowText}>{m.nm}</Text>
                  <Text style={styles.modalRowSub}>{m.province ?? ""}</Text>
                </Pressable>
              ))}
              {townQuery.length >= 2 && townResults.length === 0 && (
                <Text style={styles.modalEmpty}>No hay resultados para "{townQuery}"</Text>
              )}
              {townQuery.length < 2 && townQuery.length > 0 && (
                <Text style={styles.modalEmpty}>Escribe al menos 2 letras</Text>
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButtonCancel}
                onPress={() => { setTownModalOpen(false); setTownQuery(""); setTownResults([]); }}
              >
                <Text style={styles.modalButtonCancelText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 20,
  },
  
  // Header
  headerRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  backBtnText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 17,
    color: TEXT_SECONDARY,
    marginBottom: 20,
  },

  // Cards
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },

  // Role selection
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  roleBtnActive: {
    borderColor: LIME,
    backgroundColor: "#F0FDF4",
  },
  roleEmoji: {
    fontSize: 40,
  },
  roleLabel: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    marginTop: 8,
    fontWeight: "600",
  },

  // Labels & Inputs
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 12,
  },
  required: {
    color: ERROR,
    fontWeight: "400",
  },
  inputWithClear: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER_INPUT,
    borderRadius: 10,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  inputTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER_INPUT,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: TEXT_MUTED,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearBtnText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontWeight: "600",
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeIcon: {
    fontSize: 18,
  },
  searchIcon: {
    fontSize: 18,
  },
  errorHint: {
    fontSize: 13,
    color: ERROR,
    marginTop: 6,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 8,
  },

  // Toggle rows
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleText: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    marginRight: 12,
  },

  // Submit button
  submitBtn: {
    backgroundColor: LIME,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: CARD,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_INPUT,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    color: TEXT_PRIMARY,
  },
  modalInputClear: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalList: {
    maxHeight: 280,
  },
  modalRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalRowText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  modalRowSub: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  modalEmpty: {
    textAlign: "center",
    color: TEXT_MUTED,
    paddingVertical: 20,
    fontSize: 14,
  },
  modalActions: {
    marginTop: 16,
    alignItems: "center",
  },
  modalButtonCancel: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
});
