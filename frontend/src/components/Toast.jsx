import { useState, useEffect } from "react";

export default function Toast({ message, type = "error", onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!isVisible) return null;

    const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
    const icon = type === "error" ? "✕" : "✓";

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in" dir={document.documentElement.dir}>
            <div className={`flex items-center rounded-lg ${bgColor} px-6 py-4 text-white shadow-lg`}>
                <span className="mr-3 text-xl font-bold">{icon}</span>
                <span className="mr-4">{message}</span>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        if (onClose) setTimeout(onClose, 300);
                    }}
                    className="ml-auto text-white hover:text-gray-200"
                >
                    ×
                </button>
            </div>
        </div>
    );
}