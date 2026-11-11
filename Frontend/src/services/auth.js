
import api from "./api";

// Register customer
export const registerUser = async (userData) => {
    const response = await api.post(
        "users/register/",
        userData
    );

    return response.data;
};

// Login customer
export const loginUser = async (credentials) => {
    const response = await api.post(
        "users/login/",
        credentials
    );

    return response.data;
};

export const logoutUser = async () => {
    const refreshToken = sessionStorage.getItem("refresh");

    try {
        if (refreshToken) {
            await api.post("users/logout/", {
                refresh: refreshToken,
            });
        }
    } finally {
        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        sessionStorage.removeItem("user");
    }
};
