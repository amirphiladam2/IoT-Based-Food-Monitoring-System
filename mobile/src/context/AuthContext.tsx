import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebase";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  isFirstLaunch: boolean | null;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isFirstLaunch: null,
  logout: async () => {},
  completeOnboarding: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  
  // Need AsyncStorage to check first launch
  React.useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
        if (hasSeenOnboarding === "true") {
          setIsFirstLaunch(false);
        } else {
          setIsFirstLaunch(true);
        }
      } catch {
        setIsFirstLaunch(true);
      }
    };
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setIsFirstLaunch(false);
    } catch (error) {
      console.log("Error saving onboarding state:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, isFirstLaunch, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};
