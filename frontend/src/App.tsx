import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

function AppRoutes() {
  const { user, setUser, checkingSession } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (checkingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f6f2] dark:bg-dark-canvas">
        <span className="inline-block size-6 animate-spin rounded-full border-2 border-[#dbe8df] border-t-teal" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <HomePage theme={theme} onToggleTheme={toggleTheme} />
          )
        }
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage
              mode="login"
              onAuthenticated={setUser}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage
              mode="register"
              onAuthenticated={setUser}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          user ? (
            <DashboardPage
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={() => setUser(null)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/account"
        element={
          user ? (
            <AccountPage
              user={user}
              onUserUpdated={setUser}
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={() => setUser(null)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
