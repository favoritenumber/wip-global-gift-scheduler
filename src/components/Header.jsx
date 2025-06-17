
import React from 'react';
import { Gift, Users, Settings, HelpCircle } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage, setEditingEvent }) => {
  const handleNavigation = (page) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
    if (page === 'gifts' || page === 'settings') {
      setEditingEvent(null);
    }
  };

  const navItems = [
    { id: 'gifts', label: 'Your Gifts', icon: Gift },
    { id: 'people', label: 'People', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support & FAQ', icon: HelpCircle }
  ];

  return (
    <header className="bg-white border-b-2 border-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black rounded-xl shadow-lg">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">
                Global Gift Scheduler
              </h1>
              <p className="text-xs text-gray-600">Never miss a special moment</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavigation(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 cursor-pointer ${
                  currentPage === id
                    ? 'bg-black text-white border-black shadow-md'
                    : 'text-black border-gray-300 hover:bg-gray-100 hover:border-black'
                }`}
                type="button"
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
