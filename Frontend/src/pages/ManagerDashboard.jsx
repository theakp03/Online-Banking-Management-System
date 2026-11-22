
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function ManagerDashboard() {
    const { user, logout } = useAuth();

    const [accounts, setAccounts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busyId, setBusyId] = useState(null);

    const getList = (data, key) => {
        if (Array.isArray(data)) return data;
        return data?.[key] || data?.results || [];
    };

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [accountRes, loanRes] = await Promise.all([
                api.get("accounts/"),
                api.get("loans/")
            ]);

            setAccounts(getList(accountRes.data, "accounts"));
            setLoans(getList(loanRes.data, "loans"));
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail ||
                "Unable to load management data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const approveAccount = async (id) => {
        setBusyId(id);
        setError("");
        setMessage("");

        try {
            await api.post(`accounts/${id}/approve/`);
            setMessage("Account approved successfully.");
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Unable to approve account."
            );
        } finally {
            setBusyId(null);
        }
    };

    const reviewLoan = async (id, decision) => {
        const remarks = window.prompt(
            `Enter remarks for ${decision} loan:`,
            decision === "approved"
                ? "Approved after management review."
                : "Rejected after management review."
        );

        if (remarks === null) return;

        setBusyId(id);
        setError("");
        setMessage("");

        try {
            await api.post(`loans/${id}/review/`, {
                decision,
                remarks
            });

            setMessage(`Loan ${decision} successfully.`);
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Unable to review loan."
            );
        } finally {
            setBusyId(null);
        }
    };

    const pendingAccounts = accounts.filter(
        (a) => a.status === "pending"
    );

    const activeAccounts = accounts.filter(
        (a) => a.status === "active"
    );

    const pendingLoans = loans.filter(
        (l) => l.status === "pending"
    );

    const totalBalance = accounts.reduce(
        (sum, a) => sum + Number(a.balance || 0),
        0
    );

    const totalLoanAmount = loans.reduce(
        (sum, l) => sum + Number(l.amount || 0),
        0
    );

    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Manager Dashboard</h2>
                    <p>
                        Welcome, {user?.full_name || user?.email}
                    </p>
                </div>

                <button
                    className="btn btn-danger"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>

            <hr />

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <h4 className="mb-3">Banking Overview</h4>

            <div className="row g-3 mb-5">

                <div className="col-md-3">
                    <div className="card p-3 shadow-sm h-100">
                        <h6>Total Accounts</h6>
                        <h3>{accounts.length}</h3>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card p-3 shadow-sm h-100">
                        <h6>Active Accounts</h6>
                        <h3>{activeAccounts.length}</h3>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card p-3 shadow-sm h-100">
                        <h6>Pending Accounts</h6>
                        <h3>{pendingAccounts.length}</h3>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card p-3 shadow-sm h-100">
                        <h6>Pending Loans</h6>
                        <h3>{pendingLoans.length}</h3>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card p-3 shadow-sm">
                        <h6>Total Customer Account Balance</h6>
                        <h3>
                            ₹{totalBalance.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </h3>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card p-3 shadow-sm">
                        <h6>Total Loan Applications Amount</h6>
                        <h3>
                            ₹{totalLoanAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </h3>
                    </div>
                </div>

            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Account Management</h4>

                <button
                    className="btn btn-outline-primary"
                    onClick={loadData}
                    disabled={loading}
                >
                    Refresh Data
                </button>
            </div>

            {loading ? (
                <p>Loading management data...</p>
            ) : (
                <div className="table-responsive mb-5">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Account Number</th>
                                <th>Account Type</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>{account.account_number}</td>
                                    <td>{account.account_type}</td>
                                    <td>
                                        ₹{Number(account.balance).toFixed(2)}
                                    </td>
                                    <td>{account.status}</td>
                                    <td>
                                        {account.status === "pending" ? (
                                            <button
                                                className="btn btn-success btn-sm"
                                                disabled={busyId === account.id}
                                                onClick={() =>
                                                    approveAccount(account.id)
                                                }
                                            >
                                                Approve
                                            </button>
                                        ) : "-"}
                                    </td>
                                </tr>
                            ))}

                            {accounts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <h4 className="mb-3">Loan Management</h4>

            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Loan ID</th>
                            <th>Account</th>
                            <th>Amount</th>
                            <th>Purpose</th>
                            <th>Tenure</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loans.map((loan) => (
                            <tr key={loan.id}>
                                <td>{loan.id}</td>
                                <td>{loan.account_number || loan.account}</td>
                                <td>
                                    ₹{Number(loan.amount).toLocaleString("en-IN")}
                                </td>
                                <td>{loan.purpose}</td>
                                <td>{loan.tenure_months} months</td>
                                <td>{loan.status}</td>
                                <td>
                                    {loan.status === "pending" ? (
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-success btn-sm"
                                                disabled={busyId === loan.id}
                                                onClick={() =>
                                                    reviewLoan(loan.id, "approved")
                                                }
                                            >
                                                Approve
                                            </button>

                                            <button
                                                className="btn btn-danger btn-sm"
                                                disabled={busyId === loan.id}
                                                onClick={() =>
                                                    reviewLoan(loan.id, "rejected")
                                                }
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : "-"}
                                </td>
                            </tr>
                        ))}

                        {loans.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    No loan applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default ManagerDashboard;
