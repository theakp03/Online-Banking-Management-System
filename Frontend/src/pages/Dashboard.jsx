
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import CustomerOperations from "../components/CustomerOperations";

function Dashboard() {
    const { user, logout } = useAuth();

    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [accountResponse, transactionResponse] =
                await Promise.all([
                    api.get("accounts/"),
                    api.get("transactions/history/")
                ]);

            const accountData = accountResponse.data;
            const transactionData = transactionResponse.data;

            setAccounts(
                Array.isArray(accountData)
                    ? accountData
                    : accountData.accounts || accountData.results || []
            );

            setTransactions(
                Array.isArray(transactionData)
                    ? transactionData
                    : transactionData.transactions || transactionData.results || []
            );

        } catch (err) {
            console.error("Dashboard loading error:", err);
            setError(
                err.response?.data?.detail ||
                "Unable to load dashboard information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const totalBalance = accounts.reduce(
        (total, account) =>
            total + Number(account.balance || 0),
        0
    );

    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Welcome, {user?.full_name || user?.email}</h2>
                    <p>Customer Banking Dashboard</p>
                </div>

                <button className="btn btn-danger" onClick={logout}>
                    Logout
                </button>
            </div>

            <hr />

            {loading && <p>Loading dashboard...</p>}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="row g-3 mb-4">

                        <div className="col-md-6">
                            <div className="card p-3 shadow-sm">
                                <h5>Total Balance</h5>
                                <h3>₹{totalBalance.toFixed(2)}</h3>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card p-3 shadow-sm">
                                <h5>My Accounts</h5>
                                <h3>{accounts.length}</h3>
                            </div>
                        </div>

                    </div>

                    <h4 className="mb-3">My Bank Accounts</h4>

                    {accounts.length === 0 ? (
                        <p>No accounts found.</p>
                    ) : (
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Account Number</th>
                                        <th>Account Type</th>
                                        <th>Balance</th>
                                        <th>Status</th>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h4 className="mb-3">Recent Transactions</h4>

                    {transactions.length === 0 ? (
                        <p>No transactions found.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.slice(0, 10).map((item) => (
                                        <tr key={item.transaction_id}>
                                            <td>{item.transaction_id}</td>
                                            <td>{item.transaction_type}</td>
                                            <td>₹{Number(item.amount).toFixed(2)}</td>
                                            <td>{item.status}</td>
                                            <td>
                                                {new Date(item.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
            <CustomerOperations
                accounts={accounts}
                onSuccess={loadDashboard}
            />

            <button
                className="btn btn-primary mt-3"
                onClick={loadDashboard}
                disabled={loading}
            >
                Refresh Dashboard
            </button>

        </div>
    );
}

export default Dashboard;
