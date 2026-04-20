import { useState } from "react";
import LoginPage from "./acceso/LoginPage";
import RegisterPage from "./acceso/RegisterPage";
import MainLayout from "./app/layout/MainLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";

type Page = "login" | "register";

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>("login");

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (user) {
    return <MainLayout />;
  }

  return page === "login" ? (
    <LoginPage onSwitchToRegister={() => setPage("register")} />
  ) : (
    <RegisterPage onSwitchToLogin={() => setPage("login")} />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
