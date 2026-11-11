
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {

    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const user = await login(email, password);

            navigate(
                user.role === "customer"
                    ? "/dashboard"
                    : "/dashboard"
            );

        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Invalid email or password."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">

            <div className="card mx-auto p-4"
                style={{ maxWidth: "450px" }}>

                <h2 className="text-center mb-4">
                    Banking Login
                </h2>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        className="form-control mb-3"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="text-center mt-3">
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>

            </div>
        </div>
    );
}

export default Login;
