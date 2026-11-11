
import { useAuth } from "../context/AuthContext";

function Dashboard() {

    const { user, logout } = useAuth();

    return (
        <div className="container mt-5">

            <div className="card p-4">

                <h1>Welcome to Online Banking</h1>

                <h3>Hello, {user?.full_name}</h3>

                <p>Email: {user?.email}</p>

                <p>Role: {user?.role}</p>

                <button
                    className="btn btn-danger mt-3"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>

        </div>
    );
}

export default Dashboard;
