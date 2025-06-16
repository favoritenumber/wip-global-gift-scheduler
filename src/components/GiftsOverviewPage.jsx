
import React, { useState } from 'react';
import { Calendar, List, Plus, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { formatDate, getDayStatusClass, getStatusInfo } from '../utils/helpers';

const GiftsOverviewPage = () => {
  const { allEvents, setCurrentPage, setEditingEvent, setPrefillDate } = useFirebase();
  const [viewMode, setViewMode] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allEvents.filter(event => event.eventDate === dateStr);
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setCurrentPage('add-event');
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const addGiftForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setPrefillDate(dateStr);
    setSelectedDay(null);
    setCurrentPage('add-event');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gift Overview</h1>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
          </div>
          
          <button
            onClick={() => setCurrentPage('add-event')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Gift</span>
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDay(date);
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(date)}
                    className={`
                      relative h-20 p-2 text-left border rounded-lg transition-colors
                      ${getDayStatusClass(dayEvents)}
                      ${!isCurrentMonth ? 'text-gray-400' : ''}
                      ${isToday ? 'ring-2 ring-emerald-500' : ''}
                    `}
                  >
                    <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="text-xs bg-black bg-opacity-75 text-white px-1 rounded text-center">
                          {dayEvents.length} gift{dayEvents.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allEvents.map((event, index) => {
                const statusInfo = getStatusInfo(event);
                return (
                  <tr key={event.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.friendName}
                      </div>
                      {event.nickname && event.nickname !== event.friendName && (
                        <div className="text-sm text-gray-500">
                          ({event.nickname})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.eventType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.eventDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-emerald-600 hover:text-emerald-900 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {allEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No gifts scheduled yet.</p>
              <button
                onClick={() => setCurrentPage('add-event')}
                className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Schedule Your First Gift
              </button>
            </div>
          )}
        </div>
      )}

      {/* Day Events Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedDay.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {(() => {
                const dayEvents = getEventsForDay(selectedDay);
                if (dayEvents.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No gifts for this day</p>
                      <button
                        onClick={() => addGiftForDate(selectedDay)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        + Add Gift for this Date
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-3">
                      {dayEvents.map((event, index) => {
                        const statusInfo = getStatusInfo(event);
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{event.friendName}</h4>
                                <p className="text-sm text-gray-600">{event.eventType}</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${statusInfo.bgColor} ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  handleEditEvent(event);
                                  setSelectedDay(null);
                                }}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => addGiftForDate(selectedDay)}
                        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors mt-4"
                      >
                        + Add Gift for this Date
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftsOverviewPage;
