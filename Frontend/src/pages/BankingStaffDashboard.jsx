
import React from "react";

function BankingStaffDashboard() {
    return (
        <div className="dashboard-container">

            <h1>Banking Staff Dashboard</h1>

            <p>Welcome to the Banking Staff Portal.</p>

            <hr />

            <h2>Banking Operations</h2>

            <div className="dashboard-sections">

                <section>
                    <h3>Customer Management</h3>
                    <p>View and manage customer information.</p>
                </section>

                <section>
                    <h3>Account Management</h3>
                    <p>View customer bank accounts and account details.</p>
                </section>

                <section>
                    <h3>Transaction Management</h3>
                    <p>Review and process pending transactions.</p>
                </section>

                <section>
                    <h3>Loan Requests</h3>
                    <p>Review customer loan applications.</p>
                </section>

            </div>

        </div>
    );
}

export default BankingStaffDashboard;
