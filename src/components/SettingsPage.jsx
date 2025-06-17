
import React, { useState } from 'react';
import { User, CreditCard, Bell, Gift, Shield, Users } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

const SettingsPage = () => {
  const { userSettings, setUserSettings } = useFirebase();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'payment', name: 'Payment Info', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'giftDefaults', name: 'Gift Defaults', icon: Gift },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'social', name: 'Social Media', icon: Users }
  ];

  const updateSettings = (section, field, value) => {
    setUserSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={userSettings.senderName}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, senderName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={userSettings.phone}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Signature</label>
                <input
                  type="text"
                  value={userSettings.defaultSignature}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, defaultSignature: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Your Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={userSettings.address?.street || ''}
                  onChange={(e) => updateSettings('address', 'street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Street Address"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={userSettings.address?.city || ''}
                    onChange={(e) => updateSettings('address', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={userSettings.address?.state || ''}
                    onChange={(e) => updateSettings('address', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Your payment method will be charged 5 days before each scheduled gift delivery.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="**** **** **** 1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="***"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                Update Payment Method
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={userSettings.notifications?.email || false}
                  onChange={(e) => updateSettings('notifications', 'email', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Email notifications for gift reminders</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={userSettings.notifications?.sms || false}
                  onChange={(e) => updateSettings('notifications', 'sms', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">SMS notifications for urgent updates</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={userSettings.notifications?.reminders || false}
                  onChange={(e) => updateSettings('notifications', 'reminders', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Weekly reminders for upcoming occasions</span>
              </label>
            </div>
          </div>
        );

      case 'giftDefaults':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Gift Defaults</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Gift Type</label>
                <select
                  value={userSettings.giftDefaults?.defaultGiftType || 'Personal Note and photo ($5)'}
                  onChange={(e) => updateSettings('giftDefaults', 'defaultGiftType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Personal Note and photo ($5)">Personal Note and photo ($5)</option>
                  <option value="Sweet Something ($25)">Sweet Something ($25)</option>
                  <option value="Thoughtful Present ($50)">Thoughtful Present ($50)</option>
                  <option value="Generous Gesture ($100)">Generous Gesture ($100)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Message</label>
                <textarea
                  value={userSettings.giftDefaults?.defaultMessage || ''}
                  onChange={(e) => updateSettings('giftDefaults', 'defaultMessage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Default message for gifts"
                />
              </div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={userSettings.giftDefaults?.autoRecurring || false}
                  onChange={(e) => updateSettings('giftDefaults', 'autoRecurring', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Make gifts automatically recurring by default</span>
              </label>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                Update Password
              </button>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Connect Social Media</h3>
            <p className="text-gray-600">Import friends and their birthdays from your social media accounts.</p>
            <div className="space-y-4">
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      f
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Facebook</h4>
                      <p className="text-sm text-gray-500">Import friends and birthdays</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      in
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">LinkedIn</h4>
                      <p className="text-sm text-gray-500">Import professional contacts</p>
                    </div>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold">
                      X
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">X (Twitter)</h4>
                      <p className="text-sm text-gray-500">Import followers and friends</p>
                    </div>
                  </div>
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your Global Gift Scheduler preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
