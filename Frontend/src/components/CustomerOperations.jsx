
import { useState } from "react";
import api from "../services/api";

function CustomerOperations({ accounts, onSuccess }) {
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    const [accountType, setAccountType] = useState("savings");

    const [transfer, setTransfer] = useState({
        sender_account_number: "",
        receiver_account_number: "",
        amount: "",
        description: ""
    });

    const [loan, setLoan] = useState({
        account: "",
        amount: "",
        purpose: "",
        tenure_months: ""
    });

    const [payment, setPayment] = useState({
        account_number: "",
        bill_type: "electricity",
        provider: "",
        consumer_reference: "",
        amount: ""
    });

    const [busy, setBusy] = useState(false);

    const activeAccounts = accounts.filter(
        (account) => account.status === "active"
    );

    const runAction = async (action, successMessage) => {
        setNotice("");
        setError("");
        setBusy(true);

        try {
            await action();
            setNotice(successMessage);
            onSuccess();
        } catch (err) {
            const data = err.response?.data;
            setError(
                typeof data === "string"
                    ? data
                    : data?.detail ||
                      data?.error ||
                      Object.values(data || {}).flat().join(" ") ||
                      "Operation failed. Please try again."
            );
        } finally {
            setBusy(false);
        }
    };

    const openAccount = (e) => {
        e.preventDefault();

        runAction(
            () => api.post("accounts/", {
                account_type: accountType
            }),
            "Account request submitted successfully. Await staff approval."
        );
    };

    const makeTransfer = (e) => {
        e.preventDefault();

        runAction(
            () => api.post("transactions/transfer/", transfer),
            "Money transferred successfully."
        );
    };

    const applyLoan = (e) => {
        e.preventDefault();

        runAction(
            () => api.post("loans/", {
                ...loan,
                amount: Number(loan.amount),
                tenure_months: Number(loan.tenure_months)
            }),
            "Loan application submitted successfully."
        );
    };

    const payBill = (e) => {
        e.preventDefault();

        runAction(
            () => api.post("payments/", payment),
            "Bill payment completed successfully."
        );
    };

    return (
        <div className="mt-5">
            <h3 className="mb-3">Banking Services</h3>

            {notice && (
                <div className="alert alert-success">{notice}</div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="row g-4">

                {/* Open Account */}
                <div className="col-lg-6">
                    <div className="card p-4 h-100 shadow-sm">
                        <h5>Open New Account</h5>

                        <form onSubmit={openAccount}>
                            <label className="form-label">
                                Account Type
                            </label>

                            <select
                                className="form-select mb-3"
                                value={accountType}
                                onChange={(e) =>
                                    setAccountType(e.target.value)
                                }
                            >
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                            </select>

                            <button
                                className="btn btn-primary"
                                disabled={busy}
                            >
                                Request Account
                            </button>
                        </form>
                    </div>
                </div>

                {/* Fund Transfer */}
                <div className="col-lg-6">
                    <div className="card p-4 h-100 shadow-sm">
                        <h5>Fund Transfer</h5>

                        <form onSubmit={makeTransfer}>
                            <label className="form-label">
                                Your Account
                            </label>

                            <select
                                className="form-select mb-2"
                                required
                                value={transfer.sender_account_number}
                                onChange={(e) =>
                                    setTransfer({
                                        ...transfer,
                                        sender_account_number: e.target.value
                                    })
                                }
                            >
                                <option value="">Select account</option>
                                {activeAccounts.map((a) => (
                                    <option key={a.id} value={a.account_number}>
                                        {a.account_number}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="form-control mb-2"
                                placeholder="Receiver Account Number"
                                required
                                value={transfer.receiver_account_number}
                                onChange={(e) =>
                                    setTransfer({
                                        ...transfer,
                                        receiver_account_number: e.target.value
                                    })
                                }
                            />

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="form-control mb-2"
                                placeholder="Amount"
                                required
                                value={transfer.amount}
                                onChange={(e) =>
                                    setTransfer({
                                        ...transfer,
                                        amount: e.target.value
                                    })
                                }
                            />

                            <input
                                className="form-control mb-3"
                                placeholder="Description (optional)"
                                value={transfer.description}
                                onChange={(e) =>
                                    setTransfer({
                                        ...transfer,
                                        description: e.target.value
                                    })
                                }
                            />

                            <button
                                className="btn btn-primary"
                                disabled={busy || activeAccounts.length === 0}
                            >
                                Transfer Money
                            </button>
                        </form>
                    </div>
                </div>

                {/* Loan Application */}
                <div className="col-lg-6">
                    <div className="card p-4 h-100 shadow-sm">
                        <h5>Apply for Loan</h5>

                        <form onSubmit={applyLoan}>
                            <select
                                className="form-select mb-2"
                                required
                                value={loan.account}
                                onChange={(e) =>
                                    setLoan({
                                        ...loan,
                                        account: e.target.value
                                    })
                                }
                            >
                                <option value="">Select active account</option>
                                {activeAccounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.account_number}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="form-control mb-2"
                                placeholder="Loan Amount"
                                required
                                value={loan.amount}
                                onChange={(e) =>
                                    setLoan({
                                        ...loan,
                                        amount: e.target.value
                                    })
                                }
                            />

                            <input
                                className="form-control mb-2"
                                placeholder="Loan Purpose"
                                required
                                value={loan.purpose}
                                onChange={(e) =>
                                    setLoan({
                                        ...loan,
                                        purpose: e.target.value
                                    })
                                }
                            />

                            <input
                                type="number"
                                min="1"
                                max="360"
                                className="form-control mb-3"
                                placeholder="Tenure in months"
                                required
                                value={loan.tenure_months}
                                onChange={(e) =>
                                    setLoan({
                                        ...loan,
                                        tenure_months: e.target.value
                                    })
                                }
                            />

                            <button
                                className="btn btn-primary"
                                disabled={busy || activeAccounts.length === 0}
                            >
                                Submit Loan Application
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bill Payment */}
                <div className="col-lg-6">
                    <div className="card p-4 h-100 shadow-sm">
                        <h5>Pay Bills</h5>

                        <form onSubmit={payBill}>
                            <select
                                className="form-select mb-2"
                                required
                                value={payment.account_number}
                                onChange={(e) =>
                                    setPayment({
                                        ...payment,
                                        account_number: e.target.value
                                    })
                                }
                            >
                                <option value="">Select active account</option>
                                {activeAccounts.map((a) => (
                                    <option key={a.id} value={a.account_number}>
                                        {a.account_number}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="form-select mb-2"
                                value={payment.bill_type}
                                onChange={(e) =>
                                    setPayment({
                                        ...payment,
                                        bill_type: e.target.value
                                    })
                                }
                            >
                                <option value="electricity">Electricity</option>
                                <option value="water">Water</option>
                                <option value="gas">Gas</option>
                                <option value="internet">Internet</option>
                                <option value="mobile">Mobile Recharge</option>
                            </select>

                            <input
                                className="form-control mb-2"
                                placeholder="Provider"
                                required
                                value={payment.provider}
                                onChange={(e) =>
                                    setPayment({
                                        ...payment,
                                        provider: e.target.value
                                    })
                                }
                            />

                            <input
                                className="form-control mb-2"
                                placeholder="Consumer Reference"
                                required
                                value={payment.consumer_reference}
                                onChange={(e) =>
                                    setPayment({
                                        ...payment,
                                        consumer_reference: e.target.value
                                    })
                                }
                            />

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="form-control mb-3"
                                placeholder="Amount"
                                required
                                value={payment.amount}
                                onChange={(e) =>
                                    setPayment({
                                        ...payment,
                                        amount: e.target.value
                                    })
                                }
                            />

                            <button
                                className="btn btn-primary"
                                disabled={busy || activeAccounts.length === 0}
                            >
                                Pay Bill
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CustomerOperations;
