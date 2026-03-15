import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/health", label: "Health" },
  { to: "/source-sites", label: "Source Sites" },
  { to: "/source-fetch-configs", label: "Fetch Configs" },
  { to: "/posts", label: "Posts" },
  { to: "/ollama-profiles", label: "Ollama Profiles" },
  { to: "/prompt-templates", label: "Prompt Templates" },
  { to: "/social-accounts", label: "Social Accounts" },
  { to: "/activity-logs", label: "Activity Logs" },
  { to: "/profile", label: "My Profile" },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>WP Social Hub</h1>
        <p>Automation Admin</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.full_name || "Unknown User"}</div>
        <div className="sidebar-user-meta">
          {user?.email || "-"} • {user?.role || "-"}
        </div>
        <button className="btn btn-secondary btn-sm sidebar-logout" onClick={logoutUser}>
          Logout
        </button>
      </div>
    </aside>
  );
}