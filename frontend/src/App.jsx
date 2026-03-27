import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import EmployeeLayout from "./components/EmployeeLayout";
import Dashboard from "./pages/admin/Dashboard";
import Applications from "./pages/admin/Applications";
import Entities from "./pages/admin/Entities";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</div>;
  if (!user) {
    if (allowedRoles?.includes("admin")) return <Navigate to="/admin/login" replace />;
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />;
  }
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</div>;

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace /> : <Login />} />
        <Route path="/admin/login" element={user?.role === "admin" ? <Navigate to="/admin" replace /> : <AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="entities" element={<Entities />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeLayout /></ProtectedRoute>}>
          <Route index element={<EmployeeDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
