import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  subscribeToAuthChanges, 
  signInWithGoogle as firebaseSignInWithGoogle, 
  signOut as firebaseSignOut,
  registerUserWithFirebase,
  getCurrentUser,
} from "@/lib/firebase";
import { type User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { initWebSocket, closeWebSocket } from "@/lib/websocket";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          // User is signed in, register or get existing user data
          const userData = await registerUserWithFirebase(firebaseUser);
          setUser(userData);
          
          // Initialize WebSocket connection
          initWebSocket(userData.id);
          
          // Prefetch user's active game if any
          queryClient.prefetchQuery({
            queryKey: ['/api/users', userData.id, 'active-game'],
          });
          
          // Prefetch user's invitations
          queryClient.prefetchQuery({
            queryKey: ['/api/users', userData.id, 'invitations'],
          });
        } else {
          // User is signed out
          setUser(null);
          queryClient.clear();
          // Close WebSocket connection
          closeWebSocket();
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "An error occurred during authentication",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  const signIn = async () => {
    try {
      setIsLoading(true);
      const { user: firebaseUser } = await firebaseSignInWithGoogle();
      // The auth state change listener will handle updating the user state
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "An error occurred during sign in",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      // The auth state change listener will handle clearing the user state
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: error instanceof Error ? error.message : "An error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
