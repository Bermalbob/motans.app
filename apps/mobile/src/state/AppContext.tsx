import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

// ============================================================================
// TIPOS BASE
// ============================================================================

export type UserRole = "user" | "business" | "pro" | "admin";

export type SubscriptionPlan = "free" | "motans_basic" | "motans_plus" | "motans_pro";

export type UserNotificationPreferences = {
	categories: {
		[categoryKey: string]: {
			enabled: boolean;
			subcategories: {
				[subcategoryKey: string]: boolean;
			};
		};
	};
	channels: {
		[channelId: string]: {
			pushNotifications: boolean;
			muteUntil?: string | null;
		};
	};
};

export type UserChannelRole = "owner" | "moderator" | "member";

export type ChannelSummary = {
	id: string;
	name: string;
	townId: string;
	townName: string;
	isPublic: boolean;
	ownerId: string;
	memberCount: number;
	unreadCount: number;
	role?: UserChannelRole;
	category?: string;
	description?: string;
};

export type AuthUser = {
	id: string;
	username: string;
	displayName: string;
	email: string;
	phone?: string;
	avatarUrl?: string | null;
	townId: string | null;
	townName: string | null;
	role: UserRole;
	isBusiness: boolean;
	businessName?: string;
	businessTaxId?: string;
	businessType?: string;
	businessAddress?: string;
	businessHours?: string;
	subscriptionPlan: SubscriptionPlan;
	notificationPreferences: UserNotificationPreferences;
};

export type AppState = {
	user: AuthUser | null;
	selectedTownId: string | null;
	selectedTownName: string | null;
	userChannels: ChannelSummary[];
	isLoading: boolean;
};

// ============================================================================
// CONTEXTO
// ============================================================================

export type AppContextValue = AppState & {
	setUser: (user: AuthUser | null) => void;
	updateUserProfile: (partial: Partial<AuthUser>) => void;
	updateUserTown: (townId: string, townName: string) => void;
	setSelectedTown: (townId: string, townName: string) => void;
	setUserChannels: (channels: ChannelSummary[]) => void;
	addUserChannel: (channel: ChannelSummary) => void;
	removeUserChannel: (channelId: string) => void;
	logout: () => void;
	setLoading: (loading: boolean) => void;
};

const defaultNotificationPreferences: UserNotificationPreferences = {
	categories: {},
	channels: {},
};

const initialState: AppState = {
	user: null,
	selectedTownId: null,
	selectedTownName: null,
	userChannels: [],
	isLoading: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

type AppProviderProps = {
	children: ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
	const [state, setState] = useState<AppState>(initialState);

	const setUser = useCallback((user: AuthUser | null) => {
		setState((prev) => {
			if (user) {
				return {
					...prev,
					user,
					selectedTownId: user.townId ?? prev.selectedTownId,
					selectedTownName: user.townName ?? prev.selectedTownName,
				};
			}
			return { ...prev, user: null };
		});
	}, []);

	const updateUserProfile = useCallback((partial: Partial<AuthUser>) => {
		setState((prev) => {
			if (!prev.user) return prev;
			const updatedUser = { ...prev.user, ...partial };
			return { ...prev, user: updatedUser };
		});
	}, []);

	const updateUserTown = useCallback((townId: string, townName: string) => {
		setState((prev) => {
			const updatedUser = prev.user
				? { ...prev.user, townId, townName }
				: null;
			return {
				...prev,
				user: updatedUser,
				selectedTownId: townId,
				selectedTownName: townName,
			};
		});
	}, []);

	const setSelectedTown = useCallback((townId: string, townName: string) => {
		setState((prev) => ({
			...prev,
			selectedTownId: townId,
			selectedTownName: townName,
		}));
	}, []);

	const setUserChannels = useCallback((channels: ChannelSummary[]) => {
		setState((prev) => ({ ...prev, userChannels: channels }));
	}, []);

	const addUserChannel = useCallback((channel: ChannelSummary) => {
		setState((prev) => ({
			...prev,
			userChannels: [...prev.userChannels, channel],
		}));
	}, []);

	const removeUserChannel = useCallback((channelId: string) => {
		setState((prev) => ({
			...prev,
			userChannels: prev.userChannels.filter((c) => c.id !== channelId),
		}));
	}, []);

	const logout = useCallback(() => {
		setState({
			...initialState,
		});
	}, []);

	const setLoading = useCallback((loading: boolean) => {
		setState((prev) => ({ ...prev, isLoading: loading }));
	}, []);

	const value = useMemo<AppContextValue>(
		() => ({
			...state,
			setUser,
			updateUserProfile,
			updateUserTown,
			setSelectedTown,
			setUserChannels,
			addUserChannel,
			removeUserChannel,
			logout,
			setLoading,
		}),
		[
			state,
			setUser,
			updateUserProfile,
			updateUserTown,
			setSelectedTown,
			setUserChannels,
			addUserChannel,
			removeUserChannel,
			logout,
			setLoading,
		]
	);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useAppContext = (): AppContextValue => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within an AppProvider");
	}
	return context;
};

// ============================================================================
// HELPERS
// ============================================================================

export const createDefaultUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
	id: `user_${Date.now()}`,
	username: "",
	displayName: "",
	email: "",
	phone: undefined,
	avatarUrl: null,
	townId: null,
	townName: null,
	role: "user",
	isBusiness: false,
	subscriptionPlan: "free",
	notificationPreferences: defaultNotificationPreferences,
	...overrides,
});
