import { useState } from "react";
import LoginPage from "./acceso/LoginPage";
import RegisterPage from "./acceso/RegisterPage";
import MainLayout from "./app/layout/MainLayout";

type Page = "login" | "register" | "app";

function App() {
  const [page, setPage] = useState<Page>("login");

  if (page === "app") {
    return <MainLayout />;
  }

  return page === "login" ? (
    <LoginPage
      onSwitchToRegister={() => setPage("register")}
      onLogin={() => setPage("app")}
    />
  ) : (
    <RegisterPage
      onSwitchToLogin={() => setPage("login")}
      onRegister={() => setPage("app")}
    />
  );
}

export default App;
