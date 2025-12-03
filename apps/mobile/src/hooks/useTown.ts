/**
 * CUSTOM HOOKS - MOTANS
 * 
 * Hooks reutilizables para lógica común de la aplicación.
 */

import { useAuth } from "../contexts/AuthContext";

/**
 * Hook para obtener el pueblo actual del usuario
 * 
 * Devuelve información del pueblo donde el usuario está publicando actualmente.
 * 
 * REGLA: currentTownId es el pueblo activo para publicaciones.
 * Si el usuario cambia de pueblo en su perfil, se actualiza currentTownId.
 */
export function useCurrentTown(): {
  townId: string | null;
  townName: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const { user } = useAuth();
  
  if (!user) {
    return {
      townId: null,
      townName: null,
      isLoading: false,
      error: "Usuario no autenticado",
    };
  }
  
  // TODO(Motans): Cuando tengamos backend, fetchear datos completos del pueblo
  // const { data: town, isLoading, error } = useTownQuery(user.currentTownId);
  
  // Por ahora, devolvemos datos básicos
  return {
    townId: user.currentTownId ?? null,
    townName: user.currentTownId ? `Pueblo ${user.currentTownId}` : null, // TODO: Obtener nombre real
    isLoading: false,
    error: null,
  };
}

/**
 * Hook para obtener el pueblo principal del usuario
 * 
 * Este es el pueblo que el usuario eligió en el registro.
 * Solo cambia si el usuario actualiza su perfil explícitamente.
 */
export function useHomeTown(): {
  townId: string | null;
  townName: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const { user } = useAuth();
  
  if (!user) {
    return {
      townId: null,
      townName: null,
      isLoading: false,
      error: "Usuario no autenticado",
    };
  }
  
  // TODO(Motans): Fetchear datos completos del pueblo desde backend
  
  return {
    townId: user.homeTownId ?? null,
    townName: user.homeTownId ? `Pueblo ${user.homeTownId}` : null, // TODO: Obtener nombre real
    isLoading: false,
    error: null,
  };
}

/**
 * Hook para cambiar el pueblo activo del usuario
 * 
 * Cuando el usuario cambia de pueblo en su perfil:
 * 1. Se actualiza homeTownId
 * 2. Se actualiza currentTownId
 * 3. Las nuevas publicaciones irán al nuevo pueblo
 */
export function useChangeTown() {
  const { user, updateUser } = useAuth();
  
  const changeTown = async (newTownId: string, _newTownName: string) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    
    // TODO(Motans): Implementar actualización en backend
    // await api.users.updateTown(user.id, { homeTownId: newTownId, currentTownId: newTownId });
    
    // TODO: Decidir qué hacer con publicaciones antiguas:
    // Opción A: Mantenerlas en pueblo original
    // Opción B: Moverlas al nuevo pueblo
    // Opción C: Preguntar al usuario
    
    console.log(`Cambiar pueblo de ${user.currentTownId} a ${newTownId}`);
    // Persistimos en el AuthContext (y AsyncStorage) para que toda la app reaccione
    await updateUser({ homeTownId: newTownId, currentTownId: newTownId });
  };
  
  return { changeTown };
}

/**
 * Ejemplo de uso en componentes:
 * 
 * function MyComponent() {
 *   const { townId, townName, isLoading } = useCurrentTown();
 *   
 *   if (isLoading) return <ActivityIndicator />;
 *   
 *   return <Text>Estás en {townName}</Text>;
 * }
 */
