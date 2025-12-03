import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

function AdminLayout() {
  
  // Styles for active and inactive links
  const baseLinkClasses = "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium";
  const activeLinkClasses = `${baseLinkClasses} bg-blue-600 text-white`;
  const inactiveLinkClasses = `${baseLinkClasses} text-gray-300 hover:bg-gray-700 hover:text-white`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-5 text-2xl font-bold border-b border-gray-700 flex items-center gap-2">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink 
            to="/admin/departments" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>🏢</span> Departments
          </NavLink>
          <NavLink 
            to="/admin/services" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>🛠️</span> Services
          </NavLink>
          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>📈</span> Analytics
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
          {/* You can add a logout button or user profile info here */}
          <button className="w-full text-left text-sm text-gray-400 hover:text-white">
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet /> {/* Child admin pages will render here */}
      </main>
    </div>
  );
}

export default AdminLayout;