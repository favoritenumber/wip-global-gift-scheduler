
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
    { value: 'Family', label: 'Family', subOptions: ['Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Partner', 'Grandparent', 'Cousin', 'Aunt/Uncle', 'Niece/Nephew'] },
    { value: 'Friend', label: 'Friends & Acquaintances', subOptions: ['Friend', 'Childhood Friend', 'College Friend', 'Work Friend', 'Neighbor'] },
    { value: 'Colleague', label: 'Professional', subOptions: ['Colleague', 'Boss', 'Employee', 'Client', 'Business Partner'] },
    { value: 'Romantic Partner', label: 'Romantic', subOptions: ['Partner', 'Spouse', 'Boyfriend', 'Girlfriend'] },
    { value: 'Other', label: 'Other', subOptions: ['Mentor', 'Teacher', 'Student', 'Caregiver', 'Other'] }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingEvent ? 'Edit Gift' : 'Add New Gift'}
        </h1>
        <Button
          variant="outline"
          onClick={() => {
            setEditingEvent(null);
            setCurrentPage('gifts');
          }}
        >
          Back to Gifts
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Relationship and Nickname Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <select
                id="relationship"
                value={formData.relationship}
                onChange={(e) => handleRelationshipChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                placeholder="Optional nickname"
              />
            </div>
          </div>

          {/* Recipient's Name with Autocomplete */}
          <div className="relative">
            <Label htmlFor="friendName">Recipient's Name *</Label>
            <Input
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
                // Delay hiding suggestions to allow clicking
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Enter recipient's name"
              required
            />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.map((name, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => handleSuggestionClick(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Event Type */}
          <div>
            <Label htmlFor="eventType">Event Type *</Label>
            <select
              id="eventType"
              value={formData.eventType}
              onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">-- Select an Event --</option>
              {eventTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Event Date and Type of Gift Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="giftType">Type of Gift</Label>
              <select
                id="giftType"
                value={formData.giftType}
                onChange={(e) => setFormData(prev => ({ ...prev, giftType: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                {giftTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-600">
                {giftTypeOptions.find(opt => opt.value === formData.giftType)?.description}
              </p>
            </div>
          </div>

          {/* Personal Message and Photo Upload Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personalMessage">Personal Message</Label>
              <Textarea
                id="personalMessage"
                value={formData.personalMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, personalMessage: e.target.value }))}
                placeholder="Enter your personal message..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="photo">Upload Photo</Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Saving...' : (editingEvent ? 'Update Gift' : 'Schedule Gift')}
            </Button>
          </div>
        </div>

        {/* Right Column - Card Preview */}
        <div className="lg:sticky lg:top-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Preview</h3>
          <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6 shadow-sm">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-start space-x-4">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-20 h-24 object-cover rounded border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-24 bg-gray-200 rounded border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-500 text-center">No Photo Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1">
                  <p className="text-gray-900 mb-4">
                    Dear {formData.friendName || 'Recipient'},
                  </p>
                  
                  <div className="text-gray-700 italic mb-4 min-h-[60px]">
                    {formData.personalMessage || 'Your personal message will appear here.'}
                  </div>

                  <div className="text-right">
                    <p className="text-gray-900">With love,</p>
                    <p className="text-gray-900 font-medium">
                      {userSettings.senderName || 'John Doe'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEventPage;
