
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

const roleLabels = {
  customer: "PERSONAL BANKING",
  banking_staff: "BANKING OPERATIONS",
  manager: "MANAGEMENT",
  administrator: "SYSTEM ADMINISTRATION",
};

const menuItems = [
  ["01", "Overview", "#top"],
  ["02", "Accounts", "#accounts"],
  ["03", "Activity", "#transactions"],
  ["04", "Loans & credit", "#loans"],
  ["05", "Payments", "#payments"],
  ["06", "User access", "#users"],
];

export default function AppShell({ children }) {
  const { user } = useAuth();

  const displayName =
    user?.full_name || user?.username || user?.email || "User";

  const initials = useMemo(
    () =>
      displayName
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0].toUpperCase())
        .join(""),
    [displayName]
  );

  return (
    <div className="bank-shell" id="top">
      <aside className="bank-sidebar">
        <a
          className="brand-lockup"
          href="/dashboard"
          aria-label="Northstar banking home"
        >
          <span className="brand-mark">
            N<span>↗</span>
          </span>
          <span className="brand-name">
            northstar
            <span>BANK</span>
          </span>
        </a>

        <div className="sidebar-caption">WORKSPACE</div>

        <div className="workspace-pill">
          <span className="workspace-dot" />
          <span>{roleLabels[user?.role] || "BANKING PORTAL"}</span>
        </div>

        <nav className="side-navigation" aria-label="Dashboard sections">
          <div className="sidebar-caption">YOUR SPACE</div>

          {menuItems.map(([number, label, href], index) => (
            <a
              className={`side-link ${index === 0 ? "active" : ""}`}
              href={href}
              key={number}
            >
              <span className="side-number">{number}</span>
              <span>{label}</span>
              {index === 0 && <span className="side-current" />}
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">✳</span>
            <div>
              <strong>Banking, made clear.</strong>
              <small>Your money. Your pace.</small>
            </div>
          </div>

          <div className="sidebar-profile">
            <div className="avatar">{initials || "U"}</div>

            <div className="profile-copy">
              <strong>{displayName}</strong>
              <small>
                {user?.role?.replace("_", " ") || "Member"}
              </small>
            </div>

            <span className="profile-status" title="Signed in" />
          </div>
        </div>
      </aside>

      <main className="bank-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>WORKSPACE</span>
            <b>/</b>
            <strong>{roleLabels[user?.role] || "DASHBOARD"}</strong>
          </div>

          <div className="topbar-right">
            <span className="secure-label">
              <i /> SECURE SESSION
            </span>
            <span className="topbar-divider" />
            <span className="topbar-date">NORTHSTAR DIGITAL</span>
          </div>
        </header>

        <div className="dashboard-content">{children}</div>

        <footer className="bank-footer">
          <span>© {new Date().getFullYear()} NORTHSTAR BANK</span>
          <span>
            BUILT FOR EVERYDAY CONFIDENCE <b>✳</b>
          </span>
        </footer>
      </main>
    </div>
  );
}
