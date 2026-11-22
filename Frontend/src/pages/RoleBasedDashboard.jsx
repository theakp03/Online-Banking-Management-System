
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";

import Dashboard from "./Dashboard";
import BankingStaffDashboard from "./BankingStaffDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdministratorDashboard from "./AdministratorDashboard";

function RoleBasedDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  let dashboard;

  switch (user.role) {
    case "customer":
      dashboard = <Dashboard />;
      break;

    case "banking_staff":
      dashboard = <BankingStaffDashboard />;
      break;

    case "manager":
      dashboard = <ManagerDashboard />;
      break;

    case "administrator":
      dashboard = <AdministratorDashboard />;
      break;

    default:
      return (
        <div className="access-state">
          <h1>Access not configured</h1>
          <p>Your account does not have a valid role assigned.</p>
        </div>
      );
  }

  return <AppShell>{dashboard}</AppShell>;
}

export default RoleBasedDashboard;
