
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
    { id: 'gifts', label: 'Gifts', icon: Gift },
    { id: 'people', label: 'People', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support & FAQ', icon: HelpCircle }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Gift className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Gift Scheduler
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavigation(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
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
