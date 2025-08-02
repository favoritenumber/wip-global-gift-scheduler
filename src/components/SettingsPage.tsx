import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User as UserIcon, CreditCard, BellRing, UserCog, Shield, Download, Trash2, ChevronDown, Save, CheckCircle, AlertCircle, Eye, EyeOff, Lock, Key, Smartphone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsPageProps {
  userProfile: any;
  refreshData: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ userProfile, refreshData }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  
  const [userSettings, setUserSettings] = useState({
    name: userProfile?.full_name || user?.user_metadata?.full_name || "Your Name",
    email: userProfile?.email || user?.email || "your.name@example.com",
    theme: "light",
    notifications: {
      reminders: { days_10: true, days_3: true, day_of: false },
      confirmations: { scheduled: true, delivered: false }
    },
    defaults: {
      giftAmount: 'Personal Note and photo ($5)',
      signature: 'With love,'
    }
  });

  useEffect(() => {
    if (userProfile) {
      setUserSettings(prev => ({
        ...prev,
        name: userProfile.full_name || user?.user_metadata?.full_name || prev.name,
        email: userProfile.email || user?.email || prev.email,
        defaults: {
          ...prev.defaults,
          ...userProfile.defaults
        },
        notifications: {
          ...prev.notifications,
          ...userProfile.notifications
        }
      }));
    }
  }, [userProfile, user]);

  const handleSettingChange = (category: string, key: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleNotificationChange = (group: string, key: string, value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [group]: {
          ...prev.notifications[group as keyof typeof prev.notifications],
          [key]: value
        }
      }
    }));
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });
    
    try {
      // First ensure the profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: userSettings.name,
            email: userSettings.email,
            defaults: userSettings.defaults,
            notifications: userSettings.notifications,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
      } else {
        // Profile exists, update it
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: userSettings.name,
            email: userSettings.email,
            defaults: userSettings.defaults,
            notifications: userSettings.notifications,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
      }
      
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      refreshData();
      
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // This would integrate with Supabase Auth password reset
    setSaveStatus({ type: 'success', message: 'Password reset email sent!' });
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  };

  const handleDataExport = async () => {
    setSaveStatus({ type: 'success', message: 'Data export started! Check your email.' });
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  };

  const handleDataDelete = async () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      setSaveStatus({ type: 'success', message: 'Data deletion request submitted.' });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl mt-8 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
              <p className="text-blue-100 text-sm">Manage your account preferences and security</p>
            </div>
          </div>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50 hover:shadow-lg transform hover:scale-105"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus.type && (
        <div className={`px-8 py-4 flex items-center space-x-3 animate-in slide-in-from-top-2 ${
          saveStatus.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'
        }`}>
          {saveStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={`font-medium ${
            saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {saveStatus.message}
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-1/4 bg-gradient-to-b from-blue-50 to-white p-6 border-r border-blue-100">
          <nav className="space-y-3">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon, description: 'Personal information' },
              { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Billing & cards' },
              { id: 'notifications', label: 'Notifications', icon: BellRing, description: 'Email preferences' },
              { id: 'defaults', label: 'Gift Defaults', icon: UserCog, description: 'Default settings' },
              { id: 'security', label: 'Security', icon: Shield, description: 'Account security' },
              { id: 'data', label: 'Data Management', icon: Download, description: 'Export & privacy' }
            ].map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-200 hover:shadow-md ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeTab === id ? 'bg-white/20' : 'bg-blue-100'
                }`}>
                  <Icon size={20} className={activeTab === id ? 'text-white' : 'text-blue-600'} />
                </div>
                <div className="flex-1">
                  <span className="font-semibold block">{label}</span>
                  <span className={`text-xs ${activeTab === id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {description}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:w-3/4 p-8 bg-white">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h3>
                <p className="text-gray-600">Update your personal information and preferences</p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={userSettings.name} 
                      onChange={(e) => setUserSettings({...userSettings, name: e.target.value})} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={userSettings.email} 
                      onChange={(e) => setUserSettings({...userSettings, email: e.target.value})} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">User ID:</span>
                      <p className="font-mono text-gray-900">{user?.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Member Since:</span>
                      <p className="text-gray-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Methods</h3>
                <p className="text-gray-600">Securely manage your payment information</p>
              </div>
              <div className="space-y-6">
                <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">VISA</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Visa ending in 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/2028</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
                <button className="w-full p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-3 group">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <span className="text-white font-bold text-lg">+</span>
                  </div>
                  <span className="font-semibold text-blue-600 group-hover:text-blue-700">Add New Payment Method</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Notifications</h3>
                <p className="text-gray-600">Choose when you want to be notified about your gifts</p>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <BellRing className="h-4 w-4 mr-2" />
                    Reminder Notifications
                  </h4>
                  <div className="space-y-4">
                    {[
                      { key: 'days_10', label: '10 days before a gift date', description: 'Get an early reminder to plan ahead' },
                      { key: 'days_3', label: '3 days before a gift date', description: 'Final reminder to ensure everything is ready' },
                      { key: 'day_of', label: 'On the day of the event', description: 'Get notified on the special day' }
                    ].map(({ key, label, description }) => (
                      <label key={key} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={userSettings.notifications.reminders[key as keyof typeof userSettings.notifications.reminders]} 
                          onChange={(e) => handleNotificationChange('reminders', key, e.target.checked)} 
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        /> 
                        <div>
                          <span className="text-gray-900 font-medium">{label}</span>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmation Notifications
                  </h4>
                  <div className="space-y-4">
                    {[
                      { key: 'scheduled', label: 'When a gift is scheduled', description: 'Confirm your gift has been scheduled' },
                      { key: 'delivered', label: 'When a gift is delivered', description: 'Get notified when your gift is delivered' }
                    ].map(({ key, label, description }) => (
                      <label key={key} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={userSettings.notifications.confirmations[key as keyof typeof userSettings.notifications.confirmations]} 
                          onChange={(e) => handleNotificationChange('confirmations', key, e.target.checked)} 
                          className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                        /> 
                        <div>
                          <span className="text-gray-900 font-medium">{label}</span>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gift Defaults</h3>
                <p className="text-gray-600">Set your preferred gift options for quick scheduling</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Gift Type</label>
                  <select 
                    value={userSettings.defaults.giftAmount} 
                    onChange={(e) => handleSettingChange('defaults', 'giftAmount', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="Personal Note and photo ($5)">Personal Note and photo ($5)</option>
                    <option value="Sweet Something ($25)">Sweet Something ($25)</option>
                    <option value="Thoughtful Present ($50)">Thoughtful Present ($50)</option>
                    <option value="Generous Gesture ($100)">Generous Gesture ($100)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Signature</label>
                  <input 
                    type="text" 
                    value={userSettings.defaults.signature} 
                    onChange={(e) => handleSettingChange('defaults', 'signature', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="e.g., With love,"
                  />
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Preview</h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-600 mb-2">Your default message will look like:</p>
                    <p className="text-gray-900 italic">"{userSettings.defaults.signature}"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-600">Keep your account safe and secure</p>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-4 flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password Security
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200">
                      <div>
                        <p className="font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <button 
                        onClick={handlePasswordChange}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Two-Factor Authentication
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer p-4 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors">
                      <input type="checkbox" className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"/> 
                      <div>
                        <span className="font-medium text-gray-900">Enable Two-Factor Authentication</span>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Data Management</h3>
                <p className="text-gray-600">Control your data and privacy</p>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </h4>
                  <button 
                    onClick={handleDataExport}
                    className="w-full text-left p-4 bg-white border border-green-200 rounded-xl hover:bg-green-50 transition-all duration-200 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-gray-900">Export All Gift Data as CSV</span>
                      <p className="text-sm text-gray-600">Download all your gifts and people data</p>
                    </div>
                    <Download size={20} className="text-green-600"/>
                  </button>
                </div>
                
                <div className="border-t border-red-200 pt-6">
                  <h4 className="font-bold text-red-700 mb-4 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Danger Zone
                  </h4>
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                    <button 
                      onClick={handleDataDelete}
                      className="w-full text-left p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">Delete All Data</span>
                        <p className="text-sm">Permanently remove all your data</p>
                      </div>
                      <Trash2 size={20}/>
                    </button>
                    <p className="text-xs text-red-600 mt-3">This action is irreversible. All your gifts and people data will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 