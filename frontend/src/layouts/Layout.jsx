import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";

export default function Layout() {
    const { isRTL, renderKey } = useLanguage();
    const isRtl = isRTL || document.documentElement.dir === 'rtl';

    return (
        <div 
            key={`layout-${renderKey}`}
            className={`flex h-screen bg-gray-100 ${isRtl ? 'rtl-layout' : ''}`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}