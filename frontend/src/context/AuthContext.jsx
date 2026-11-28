import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      const fullName =
        profile?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "Developer";

      const username =
        profile?.username ||
        authUser.user_metadata?.username ||
        authUser.email?.split("@")[0]?.toLowerCase().replace(/\s+/g, "-") ||
        "developer";

      return {
        id: authUser.id,
        email: authUser.email,
        name: fullName,
        username: username,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
        role: "Workspace Member",
      };
    } catch (e) {
      console.warn("Could not fetch user profile from Supabase:", e);
      return {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Developer",
        username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || "developer",
        role: "Workspace Member",
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            const profile = await fetchProfile(initialSession.user);
            setUser(profile);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Supabase auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        const profile = await fetchProfile(currentSession.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async ({ identifier, password }) => {
    const cleanId = (identifier || "").trim();
    let email = cleanId;

    // If identifier doesn't have an @, look up email in profiles table by username
    if (!cleanId.includes("@")) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .ilike("username", cleanId)
          .maybeSingle();

        if (profile?.email) {
          email = profile.email;
        } else {
          email = `${cleanId.toLowerCase()}@example.com`;
        }
      } catch {
        email = `${cleanId.toLowerCase()}@example.com`;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const profile = await fetchProfile(data.user);
    setUser(profile);
    return profile;
  };

  const signup = async ({ name, username, email, password }) => {
    const cleanName = (name || "").trim() || "Developer";
    const cleanUsername = (username || cleanName)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "");
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          username: cleanUsername,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("Could not upsert profile directly:", e);
      }
    }

    if (data.session) {
      const profile = await fetchProfile(data.user);
      setUser(profile);
      return profile;
    } else {
      try {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInData?.user) {
          const profile = await fetchProfile(signInData.user);
          setUser(profile);
          return profile;
        }
      } catch {
        // Fallback user object
      }
      const basicUser = {
        id: data.user?.id || "new-user",
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        role: "Workspace Owner",
      };
      setUser(basicUser);
      return basicUser;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Error signing out from Supabase:", e);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        logout,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
