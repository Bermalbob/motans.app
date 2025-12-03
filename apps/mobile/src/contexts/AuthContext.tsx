/**
 * AuthContext - Contexto de autenticación (placeholder)
 * 
 * Este contexto se conectará con Firebase Auth cuando implementemos
 * la autenticación real. Por ahora devuelve un usuario demo.
 */
import React, { createContext, useContext, useState, type ReactNode } from "react";

// ============================================================================
// TIPOS
// ============================================================================
interface User {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
	emailVerified: boolean;
	phoneNumber: string | null;
	// Campos adicionales de Motans
	currentTownId?: string;
	homeTownId?: string;
	avatar?: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
	updateUser: (updates: Partial<User>) => Promise<void>;
}

// ============================================================================
// CONTEXTO
// ============================================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================
interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	// Usuario demo para desarrollo
	const [user, setUser] = useState<User | null>({
		uid: "demo-user-123",
		email: "demo@motans.app",
		displayName: "Usuario Demo",
		photoURL: null,
		emailVerified: true,
		phoneNumber: null,
	});
	const [isLoading, setIsLoading] = useState(false);

	const signIn = async (_email: string, _password: string): Promise<void> => {
		setIsLoading(true);
		// TODO: Implementar con Firebase Auth
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setUser({
			uid: "demo-user-123",
			email: _email,
			displayName: "Usuario Demo",
			photoURL: null,
			emailVerified: true,
			phoneNumber: null,
		});
		setIsLoading(false);
	};

	const signUp = async (_email: string, _password: string): Promise<void> => {
		setIsLoading(true);
		// TODO: Implementar con Firebase Auth
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setIsLoading(false);
	};

	const signOut = async (): Promise<void> => {
		setIsLoading(true);
		// TODO: Implementar con Firebase Auth
		await new Promise((resolve) => setTimeout(resolve, 500));
		setUser(null);
		setIsLoading(false);
	};

	const resetPassword = async (_email: string): Promise<void> => {
		// TODO: Implementar con Firebase Auth
		await new Promise((resolve) => setTimeout(resolve, 1000));
	};

	const updateUser = async (updates: Partial<User>): Promise<void> => {
		// TODO: Implementar con Firebase/Firestore
		if (user) {
			setUser({ ...user, ...updates });
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated: !!user,
		signIn,
		signUp,
		signOut,
		resetPassword,
		updateUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth debe usarse dentro de un AuthProvider");
	}
	return context;
};

export default AuthContext;
