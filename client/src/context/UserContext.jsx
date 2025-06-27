import { createContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/auth/profile", {
          credentials: "include", // Important for cookies to be sent
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // If response is not ok, we assume there's no valid session
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies to be stored
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return { success: true };
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Login failed" }));
        console.error("Login failed:", errorData);
        return { success: false, message: errorData.message || "Login failed" };
      }
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const register = async (name, email, password, age) => {
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies to be stored
        body: JSON.stringify({ name, email, password, age }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return { success: true };
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Registration failed" }));
        console.error("Registration failed:", errorData);
        return {
          success: false,
          message: errorData.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include", // Important for cookies to be sent
      });
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, login, register, logout, loginWithGoogle, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
