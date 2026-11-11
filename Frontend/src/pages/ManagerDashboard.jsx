
import React from "react";

function ManagerDashboard() {
    return (
        <div className="dashboard-container">

            <h1>Manager Dashboard</h1>

            <p>Welcome to the Manager Portal.</p>

            <hr />

            <h2>Management Overview</h2>

            <div className="dashboard-sections">

                <section>
                    <h3>Staff Management</h3>
                    <p>Monitor banking staff activities.</p>
                </section>

                <section>
                    <h3>Loan Approvals</h3>
                    <p>Review and approve eligible loan requests.</p>
                </section>

                <section>
                    <h3>Transaction Monitoring</h3>
                    <p>Monitor banking transactions and suspicious activities.</p>
                </section>

                <section>
                    <h3>Reports and Analytics</h3>
                    <p>View banking performance and financial reports.</p>
                </section>

            </div>

        </div>
    );
}

export default ManagerDashboard;
