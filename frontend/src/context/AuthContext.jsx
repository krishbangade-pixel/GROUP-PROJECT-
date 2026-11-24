import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "reporadar_auth_user";

const DEFAULT_USER = {
  name: "Krish Bangade",
  username: "krishbangade-pixel",
  email: "krish@example.com",
  role: "Workspace Owner",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to sync user to localStorage", e);
    }
  }, [user]);

  const login = ({ identifier }) => {
    const cleanId = (identifier || "").trim();
    const username = cleanId.includes("@")
      ? cleanId.split("@")[0]
      : cleanId || "developer";
    const email = cleanId.includes("@")
      ? cleanId
      : `${username}@example.com`;

    const newUser = {
      name: username.charAt(0).toUpperCase() + username.slice(1),
      username: username.toLowerCase().replace(/\s+/g, "-"),
      email: email.toLowerCase(),
      role: "Member",
    };
    setUser(newUser);
    return newUser;
  };

  const signup = ({ name, username, email }) => {
    const cleanName = (name || "").trim() || "Developer";
    const cleanUsername = (username || cleanName)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const cleanEmail = (email || `${cleanUsername}@example.com`).trim().toLowerCase();

    const newUser = {
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      role: "Workspace Owner",
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
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
