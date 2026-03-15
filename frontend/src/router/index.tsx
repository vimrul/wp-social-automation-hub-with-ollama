import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import DashboardPage from "../pages/DashboardPage";
import HealthPage from "../pages/HealthPage";
import SourceSitesPage from "../pages/SourceSitesPage";
import PostsPage from "../pages/PostsPage";
import PostDetailPage from "../pages/PostDetailPage";
import PublishingPage from "../pages/PublishingPage";
import SettingsPage from "../pages/SettingsPage";
import ActivityLogsPage from "../pages/ActivityLogsPage";
import LoginPage from "../pages/LoginPage";
import SourceFetchConfigsPage from "../pages/SourceFetchConfigsPage";
import SocialAccountsPage from "../pages/SocialAccountsPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import ProfilePage from "../pages/ProfilePage";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "health", element: <HealthPage /> },
          { path: "source-sites", element: <SourceSitesPage /> },
          { path: "source-fetch-configs", element: <SourceFetchConfigsPage /> },
          { path: "posts", element: <PostsPage /> },
          { path: "posts/:postId", element: <PostDetailPage /> },
          { path: "ollama-profiles", element: <PublishingPage /> },
          { path: "prompt-templates", element: <SettingsPage /> },
          { path: "activity-logs", element: <ActivityLogsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "social-accounts", element: <SocialAccountsPage /> },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

export default router;