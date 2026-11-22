
import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ROLE_OPTIONS = [
    { value: "customer", label: "Customer" },
    { value: "banking_staff", label: "Banking Staff" },
    { value: "manager", label: "Manager" },
    { value: "administrator", label: "Administrator" },
];

function AdministratorDashboard() {
    const { user, logout } = useAuth();

    const [overview, setOverview] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingUser, setUpdatingUser] = useState(null);
    const [message, setMessage] = useState("");

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const [overviewResponse, usersResponse] = await Promise.all([
                api.get("administration/overview/"),
                api.get("administration/users/"),
            ]);

            setOverview(overviewResponse.data);
            setUsers(usersResponse.data);
        } catch (err) {
            console.error("Administrator dashboard error:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load administrator dashboard data."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            setUpdatingUser(userId);
            setError("");
            setMessage("");

            await api.patch(
                `administration/users/${userId}/role/`,
                { role: newRole }
            );

            setUsers((previousUsers) =>
                previousUsers.map((item) =>
                    item.id === userId
                        ? { ...item, role: newRole }
                        : item
                )
            );

            setMessage("User role updated successfully.");

            // Refresh role statistics.
            const response = await api.get("administration/overview/");
            setOverview(response.data);

        } catch (err) {
            console.error("Role update error:", err);

            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Unable to update user role."
            );
        } finally {
            setUpdatingUser(null);
        }
    };

    const formatCurrency = (value) => {
        return Number(value || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <h2>Loading Administrator Dashboard...</h2>
            </div>
        );
    }

    return (
        <div className="dashboard-container">

            <div className="dashboard-header">
                <div>
                    <h1>Administrator Dashboard</h1>
                    <p>
                        Welcome, {user?.username || "Administrator"}.
                        Manage your banking system.
                    </p>
                </div>

                <div>
                    <button onClick={fetchDashboardData}>
                        Refresh
                    </button>

                    <button onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            {message && (
                <div className="success-message" role="status">
                    {message}
                </div>
            )}

            {overview && (
                <>
                    <h2>System Overview</h2>

                    <div className="dashboard-sections">

                        <section>
                            <h3>Total Users</h3>
                            <h2>{overview.total_users}</h2>
                            <p>Active: {overview.active_users}</p>
                        </section>

                        <section>
                            <h3>Customers</h3>
                            <h2>{overview.customers}</h2>
                        </section>

                        <section>
                            <h3>Banking Staff</h3>
                            <h2>{overview.banking_staff}</h2>
                        </section>

                        <section>
                            <h3>Managers</h3>
                            <h2>{overview.managers}</h2>
                        </section>

                        <section>
                            <h3>Administrators</h3>
                            <h2>{overview.administrators}</h2>
                        </section>

                        <section>
                            <h3>Total Accounts</h3>
                            <h2>{overview.total_accounts}</h2>
                            <p>Pending: {overview.pending_accounts}</p>
                            <p>Active: {overview.active_accounts}</p>
                        </section>

                        <section>
                            <h3>Total Bank Balance</h3>
                            <h2>{formatCurrency(overview.total_balance)}</h2>
                        </section>

                        <section>
                            <h3>Total Loans</h3>
                            <h2>{overview.total_loans}</h2>
                            <p>Pending: {overview.pending_loans}</p>
                            <p>Approved: {overview.approved_loans}</p>
                            <p>Rejected: {overview.rejected_loans}</p>
                        </section>

                        <section>
                            <h3>Total Transactions</h3>
                            <h2>{overview.total_transactions}</h2>
                        </section>

                    </div>
                </>
            )}

            <hr />

            <h2>User Management</h2>
            <p>View registered users and manage their assigned roles.</p>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Current Role</th>
                            <th>Account Status</th>
                            <th>Change Role</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.length > 0 ? (
                            users.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.username}</td>
                                    <td>{item.email || "—"}</td>
                                    <td>{item.phone || "—"}</td>
                                    <td>{item.role}</td>
                                    <td>
                                        {item.is_active ? "Active" : "Inactive"}
                                    </td>
                                    <td>
                                        <select
                                            value={
                                                ROLE_OPTIONS.some(
                                                    (role) => role.value === item.role
                                                )
                                                    ? item.role
                                                    : "customer"
                                            }
                                            disabled={
                                                updatingUser === item.id ||
                                                item.id === user?.id ||
                                                item.is_superuser
                                            }
                                            onChange={(event) =>
                                                handleRoleChange(
                                                    item.id,
                                                    event.target.value
                                                )
                                            }
                                        >
                                            {ROLE_OPTIONS.map((role) => (
                                                <option
                                                    key={role.value}
                                                    value={role.value}
                                                >
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>

                                        {updatingUser === item.id && (
                                            <small>Updating...</small>
                                        )}

                                        {item.id === user?.id && (
                                            <small>Your account</small>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default AdministratorDashboard;
