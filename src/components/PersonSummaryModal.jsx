
import React, { useState } from 'react';
import { X, Calendar, MapPin, Save, Gift } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { writeBatch, doc } from 'firebase/firestore';

const PersonSummaryModal = ({ person, onClose }) => {
  const { db, userId } = useFirebase();
  const [formData, setFormData] = useState({
    nickname: person.nickname || '',
    birthday: person.birthday || '',
    anniversary: person.anniversary || '',
    address: {
      street: person.address?.street || '',
      city: person.address?.city || '',
      state: person.address?.state || '',
      zipCode: person.address?.zipCode || '',
      country: person.address?.country || 'USA'
    }
  });
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const holidays = [
    { id: 'birthday', name: 'Birthday', date: formData.birthday },
    { id: 'christmas', name: 'Christmas', date: '2025-12-25' },
    { id: 'valentines', name: "Valentine's Day", date: '2025-02-14' },
    { id: 'mothers-day', name: "Mother's Day", date: '2025-05-11' },
    { id: 'fathers-day', name: "Father's Day", date: '2025-06-15' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      // Update all events for this person
      person.events.forEach(event => {
        const eventRef = doc(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events', event.id);
        batch.update(eventRef, {
          nickname: formData.nickname,
          birthday: formData.birthday,
          anniversary: formData.anniversary,
          address: formData.address
        });
      });
      
      await batch.commit();
      console.log('Person data updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating person:', error);
      alert('Error updating person data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleHolidays = async () => {
    if (!hasCompleteAddress()) {
      alert('Please complete the address before scheduling holidays.');
      return;
    }

    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      selectedHolidays.forEach(holidayId => {
        const holiday = holidays.find(h => h.id === holidayId);
        if (holiday && holiday.date) {
          const newEventRef = doc(collection(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events'));
          batch.set(newEventRef, {
            friendName: person.name,
            nickname: formData.nickname,
            relationship: 'Friend',
            eventType: holiday.name,
            eventDate: holiday.date,
            personalMessage: '',
            polaroidPhotoUrl: '',
            address: formData.address,
            birthday: formData.birthday,
            anniversary: formData.anniversary,
            isRecurring: true
          });
        }
      });
      
      await batch.commit();
      console.log('Holiday gifts scheduled successfully');
      setSelectedHolidays([]);
      onClose();
    } catch (error) {
      console.error('Error scheduling holidays:', error);
      alert('Error scheduling holiday gifts. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasCompleteAddress = () => {
    return formData.address.street && formData.address.city && 
           formData.address.state && formData.address.zipCode;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
              <p className="text-gray-600">Manage recipient information</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nickname</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter nickname"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anniversary</label>
            <input
              type="date"
              value={formData.anniversary}
              onChange={(e) => setFormData(prev => ({ ...prev, anniversary: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Address */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Address Information
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, street: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Street Address"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="State"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ZIP Code"
                />
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Quick Schedule */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Gift className="h-5 w-5 mr-2 text-purple-600" />
              Quick Schedule Holidays
            </h4>
            
            {!hasCompleteAddress() ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Complete the address information above to enable quick holiday scheduling.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {holidays.filter(h => h.date).map(holiday => (
                    <label key={holiday.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHolidays.includes(holiday.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHolidays(prev => [...prev, holiday.id]);
                          } else {
                            setSelectedHolidays(prev => prev.filter(id => id !== holiday.id));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{holiday.name}</span>
                    </label>
                  ))}
                </div>
                
                {selectedHolidays.length > 0 && (
                  <button
                    onClick={handleScheduleHolidays}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                  >
                    Schedule {selectedHolidays.length} Holiday{selectedHolidays.length !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonSummaryModal;
