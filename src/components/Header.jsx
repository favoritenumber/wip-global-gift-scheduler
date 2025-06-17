
import React from 'react';
import { Gift, Users, Settings, HelpCircle } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage, setEditingEvent }) => {
  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (page === 'gifts' || page === 'settings') {
      setEditingEvent(null);
    }
  };

  const navItems = [
    { id: 'gifts', label: 'Gifts', icon: Gift, color: 'text-purple-600' },
    { id: 'people', label: 'People', icon: Users, color: 'text-blue-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-green-600' },
    { id: 'support', label: 'Support & FAQ', icon: HelpCircle, color: 'text-orange-600' }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Global Gift Scheduler
              </h1>
              <p className="text-xs text-gray-500">Never miss a special moment</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {navItems.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => handleNavigation(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === id
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105'
                }`}
              >
                <Icon className={`h-4 w-4 ${currentPage === id ? 'text-purple-600' : color}`} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
