import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import NotificationIcon from './NotificationIcon';

// Header component
const Header = () => {
    const [avatarUrl, setAvatarUrl] = React.useState(null);

    React.useEffect(() => {
        const fetchAvatar = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setAvatarUrl(user.user_metadata?.avatar_url);
            }
        };
        fetchAvatar();
    }, []);

    return (
        <header className="bg-white border-b p-4">
            <div className="relative flex items-center justify-end h-full">
                {/* Centered Logo and Title */}
                <div className="absolute left-1/2 top-1/2 -translate-x-2/2 -translate-y-1/2 flex items-center gap-3">
                    <img 
                        src="/logo.png" 
                        alt="LocalGov Connect Logo" 
                        className="h-15 w-15 object-contain"
                    />
                    <span className="text-xl font-bold text-blue-600 whitespace-nowrap">LocalGov Connect</span>
                </div>

                {/* Right-aligned items */}
                <div className="flex items-center gap-4">
                    <NotificationIcon />
                    <Link to="/dashboard/profile">
                        <img 
                            src={avatarUrl || 'https://placehold.co/32x32/EFEFEF/333333?text=U'} 
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

// ** UPDATED SIDEBAR **
const Sidebar = () => {
    const linkClasses = "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-200 rounded-md transition-colors font-medium";
    const activeLinkClasses = "flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-md font-semibold transition-colors";

    return (
        <aside className="w-64 py-15 bg-blue-100 shadow-md flex flex-col p-4">
            <nav className="flex-1 space-y-2">
                {/* Navigation Links */}
                <NavLink to="/dashboard" end className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>🏠</span> Home
                </NavLink>
                <NavLink to="/dashboard/report-issue" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>➕</span> Report Issue
                </NavLink>
                <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>👤</span> Profile
                </NavLink>
                <NavLink to="/dashboard/map" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>🗺️</span> Map
                </NavLink>
                <NavLink to="/dashboard/my-activity" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>📊</span> My Activity
                </NavLink>
            </nav>
        </aside>
    );
}

function MainLayout() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;

