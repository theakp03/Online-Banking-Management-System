
import { createContext, useContext, useState } from "react";
import {
    loginUser,
    registerUser,
    logoutUser
} from "../services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Login user
    const login = async (email, password) => {

        const data = await loginUser({
            username: email,
            password: password
        });

        sessionStorage.setItem("access", data.access);
        sessionStorage.setItem("refresh", data.refresh);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);

        return data.user;
    };

    // Register user
    const register = async (userData) => {
        return await registerUser(userData);
    };

    // Logout user
    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            sessionStorage.removeItem("access");
            sessionStorage.removeItem("refresh");
            sessionStorage.removeItem("user");

            setUser(null);

            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
