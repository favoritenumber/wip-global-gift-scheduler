import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Gift, User, Calendar, MapPin, Camera, Save, AlertCircle, Plus, X, Sparkles, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AIMessageGenerator from './AIMessageGenerator';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/integrations/stripe/client';
import { GIFT_AMOUNTS } from '@/integrations/stripe/client';
import PaymentForm from './PaymentForm';

interface AddEditEventPageProps {
  editingEvent: any;
  setEditingEvent: (event: any) => void;
  prefillDate: string | null;
  setPrefillDate: (date: string | null) => void;
  setCurrentPage: (page: string) => void;
  allPeople: any[];
  refreshData: () => void;
}

const AddEditEventPage: React.FC<AddEditEventPageProps> = ({ 
  editingEvent, 
  setEditingEvent, 
  prefillDate, 
  setPrefillDate, 
  setCurrentPage,
  allPeople,
  refreshData
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipient_name: '',
    nickname: '',
    relationship: 'Friend',
    event_type: '',
    event_date: '',
    gift_amount: 'Personal Note and photo ($5)',
    personal_message: '',
    photo_url: '',
    address: {
      street: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'USA',
      phoneNumber: ''
    }
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [showAIMessageGenerator, setShowAIMessageGenerator] = useState(false);
  const nameInputRef = useRef(null);

  // Add new state variables for payment
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [currentGiftId, setCurrentGiftId] = useState('');

  // Initialize form data when editing or prefilling
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        recipient_name: editingEvent.recipient_name || '',
        nickname: editingEvent.nickname || '',
        relationship: editingEvent.relationship || 'Friend',
        event_type: editingEvent.event_type || '',
        event_date: editingEvent.event_date ? new Date(editingEvent.event_date).toISOString().split('T')[0] : '',
        gift_amount: editingEvent.gift_amount || 'Personal Note and photo ($5)',
        personal_message: editingEvent.personal_message || '',
        photo_url: editingEvent.photo_url || '',
        address: editingEvent.address || {
          street: '',
          city: '',
          stateProvince: '',
          postalCode: '',
          country: 'USA',
          phoneNumber: ''
        }
      });
      if (editingEvent.photo_url) {
        setPhotoPreview(editingEvent.photo_url);
      }
    } else if (prefillDate) {
      setFormData(prev => ({ ...prev, event_date: prefillDate }));
      setPrefillDate(null);
    }
  }, [editingEvent, prefillDate, setPrefillDate]);

  // Get unique names for autocomplete
  const getUniqueNames = () => {
    const names = new Set();
    allPeople.forEach(person => {
      if (person.name) {
        names.add(person.name);
      }
    });
    return Array.from(names);
  };

  // Handle name input change with autocomplete
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, recipient_name: value }));
    
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

  const handleSuggestionClick = (selectedName: string) => {
    setFormData(prev => ({ ...prev, recipient_name: selectedName }));
    setShowSuggestions(false);
    
    // Find the person and populate their data
    const person = allPeople.find(p => p.name === selectedName);
    if (person) {
      setFormData(prev => ({
        ...prev,
        nickname: person.nickname || '',
        address: person.address || prev.address
      }));
    }
  };

  const handleRelationshipChange = (relationship: string) => {
    setFormData(prev => ({ ...prev, relationship }));
    // Auto-suggest event type based on relationship
    const eventTypes = getEventTypesByRelationship(relationship);
    if (eventTypes.length > 0 && !formData.event_type) {
      setFormData(prev => ({ ...prev, event_type: eventTypes[0] }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.recipient_name || !formData.event_date || !formData.event_type) {
      setError('Recipient Name, Event Type, and Event Date are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // First, ensure the person exists in the people table
      let recipientId = null;
      
      // Check if person already exists
      const { data: existingPerson, error: findError } = await supabase
        .from('people')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', formData.recipient_name)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingPerson) {
        recipientId = existingPerson.id;
      } else {
        // Create new person
        const { data: newPerson, error: createError } = await supabase
          .from('people')
          .insert({
            user_id: user.id,
            name: formData.recipient_name,
            nickname: formData.nickname || null,
            birthday: null,
            anniversary: null,
            address: formData.address
          })
          .select('id')
          .single();

        if (createError) throw createError;
        recipientId = newPerson.id;
      }

      const eventData = {
        user_id: user.id,
        recipient_id: recipientId,
        relationship: formData.relationship,
        event_type: formData.event_type,
        event_date: new Date(formData.event_date).toISOString(),
        gift_amount: formData.gift_amount,
        personal_message: formData.personal_message,
        photo_url: formData.photo_url,
        status: 'draft' // Save as draft instead of 'not-started'
      };

      let savedGift;
      if (editingEvent && editingEvent.id) {
        const { data, error } = await supabase
          .from('gifts')
          .update(eventData)
          .eq('id', editingEvent.id)
          .select()
          .single();
        
        if (error) throw error;
        savedGift = data;
      } else {
        const { data, error } = await supabase
          .from('gifts')
          .insert(eventData)
          .select()
          .single();
        
        if (error) throw error;
        savedGift = data;
      }

      // Show payment form instead of redirecting
      setShowPayment(true);
      setPaymentAmount(GIFT_AMOUNTS[formData.gift_amount] || 500);
      setCurrentGiftId(savedGift.id);

    } catch (error) {
      console.error('Error saving gift:', error);
      setError('Failed to save gift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    refreshData();
    setCurrentPage('gifts');
    setEditingEvent(null);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    // Optionally delete the draft gift or keep it for later
  };

  const getEventTypesByRelationship = (relationship: string) => {
    const familyEvents = ['Birthday', 'Anniversary', 'Christmas', 'Holiday', 'Get Well Soon', 'Thank You'];
    const friendEvents = ['Birthday', 'Graduation', 'Housewarming', 'Work Anniversary', 'Thank You'];
    const workEvents = ['Work Anniversary', 'Promotion', 'Retirement', 'Thank You'];
    
    switch (relationship) {
      case 'Family':
      case 'Parent':
      case 'Child':
      case 'Sibling':
        return familyEvents;
      case 'Friend':
      case 'Work Friend':
        return friendEvents;
      case 'Colleague':
      case 'Boss':
        return workEvents;
      default:
        return ['Birthday', 'Anniversary', 'Graduation', 'Housewarming', 'Work Anniversary', 'Thank You'];
    }
  };

  const getGiftPreviewText = () => {
    switch (formData.gift_amount) {
      case 'Personal Note and photo ($5)': 
        return "Includes a polaroid-style photo and your personal message in a classic envelope.";
      case 'Sweet Something ($25)': 
        return "Includes everything from the Personal Note, plus a Chocolate bar.";
      case 'Thoughtful Present ($50)': 
        return "Includes everything from the Sweet Something, plus a $25 gift card.";
      case 'Generous Gesture ($100)': 
        return "Includes everything from the Sweet Something, plus a $75 gift card.";
      default: 
        return "";
    }
  };

  const handleAIMessageSelect = (message: string) => {
    setFormData(prev => ({ ...prev, personal_message: message }));
    setShowAIMessageGenerator(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {showPayment ? (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handlePaymentCancel}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Gift Details
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Gift</h1>
              <p className="text-gray-600">Please complete payment to schedule your gift.</p>
            </div>
            
            <Elements stripe={stripePromise}>
              <PaymentForm
                giftId={currentGiftId}
                amount={paymentAmount}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100">
          {/* Header */}
          <div className="bg-white shadow-lg border-b border-gray-100">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setCurrentPage('gifts');
                      setEditingEvent(null);
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {editingEvent ? 'Edit Gift' : 'Add New Gift'}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {editingEvent ? 'Update gift details' : 'Create a personalized gift experience'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <form onSubmit={(e) => e.preventDefault()} className="p-8 space-y-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                )}

                {/* Recipient Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <User className="h-6 w-6 text-blue-600" />
                    <span>Recipient Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Recipient Name *
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={formData.recipient_name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter recipient name"
                      />
                      {showSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {filteredSuggestions.map((name, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSuggestionClick(name)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nickname
                      </label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter nickname (optional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Relationship
                      </label>
                      <select
                        value={formData.relationship}
                        onChange={(e) => handleRelationshipChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Friend">Friend</option>
                        <option value="Family">Family</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Boss">Boss</option>
                        <option value="Work Friend">Work Friend</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Event Type *
                      </label>
                      <select
                        value={formData.event_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select event type</option>
                        {getEventTypesByRelationship(formData.relationship).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Gift Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Gift className="h-6 w-6 text-blue-600" />
                    <span>Gift Details</span>
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gift Type
                    </label>
                    <select
                      value={formData.gift_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, gift_amount: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Personal Note and photo ($5)">Personal Note and photo ($5)</option>
                      <option value="Sweet Something ($25)">Sweet Something ($25)</option>
                      <option value="Thoughtful Present ($50)">Thoughtful Present ($50)</option>
                      <option value="Special Gift ($100)">Special Gift ($100)</option>
                      <option value="Premium Gift ($250)">Premium Gift ($250)</option>
                      <option value="Luxury Gift ($500)">Luxury Gift ($500)</option>
                    </select>
                  </div>

                  {/* Payment Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">Payment Preview</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-600">
                          ${(GIFT_AMOUNTS[formData.gift_amount] || 500) / 100}
                        </span>
                        <p className="text-xs text-gray-600">USD</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-blue-200">
                      <p>✅ Secure payment processing</p>
                      <p>✅ Instant gift scheduling</p>
                      <p>✅ Email confirmation</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Personal Message
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAIMessageGenerator(true)}
                        className="flex items-center space-x-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>AI Generate</span>
                      </button>
                    </div>
                    <textarea
                      value={formData.personal_message}
                      onChange={(e) => setFormData(prev => ({ ...prev, personal_message: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Write a personal message for your gift..."
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Camera className="h-6 w-6 text-blue-600" />
                    <span>Photo (Optional)</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer">
                        <div className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2">
                          <Camera className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-600">Upload Photo</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview('');
                            setFormData(prev => ({ ...prev, photo_url: '' }));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    
                    {photoPreview && (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <span>Delivery Address</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter street address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={formData.address.stateProvince}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, stateProvince: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={formData.address.postalCode}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, postalCode: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter postal code"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Preview Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Payment Summary</h3>
                        <p className="text-sm text-gray-600">Complete your gift with secure payment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-green-600">
                        ${(GIFT_AMOUNTS[formData.gift_amount] || 500) / 100}
                      </span>
                      <p className="text-xs text-gray-600">USD</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="font-semibold text-green-700">✅ Secure Payment</p>
                      <p className="text-gray-600">SSL encrypted</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="font-semibold text-green-700">✅ Instant Scheduling</p>
                      <p className="text-gray-600">Gift scheduled immediately</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="font-semibold text-green-700">✅ Email Confirmation</p>
                      <p className="text-gray-600">Receipt sent to your email</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage('gifts');
                      setEditingEvent(null);
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Gift</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Make Payment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* AI Message Generator Modal */}
            {showAIMessageGenerator && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">AI Message Generator</h2>
                      <button
                        onClick={() => setShowAIMessageGenerator(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <AIMessageGenerator
                      recipientName={formData.recipient_name}
                      eventType={formData.event_type}
                      relationship={formData.relationship}
                      onMessageSelect={handleAIMessageSelect}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form Modal */}
            {showPayment && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Complete Your Gift</h2>
                      <button
                        onClick={handlePaymentCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <PaymentForm
                      amount={paymentAmount}
                      giftId={currentGiftId}
                      onSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEditEventPage; 