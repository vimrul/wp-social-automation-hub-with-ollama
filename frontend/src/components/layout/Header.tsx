import { useLocation } from "react-router-dom";

function formatTitle(pathname: string) {
  if (pathname.startsWith("/posts/")) return "Post Detail";
  if (pathname === "/") return "Dashboard";

  return pathname
    .replace("/", "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Header() {
  const location = useLocation();

  return (
    <header className="topbar">
      <div>
        <h2>{formatTitle(location.pathname)}</h2>
        <p>WordPress social automation control panel</p>
      </div>
    </header>
  );
}
