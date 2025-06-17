import React, { useState, useEffect, useRef } from 'react';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { getEventTypesByRelationship } from '../utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AddEditEventPage = () => {
  const { 
    db, 
    userId, 
    allEvents, 
    userSettings, 
    editingEvent, 
    setEditingEvent, 
    prefillDate, 
    setPrefillDate, 
    setCurrentPage 
  } = useFirebase();

  const [formData, setFormData] = useState({
    friendName: '',
    nickname: '',
    relationship: 'Friend',
    eventType: '',
    eventDate: '',
    giftType: 'Personal Note and photo ($5)',
    personalMessage: '',
    polaroidPhotoUrl: '',
    isRecurring: false,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    birthday: '',
    anniversary: ''
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const nameInputRef = useRef(null);

  // Initialize form data when editing or prefilling
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        friendName: editingEvent.friendName || '',
        nickname: editingEvent.nickname || '',
        relationship: editingEvent.relationship || 'Friend',
        eventType: editingEvent.eventType || '',
        eventDate: editingEvent.eventDate || '',
        giftType: 'Personal Note and photo ($5)',
        personalMessage: editingEvent.personalMessage || '',
        polaroidPhotoUrl: editingEvent.polaroidPhotoUrl || '',
        address: editingEvent.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        birthday: editingEvent.birthday || '',
        anniversary: editingEvent.anniversary || ''
      });
      if (editingEvent.polaroidPhotoUrl) {
        setPhotoPreview(editingEvent.polaroidPhotoUrl);
      }
    } else if (prefillDate) {
      setFormData(prev => ({ ...prev, eventDate: prefillDate }));
      setPrefillDate('');
    }
  }, [editingEvent, prefillDate, setPrefillDate]);

  // Get unique names for autocomplete
  const getUniqueNames = () => {
    const names = new Set();
    allEvents.forEach(event => {
      if (event.friendName) {
        names.add(event.friendName);
      }
    });
    return Array.from(names);
  };

  // Handle name input change with autocomplete
  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, friendName: value }));
    
    if (value.length > 0) {
      const suggestions = getUniqueNames().filter(name => 
        name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click - auto-populate form
  const handleSuggestionClick = (selectedName) => {
    const existingEvent = allEvents.find(event => event.friendName === selectedName);
    if (existingEvent) {
      setFormData(prev => ({
        ...prev,
        friendName: selectedName,
        nickname: existingEvent.nickname || '',
        address: existingEvent.address || prev.address,
        birthday: existingEvent.birthday || '',
        anniversary: existingEvent.anniversary || ''
      }));
    }
    setShowSuggestions(false);
  };

  // Handle relationship change - update event type options
  const handleRelationshipChange = (relationship) => {
    setFormData(prev => ({
      ...prev,
      relationship,
      eventType: '' // Reset event type when relationship changes
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setPhotoPreview(dataUrl);
        setFormData(prev => ({ ...prev, polaroidPhotoUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.friendName || !formData.eventType || !formData.eventDate) {
      alert('Please fill in all required fields: Recipient Name, Event Type, and Event Date.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const eventData = {
        friendName: formData.friendName,
        nickname: formData.nickname,
        relationship: formData.relationship,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        personalMessage: formData.personalMessage,
        polaroidPhotoUrl: formData.polaroidPhotoUrl,
        address: formData.address,
        birthday: formData.birthday,
        anniversary: formData.anniversary
      };

      if (editingEvent) {
        // Update existing event
        const eventRef = doc(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events', editingEvent.id);
        await updateDoc(eventRef, eventData);
        console.log('Event updated successfully');
      } else {
        // Create new event
        const eventsCollection = collection(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events');
        await addDoc(eventsCollection, eventData);
        console.log('Event added successfully');
      }

      // Success - navigate back to gifts page
      setEditingEvent(null);
      setTimeout(() => {
        setCurrentPage('gifts');
      }, 500);

    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving gift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypeOptions = getEventTypesByRelationship(formData.relationship);
  const giftTypeOptions = [
    { value: 'Personal Note and photo ($5)', label: 'Personal Note and photo ($5)', description: 'Includes a polaroid-style photo and your personal message in a classic envelope.' },
    { value: 'Sweet Something ($25)', label: 'Sweet Something ($25)', description: 'Includes everything from the Personal Note, plus a $25 gift card.' },
    { value: 'Thoughtful Present ($50)', label: 'Thoughtful Present ($50)', description: 'Includes everything from the Sweet Something, plus a $25 gift card.' },
    { value: 'Generous Gesture ($100)', label: 'Generous Gesture ($100)', description: 'Includes everything from the Thoughtful Present, plus additional surprise gifts.' }
  ];

  const relationshipOptions = [
    { value: 'Family', label: 'Family', subOptions: ['Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandparent', 'Cousin', 'Aunt/Uncle', 'Niece/Nephew'] },
    { value: 'Friend', label: 'Friends & Acquaintances', subOptions: ['Friend', 'Childhood Friend', 'College Friend', 'Work Friend', 'Neighbor'] },
    { value: 'Colleague', label: 'Professional', subOptions: ['Colleague', 'Boss', 'Employee', 'Client', 'Business Partner'] },
    { value: 'Romantic Partner', label: 'Romantic', subOptions: ['Husband', 'Wife', 'Partner', 'Spouse', 'Boyfriend', 'Girlfriend'] },
    { value: 'Other', label: 'Other', subOptions: ['Mentor', 'Teacher', 'Student', 'Caregiver', 'Other'] }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {editingEvent ? 'Edit Gift' : 'Add New Gift'}
          </h1>
          <p className="text-gray-600 mt-2">
            {editingEvent ? 'Update your gift details' : 'Schedule a thoughtful gift for someone special'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setCurrentPage('gifts');
          }}
          className="px-4 py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
        >
          Back to Gifts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gift Details</h3>
            
            {/* Relationship and Nickname Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => handleRelationshipChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {relationshipOptions.map(group => (
                    <optgroup key={group.value} label={group.label}>
                      {group.subOptions.map(option => (
                        <option key={option} value={group.value}>{option}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">Nickname</label>
                <input
                  id="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Optional nickname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Recipient's Name with Autocomplete */}
            <div className="relative mb-4">
              <label htmlFor="friendName" className="block text-sm font-medium text-gray-700 mb-2">Recipient's Name *</label>
              <input
                ref={nameInputRef}
                id="friendName"
                type="text"
                value={formData.friendName}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => {
                  if (formData.friendName.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter recipient's name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredSuggestions.map((name, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                      onClick={() => handleSuggestionClick(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Type */}
            <div className="mb-4">
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
              <select
                id="eventType"
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">-- Select an Event --</option>
                {eventTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Event Date and Type of Gift Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                <input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="giftType" className="block text-sm font-medium text-gray-700 mb-2">Type of Gift</label>
                <select
                  id="giftType"
                  value={formData.giftType}
                  onChange={(e) => setFormData(prev => ({ ...prev, giftType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {giftTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recurring Checkbox */}
            <div className="mb-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Make this gift automatically recurring annually</span>
              </label>
            </div>

            {/* Personal Message and Photo Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="personalMessage" className="block text-sm font-medium text-gray-700 mb-2">Personal Message</label>
                <textarea
                  id="personalMessage"
                  value={formData.personalMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalMessage: e.target.value }))}
                  placeholder="Enter your personal message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg"
            >
              {isSubmitting ? 'Saving...' : (editingEvent ? 'Update Gift' : 'Schedule Gift')}
            </button>
          </div>
        </div>

        {/* Right Column - Enhanced Card Preview */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Preview</h3>
            
            {/* Greeting Card Style Preview */}
            <div className="bg-gradient-to-br from-red-100 via-pink-50 to-red-100 border-2 border-red-200 rounded-xl p-6 shadow-lg">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-start space-x-4">
                  {/* Photo Preview */}
                  <div className="flex-shrink-0">
                    {photoPreview ? (
                      <div className="relative">
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-20 h-24 object-cover rounded-lg border-4 border-white shadow-md"
                        />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-200 rounded-full border-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="w-20 h-24 bg-gray-100 rounded-lg border-4 border-white shadow-md flex items-center justify-center">
                        <span className="text-xs text-gray-400 text-center">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1">
                    <div className="text-center mb-4">
                      <div className="w-16 h-1 bg-gradient-to-r from-red-300 to-pink-300 mx-auto mb-2"></div>
                      <p className="text-red-700 font-serif text-lg">
                        For {formData.friendName || 'Recipient'}
                      </p>
                      <div className="w-16 h-1 bg-gradient-to-r from-red-300 to-pink-300 mx-auto mt-2"></div>
                    </div>
                    
                    <div className="text-gray-700 italic mb-4 min-h-[60px] font-serif text-center">
                      {formData.personalMessage || 'Your personal message will appear here...'}
                    </div>

                    <div className="text-center border-t border-red-100 pt-4">
                      <p className="text-gray-700 font-serif">With love,</p>
                      <p className="text-gray-900 font-semibold font-serif">
                        {userSettings.senderName || 'John Doe'}
                      </p>
                      <p className="text-sm text-red-600 font-serif mt-1">
                        {userSettings.defaultSignature}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gift Type Description */}
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-700">
                {giftTypeOptions.find(opt => opt.value === formData.giftType)?.description}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEventPage;
