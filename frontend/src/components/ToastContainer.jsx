import { useState } from "react";
import Toast from "./Toast";

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = "error") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return {
        showToast,
        ToastWrapper: () => (
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        ),
    };
}