import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import i18n, { i18nPromise } from './i18n';
import LoadingSpinner from "./components/LoadingSpinner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Layout from "./layouts/Layout";

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

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    if (requiredPermissions.length > 0) {
        const userPermissions = user.permissions || [];
        const hasAllPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));
        if (user.role !== 'admin' && !hasAllPermissions) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

function App() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        i18nPromise.then(() => {
            setIsInitialized(true);
            const lng = i18n.language || 'en';
            document.documentElement.dir = lng === 'ps' || lng === 'dr' ? 'rtl' : 'ltr';
            document.documentElement.lang = lng;
            document.body.dir = lng === 'ps' || lng === 'dr' ? 'rtl' : 'ltr';
        });
    }, []);

    if (!isInitialized) {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;