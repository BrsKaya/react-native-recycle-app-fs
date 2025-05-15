import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from "../constants/api"

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    hasSeenOnboarding: false,

    setHasSeenOnboarding: async () => {
        try {
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
            set({ hasSeenOnboarding: true });
        } catch (error) {
            console.error("Error setting onboarding status:", error);
        }
    },

    checkOnboarding: async () => {
        try {
            const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
            set({ hasSeenOnboarding: hasSeen === "true" });
        } catch (error) {
            console.error("Error checking onboarding status:", error);
        }
    },

    updateUserData: async (newUserData) => {
        try {
            const currentUser = await AsyncStorage.getItem("user");
            if (!currentUser) return;

            const updatedUser = {
                ...JSON.parse(currentUser),
                ...newUserData
            };

            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            set({ user: updatedUser });
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    },

    register: async (username, email, password) => {
        set({ isLoading: true });

        try {
            console.log('Attempting register with:', { username, email });
            
            const response = await fetch(`${API_URL}/auth/register`,{
                method: "POST",
                headers:{
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            })

            const data = await response.json();
            console.log('Register response:', data);

            if(!response.ok) throw new Error(data.message || "Something went wrong");

            // Convert id to _id
            const userData = {
                ...data.user,
                _id: data.user.id
            };
            delete userData.id;

            console.log('Processed user data:', userData);

            if (!userData._id) {
                throw new Error("Invalid user data received from server");
            }

            console.log('Storing user data:', userData);
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            await AsyncStorage.setItem("token", data.token);

            set({token: data.token, user: userData, isLoading: false});

            // Verify the data was stored correctly
            const storedUser = await AsyncStorage.getItem("user");
            console.log('Stored user data:', storedUser);

            return{ success: true };

        } catch (error) {
            console.error('Register error:', error);
            set({isLoading: false});
            return { success:false, error: error.message};
        }
    },

    login: async(email,password) => {
        set({isLoading: true});
        try {
            console.log('Attempting login with:', { email });
            
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();
            console.log('Login response:', data);

            if(!response.ok) throw new Error(data.message || "Something went wrong");

            // Convert id to _id
            const userData = {
                ...data.user,
                _id: data.user.id
            };
            delete userData.id;

            console.log('Processed user data:', userData);

            if (!userData._id) {
                throw new Error("Invalid user data received from server");
            }

            // Store token and user data
            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            // Update state
            set({token: data.token, user: userData, isLoading: false});
            
            // Verify storage
            const storedToken = await AsyncStorage.getItem("token");
            const storedUser = await AsyncStorage.getItem("user");
            console.log('Stored token:', storedToken);
            console.log('Stored user:', storedUser);
            
            return{ success: true };
            
        } catch (error) {
            console.error('Login error:', error);
            set({isLoading: false});
            return { success:false, error: error.message};
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            
            console.log('Checking auth - stored token:', token);
            console.log('Checking auth - stored user:', userJson);
            
            if (!token || !userJson) {
                console.log('No token or user data found in storage');
                set({token: null, user: null});
                return;
            }

            // Token validation check
            try {
                console.log('Validating token:', token);
                const response = await fetch(`${API_URL}/auth/validate`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Token validation response status:', response.status);
                
                if (!response.ok) {
                    console.log('Token validation failed');
                    await AsyncStorage.removeItem("token");
                    await AsyncStorage.removeItem("user");
                    set({token: null, user: null});
                    return;
                }

                const data = await response.json();
                console.log('Token validation response:', data);

                if (!data.valid) {
                    console.log('Token is invalid');
                    await AsyncStorage.removeItem("token");
                    await AsyncStorage.removeItem("user");
                    set({token: null, user: null});
                    return;
                }

                const parsedUser = JSON.parse(userJson);
                console.log('Parsed user data:', parsedUser);

                // Convert id to _id if needed
                const userData = {
                    ...parsedUser,
                    _id: parsedUser.id || parsedUser._id
                };
                if (userData.id) delete userData.id;

                console.log('Processed user data:', userData);

                if (!userData._id) {
                    console.log('Invalid user data - no _id found');
                    set({token: null, user: null});
                    return;
                }

                // Store the converted data back to AsyncStorage
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                console.log('Updated user data in storage');

                set({token, user: userData});
                console.log('Auth check successful');
                
            } catch (error) {
                console.error('Token validation error:', error);
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("user");
                set({token: null, user: null});
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            set({token: null, user: null});
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            set({token: null, user: null});
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },
}));