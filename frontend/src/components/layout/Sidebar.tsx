import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/health", label: "Health" },
  { to: "/source-sites", label: "Source Sites" },
  { to: "/source-fetch-configs", label: "Fetch Configs" },
  { to: "/posts", label: "Posts" },
  { to: "/ollama-profiles", label: "Ollama Profiles" },
  { to: "/prompt-templates", label: "Prompt Templates" },
  { to: "/activity-logs", label: "Activity Logs" },
  { to: "/social-accounts", label: "Social Accounts" },
];

export default function Sidebar() {
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
    </aside>
  );
}