
import React, { useState } from 'react';
import { Calendar, List, ChevronLeft, ChevronRight, Plus, Edit, Gift, Clock, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/integrations/stripe/client';
import { PaymentService } from '@/integrations/stripe/payment-service';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface GiftsOverviewPageProps {
  allEvents: any[];
  setCurrentPage: (page: string) => void;
  setEditingEvent: (event: any) => void;
  setPrefillDate: (date: string) => void;
  refreshData: () => void;
}

const GiftsOverviewPage: React.FC<GiftsOverviewPageProps> = ({ 
  allEvents, 
  setCurrentPage, 
  setEditingEvent, 
  setPrefillDate,
  refreshData 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusInfo = (event: any) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);
    const isPast = eventDate < now;
    const isFullyConfirmed = event.address?.street && event.gift_amount && event.personal_message && event.photo_url;

    if (isPast) {
      return isFullyConfirmed 
        ? { text: 'Gift Delivered', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: CheckCircle }
        : { text: 'Gift Not Sent', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle };
    }
    if (isFullyConfirmed) {
      return { text: 'Gift Scheduled', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
    }
    if (event.gift_amount || event.personal_message || event.photo_url || event.address?.street) {
      return { text: 'Gift In Progress', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Clock };
    }
    return { text: 'Gift Not Started', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle };
  };

  const getDayStatusClass = (day: number) => {
    if (!day) return 'bg-white hover:bg-blue-50 border-blue-100';
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const eventsOnDay = allEvents.filter(e => new Date(e.event_date).toDateString() === date.toDateString());
    if (eventsOnDay.length === 0) return 'bg-white hover:bg-blue-50 border-blue-100';
    const statuses = eventsOnDay.map(e => getStatusInfo(e).bgColor);
    if (statuses.includes('bg-red-100')) return 'bg-red-100 hover:bg-red-200 border-red-200';
    if (statuses.includes('bg-red-50')) return 'bg-red-50 hover:bg-red-100 border-red-200';
    if (statuses.includes('bg-orange-100')) return 'bg-orange-100 hover:bg-orange-200 border-orange-200';
    if (statuses.includes('bg-green-100')) return 'bg-green-100 hover:bg-green-200 border-green-200';
    return 'bg-blue-100 hover:bg-blue-200 border-blue-200';
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const calendarDays = [...Array(firstDayIndex).fill(null), ...Array(daysInMonth).keys()].map(i => i === null ? null : i + 1);

  const upcomingEvents = allEvents
    .filter(event => new Date(event.event_date) > new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3);

  // Add a function to handle payment for draft gifts
  const handlePaymentForGift = (gift: any) => {
    // Navigate to payment form
    setCurrentPage('add-edit');
    setEditingEvent(gift);
    // The AddEditEventPage will show the payment form
  };

  // Add new state variables for payment
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [currentGiftId, setCurrentGiftId] = useState('');

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

  const handleEditGift = (gift: any) => {
    setEditingEvent(gift);
    setCurrentPage('add-event');
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!confirm('Are you sure you want to delete this gift?')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      refreshData();
    } catch (error) {
      console.error('Error deleting gift:', error);
      alert('Failed to delete gift. Please try again.');
    }
  };

  const renderGiftCard = (gift: any) => (
    <div key={gift.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {gift.people?.name || 'Unknown Recipient'}
          </h3>
          <p className="text-sm text-gray-600">{gift.event_type}</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            gift.status === 'draft' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : gift.status === 'paid' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {gift.status === 'draft' ? 'Draft' : gift.status === 'paid' ? 'Paid' : gift.status}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
          <span>{new Date(gift.event_date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Gift className="mr-2 h-4 w-4 text-purple-500" />
          <span className="font-medium">{gift.gift_amount}</span>
        </div>
        {gift.personal_message && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 italic">
              "{gift.personal_message}"
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditGift(gift)}
            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteGift(gift.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            Delete
          </Button>
        </div>
        
        {gift.status === 'draft' && (
          <Button
            onClick={() => handlePaymentForGift(gift)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay & Confirm
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Gifts</h2>
                <p className="text-blue-100 text-sm">Manage your gift schedule</p>
              </div>
            </div>
            <button
              onClick={() => { setCurrentPage('add-event'); setEditingEvent(null); }}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm flex items-center space-x-2 hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Add Gift</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="px-8 py-6 border-b border-blue-100">
          <div className="inline-flex rounded-xl shadow-sm bg-blue-50 p-1">
            <button 
              onClick={() => setViewMode('calendar')} 
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 rounded-lg transition-all duration-200 ${
                viewMode === 'calendar' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:bg-white hover:text-blue-700'
              }`}
            >
              <Calendar size={16}/>Calendar
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:bg-white hover:text-blue-700'
              }`}
            >
              <List size={16}/>List
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Events Summary */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <span>Upcoming Gifts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map(event => {
              const status = getStatusInfo(event);
              const StatusIcon = status.icon;
              return (
                <div key={event.id} className="p-6 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{event.recipient_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{event.event_type}</p>
                      <p className="text-sm text-gray-500">{formatDate(event.event_date)}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${status.bgColor} shadow-sm`}>
                      <StatusIcon className={`h-5 w-5 ${status.color}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                      {status.text}
                    </span>
                    <button 
                      onClick={() => { setEditingEvent(event); setCurrentPage('add-event'); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} 
              className="p-3 rounded-xl hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} 
              className="p-3 rounded-xl hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-semibold text-gray-600 text-sm py-4 text-center">{day}</div>
            ))}
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl h-32 flex flex-col items-center justify-start cursor-pointer border-2 transition-all duration-200 ${getDayStatusClass(day)}`}
                onClick={() => {
                  if (day) {
                    setPrefillDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0]);
                    setCurrentPage('add-event');
                  }
                }}
              >
                <span className="font-semibold text-gray-900 mb-2">{day}</span>
                {day && allEvents.filter(e => new Date(e.event_date).toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()).length > 0 && (
                  <div className="mt-1 flex flex-col items-center space-y-1">
                    <span className="text-xs font-medium text-gray-700 bg-white/80 rounded-full px-3 py-1 shadow-sm">
                      {allEvents.filter(e => new Date(e.event_date).toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()).length} gift(s)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Recipient</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Event</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {allEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="p-6 bg-blue-100 rounded-full">
                          <Gift className="h-12 w-12 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No gifts scheduled</h3>
                          <p className="text-gray-500">Start by adding your first gift</p>
                        </div>
                        <button
                          onClick={() => { setCurrentPage('add-event'); setEditingEvent(null); }}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Add Your First Gift</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allEvents.map(event => {
                    const status = getStatusInfo(event);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={event.id} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${status.bgColor} shadow-sm`}>
                              <StatusIcon className={`h-5 w-5 ${status.color}`} />
                            </div>
                            <span className="font-semibold text-gray-900">{event.recipient_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-gray-700">{event.event_type}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-gray-700">{formatDate(event.event_date)}</td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.color} shadow-sm`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <button 
                            onClick={() => { setEditingEvent(event); setCurrentPage('add-event'); }} 
                            className="text-blue-600 hover:text-blue-700 p-3 rounded-xl hover:bg-blue-100 transition-all duration-200"
                          >
                            <Edit size={18}/>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftsOverviewPage;
