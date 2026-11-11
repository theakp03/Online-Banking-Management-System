
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Dashboard from "./Dashboard";
import BankingStaffDashboard from "./BankingStaffDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdministratorDashboard from "./AdministratorDashboard";

function RoleBasedDashboard() {

    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {

        case "customer":
            return <Dashboard />;

        case "banking_staff":
            return <BankingStaffDashboard />;

        case "manager":
            return <ManagerDashboard />;

        case "administrator":
            return <AdministratorDashboard />;

        default:
            return (
                <div>
                    <h1>Access Not Configured</h1>
                    <p>Your account does not have a valid role assigned.</p>
                </div>
            );
    }
}

export default RoleBasedDashboard;
