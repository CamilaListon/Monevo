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
      <div className="screen-loader">
        <span className="loader" />
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
