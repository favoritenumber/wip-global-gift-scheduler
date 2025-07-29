
import React from 'react';
import { Gift, Users, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';

const Header = ({ currentPage, setCurrentPage, setEditingEvent }) => {
  const { signOut } = useClerk();
  
  const handleNavigation = (page) => {
    console.log('Navigating to:', page);
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
    <header className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left aligned */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Your Gift Scheduler
              </h1>
              <p className="text-xs text-gray-600">Never miss a special moment</p>
            </div>
          </div>

          {/* Navigation - Right aligned */}
          <div className="flex items-center space-x-2">
            <nav className="flex space-x-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavigation(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
            
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="ml-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
