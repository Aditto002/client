import { createBrowserRouter, Navigate } from "react-router-dom";
import Account from "../pages/Account";
import Balance from "../pages/Balance";
import CreditPage from "../pages/CreaditPage";
import Customer from "../pages/Customer";
import DailyLog from "../pages/DailyLog";
import DailyTransation from "../pages/DailyTransaction";
import DebitPage from "../pages/DebitPage";
import DuePage from "../pages/DuePage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import StatementPage from "../pages/StatementPage";
import SingleDuePage from "../pages/SingleDuePage";

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in (you'll need to implement this based on your auth system)
  const isAuthenticated = localStorage.getItem("authToken") !== null; // Example auth check

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },

  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/statement",
    element: (
      <ProtectedRoute>
        <StatementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/due",
    element: (
      <ProtectedRoute>
        <SingleDuePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/creditpage",
    element: (
      <ProtectedRoute>
        <CreditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/debitpage",
    element: (
      <ProtectedRoute>
        <DebitPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/duepage",
    element: (
      <ProtectedRoute>
        <DuePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dailytransation",
    element: (
      <ProtectedRoute>
        <DailyTransation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/balance",
    element: (
      <ProtectedRoute>
        <Balance />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dailylog",
    element: (
      <ProtectedRoute>
        <DailyLog />
      </ProtectedRoute>
    ),
  },
  {
    path: "/customer",
    element: (
      <ProtectedRoute>
        <Customer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/account",
    element: (
      <ProtectedRoute>
        <Account />
      </ProtectedRoute>
    ),
  },
]);

export default router;
