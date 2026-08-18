// App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Layout from "./layouts/Layout";
import { useEffect } from "react";

// Protected Route component
const ProtectedRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!userData) {
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }

    let user;
    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check if user has required permissions
    if (requiredPermissions.length > 0) {
        const userPermissions = user.permissions || [];
        const hasAllPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));
        
        // If user is admin, they have all permissions
        if (user.role !== 'admin' && !hasAllPermissions) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

function App() {
    const location = useLocation();

    // Debug logging
    useEffect(() => {
        console.log("Current path:", location.pathname);
        console.log("Current state:", location.state);
    }, [location]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Layout */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="accounts" element={<Account />} />
                
                {/* Admin only routes */}
                <Route 
                    path="staff-permissions" 
                    element={
                        <ProtectedRoute requiredRoles={['admin']}>
                            <Settings />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="settings" 
                    element={
                        <ProtectedRoute requiredRoles={['admin']}>
                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                                <p className="text-gray-500 mt-2">Admin settings page</p>
                            </div>
                        </ProtectedRoute>
                    } 
                />
            </Route>
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;