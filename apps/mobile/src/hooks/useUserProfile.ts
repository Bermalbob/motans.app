import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "../types/user";

const STORAGE_KEY = "motans:userProfile";

const mockProfile: UserProfile = {
  id: "u_001",
  username: "bar_el_rincon",
  fullName: "Bar El Rincón",
  email: "info@barelrincon.es",
  phone: "612345678",
  avatarUrl: null,
  townId: "villanueva",
  townName: "Villanueva de la Serena",
  role: "business",
  businessName: "Bar El Rincón S.L.",
  businessCategory: "bar",
  businessAddress: "Calle Mayor 15, 06700",
  businessDescription: "El mejor bar del pueblo",
  language: "es",
  notificationsEnabled: true,
  marketingEmails: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // TEMP: Forzar perfil de prueba para desarrollo
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProfile));
        setProfile(mockProfile);
      } catch {
        setError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = useCallback(async (next: UserProfile) => {
    try {
      const stamped = { ...next, updatedAt: new Date().toISOString() };
      setProfile(stamped);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
      return { ok: true } as const;
    } catch {
      return { ok: false, message: "No se ha podido guardar, revisa la conexión" } as const;
    }
  }, []);

  return { profile, setProfile, saveProfile, loading, error };
}

export async function saveUserProfile(next: UserProfile) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
