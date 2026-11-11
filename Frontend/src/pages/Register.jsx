
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {

    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        password2: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(form);

            alert("Registration successful! Please login.");

            navigate("/login");

        } catch (err) {
            const data = err.response?.data;

            setError(
                data?.email?.[0] ||
                data?.password?.[0] ||
                data?.password2?.[0] ||
                data?.detail ||
                "Registration failed. Please check your details."
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
                    Create Banking Account
                </h2>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <input
                        className="form-control mb-3"
                        name="full_name"
                        placeholder="Full Name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="form-control mb-3"
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="form-control mb-3"
                        name="phone"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="form-control mb-3"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="form-control mb-3"
                        type="password"
                        name="password2"
                        placeholder="Confirm Password"
                        value={form.password2}
                        onChange={handleChange}
                        required
                    />

                    <button
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                </form>

                <p className="text-center mt-3">
                    Already registered?{" "}
                    <Link to="/login">Login</Link>
                </p>

            </div>
        </div>
    );
}

export default Register;
