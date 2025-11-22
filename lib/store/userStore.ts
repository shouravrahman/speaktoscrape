import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client"; // Client-side Supabase client
import { QueryClient, useQuery } from "@tanstack/react-query"; // NEW: Import QueryClient and useQuery
import { useEffect } from "react";

// Define a type for the combined user data (Supabase User + UserProfile)
interface UserData {
	user: User | null;
	userProfile: UserProfile | null;
	subscription: Subscription | null;
}

// Query key for React Query
const USER_QUERY_KEY = ["userData"];

// Function to fetch user data (for React Query)
const fetchUserData = async (): Promise<UserData> => {
	const supabase = await createClient();
	const {
		data: { user: authUser },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError) {
		throw authError;
	}

	let userProfile: UserProfile | null = null;
	let subscription: Subscription | null = null;

	if (authUser) {
		const { data: profileData, error: profileError } = await supabase
			.from("user_profiles")
			.select("*")
			.eq("user_id", authUser.id)
			.single();

		if (profileError && profileError.code !== "PGRST116") {
			throw profileError;
		}

		if (profileData) {
			userProfile = profileData;
			subscription = {
				current_plan_id: profileData.subscription_tier,
				status: profileData.subscription_status,
			};
		}
	}

	return { user: authUser, userProfile, subscription };
};

interface UserProfile {
	user_id: string;
	credits: number;
	subscription_tier: string; // 'free', 'pro', 'business'
	subscription_status: string; // 'active', 'inactive', 'cancelled', etc.
	lemonsqueezy_customer_id: string | null;
	lemonsqueezy_subscription_id: string | null;
	company_name: string | null;
	role: string | null;
	use_case: string | null;
	account_type: string | null;
	// Add other profile fields as needed
}

interface Subscription {
	current_plan_id: string;
	status: string;
}

interface UserStoreState {
	user: User | null;
	userProfile: UserProfile | null;
	subscription: Subscription | null;
	// isLoading: boolean; // Managed by React Query
	// error: string | null; // Managed by React Query
	setUser: (user: User | null) => void;
	setUserProfile: (profile: UserProfile | null) => void;
	setSubscription: (subscription: Subscription | null) => void;
	// setIsLoading: (loading: boolean) => void; // Managed by React Query
	// setError: (error: string | null) => void; // Managed by React Query
}

export const UserStore = create<UserStoreState>((set, get) => ({
	user: null,
	userProfile: null,
	subscription: null,
	// isLoading: true,
	// error: null,
	setUser: (user) => set({ user }),
	setUserProfile: (userProfile) => set({ userProfile }),
	setSubscription: (subscription) => set({ subscription }),
	// setIsLoading: (isLoading) => set({ isLoading }),
	// setError: (error) => set({ error }),
}));

// Custom hook to integrate React Query with Zustand
export const useUser = () => {
	const { data, isLoading, error } = useQuery<UserData, Error>({
		queryKey: USER_QUERY_KEY,
		queryFn: fetchUserData,
		staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
		refetchOnWindowFocus: false, // Optional: adjust as needed
	});

	const { setUser, setUserProfile, setSubscription } = UserStore();

	useEffect(() => {
		if (data) {
			setUser(data.user);
			setUserProfile(data.userProfile);
			setSubscription(data.subscription);
		} else if (!isLoading && !error) {
			// If no data and not loading and no error, it means user is logged out
			setUser(null);
			setUserProfile(null);
			setSubscription(null);
		}
	}, [data, isLoading, error, setUser, setUserProfile, setSubscription]);

	return {
		user: data?.user,
		userProfile: data?.userProfile,
		subscription: data?.subscription,
		isLoading,
		error,
	};
};

// Create a global QueryClient instance for non-React contexts
const globalQueryClient = new QueryClient();

// Set up auth state change listener outside the hook
// This ensures the store is updated even if no component is mounted
const supabase = createClient();
supabase.auth.onAuthStateChange((_event, session) => {
	if (session?.user) {
		// Invalidate and refetch user data when auth state changes (e.g., login/signup)
		globalQueryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
	} else {
		// Clear user data from Zustand store and React Query cache on logout
		UserStore.getState().setUser(null);
		UserStore.getState().setUserProfile(null);
		UserStore.getState().setSubscription(null);
		globalQueryClient.removeQueries({ queryKey: USER_QUERY_KEY });
	}
});
