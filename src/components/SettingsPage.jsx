
import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Bell, 
  Gift, 
  Shield, 
  Users, 
  Save, 
  Camera, 
  MapPin, 
  Mail, 
  Phone,
  Facebook,
  Linkedin,
  Twitter,
  Globe,
  Eye,
  EyeOff,
  Trash2,
  Download
} from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

const SettingsPage = () => {
  const { userSettings, setUserSettings } = useFirebase();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook: false,
    linkedin: false,
    twitter: false,
    instagram: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'payment', name: 'Payment Info', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'gifts', name: 'Gift Defaults', icon: Gift },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'social', name: 'Find Friends', icon: Users }
  ];

  const handleSettingChange = (category, key, value) => {
    setUserSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleConnectSocial = (platform) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <button className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
          <p className="text-gray-600">Update your profile picture</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={userSettings.senderName}
            onChange={(e) => handleSettingChange('', 'senderName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={userSettings.email}
            onChange={(e) => handleSettingChange('', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={userSettings.phone}
            onChange={(e) => handleSettingChange('', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black">
            <option>Pacific Time (PT)</option>
            <option>Mountain Time (MT)</option>
            <option>Central Time (CT)</option>
            <option>Eastern Time (ET)</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Default Address
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={userSettings.address.street}
              onChange={(e) => handleSettingChange('address', 'street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={userSettings.address.city}
              onChange={(e) => handleSettingChange('address', 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={userSettings.address.state}
              onChange={(e) => handleSettingChange('address', 'state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={userSettings.address.zipCode}
              onChange={(e) => handleSettingChange('address', 'zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select 
              value={userSettings.address.country}
              onChange={(e) => handleSettingChange('address', 'country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="USA">United States</option>
              <option value="CAN">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AUS">Australia</option>
              <option value="DEU">Germany</option>
              <option value="FRA">France</option>
              <option value="JPN">Japan</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Payment Methods</h4>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/27</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Default</span>
              <button className="text-gray-600 hover:text-gray-800">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors">
            + Add New Payment Method
          </button>
        </div>
      </div>

      {/* Billing Address */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Billing Address</h4>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="sameAsProfile"
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            defaultChecked
          />
          <label htmlFor="sameAsProfile" className="text-sm text-gray-700">
            Same as profile address
          </label>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">Billing History</h4>
          <button className="text-sm text-black hover:text-gray-700 flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>Download All</span>
          </button>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Dec 15, 2024</td>
                <td className="px-4 py-3 text-sm text-gray-600">Sarah's Birthday Gift</td>
                <td className="px-4 py-3 text-sm text-gray-900">$25.00</td>
                <td className="px-4 py-3"><span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Paid</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Nov 28, 2024</td>
                <td className="px-4 py-3 text-sm text-gray-600">Mike's Work Anniversary</td>
                <td className="px-4 py-3 text-sm text-gray-900">$35.00</td>
                <td className="px-4 py-3"><span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Email Notifications
        </h4>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Enable email notifications', desc: 'Receive updates about your gifts via email' },
            { key: 'reminders', label: 'Gift reminders', desc: 'Get reminded 7 days before special occasions' },
            { key: 'deliveryUpdates', label: 'Delivery updates', desc: 'Notifications when gifts are delivered' },
            { key: 'promotions', label: 'Promotions and offers', desc: 'Receive special deals and discounts' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userSettings.notifications[item.key]}
                  onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Notifications */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          SMS Notifications
        </h4>
        <div className="space-y-4">
          {[
            { key: 'sms', label: 'Enable SMS notifications', desc: 'Receive text messages for important updates' },
            { key: 'urgentOnly', label: 'Urgent notifications only', desc: 'Only receive SMS for delivery issues' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userSettings.notifications[item.key]}
                  onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGiftsTab = () => (
    <div className="space-y-6">
      {/* Default Gift Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Default Gift Preferences</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Gift Type</label>
            <select 
              value={userSettings.giftDefaults.defaultGiftType}
              onChange={(e) => handleSettingChange('giftDefaults', 'defaultGiftType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option>Personal Note and Photo ($5)</option>
              <option>Flowers ($25-$75)</option>
              <option>Chocolates ($15-$45)</option>
              <option>Gift Card ($25-$200)</option>
              <option>Custom Gift ($50-$150)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Personal Message</label>
            <textarea
              value={userSettings.giftDefaults.defaultMessage}
              onChange={(e) => handleSettingChange('giftDefaults', 'defaultMessage', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter your default message template..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Signature</label>
            <input
              type="text"
              value={userSettings.defaultSignature}
              onChange={(e) => handleSettingChange('', 'defaultSignature', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Auto-Recurring Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Recurring Gift Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-recurring for birthdays</p>
              <p className="text-sm text-gray-600">Automatically schedule birthday gifts annually</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userSettings.giftDefaults.autoRecurring}
                onChange={(e) => handleSettingChange('giftDefaults', 'autoRecurring', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Days</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black">
              <option>7 days before</option>
              <option>14 days before</option>
              <option>30 days before</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Password */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Password & Security</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter new password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Two-Factor Authentication</h4>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable 2FA</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm">
              Setup 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Privacy Settings</h4>
        <div className="space-y-4">
          {[
            { key: 'profileVisible', label: 'Make profile discoverable', desc: 'Allow friends to find you by email or phone' },
            { key: 'dataSharing', label: 'Share analytics data', desc: 'Help us improve the service (anonymized data only)' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-6">
      {/* Connect Social Accounts */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Connect Social Media Accounts</h4>
        <p className="text-gray-600 mb-6">Connect your social media accounts to easily import friends and their birthdays.</p>
        
        <div className="space-y-4">
          {[
            { platform: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
            { platform: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
            { platform: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-black' },
            { platform: 'instagram', name: 'Instagram', icon: Globe, color: 'bg-pink-600' }
          ].map(social => (
            <div key={social.platform} className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center`}>
                  <social.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{social.name}</p>
                  <p className="text-sm text-gray-600">
                    {connectedAccounts[social.platform] ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConnectSocial(social.platform)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  connectedAccounts[social.platform]
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {connectedAccounts[social.platform] ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Import Options */}
      {Object.values(connectedAccounts).some(connected => connected) && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Import Friends</h4>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <p className="text-gray-700 mb-4">
              Import friends from your connected social media accounts. We'll only import contacts you select.
            </p>
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Import Selected Friends
            </button>
          </div>
        </div>
      )}

      {/* Data Export */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Data Management</h4>
        <div className="space-y-4">
          <div className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Export Your Data</p>
              <p className="text-sm text-gray-600">Download all your gift and contact data</p>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          
          <div className="bg-white border border-red-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and global gift settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
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
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'payment' && renderPaymentTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'gifts' && renderGiftsTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'social' && renderSocialTab()}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
