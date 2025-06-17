import React, { useState } from 'react';
import { Calendar, List, Plus, Edit, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { formatDate, getDayStatusClass, getStatusInfo, getMajorGiftingDays, isGiftingDay } from '../utils/helpers';

const GiftsOverviewPage = () => {
  const { allEvents, setCurrentPage, setEditingEvent, setPrefillDate } = useFirebase();
  const [viewMode, setViewMode] = useState('calendar');
  const [calendarView, setCalendarView] = useState('month'); // month, year, decade
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Calendar logic
  const renderMonthView = () => {
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

    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <button
            onClick={() => setCalendarView('year')}
            className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors"
          >
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-purple-700">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDay(date);
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === new Date().toDateString();
              const giftingDay = isGiftingDay(date.toISOString().split('T')[0]);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(date)}
                  className={`
                    relative h-20 p-2 text-left border rounded-lg transition-all duration-200 hover:scale-105
                    ${giftingDay ? 'bg-pink-100 border-pink-300' : getDayStatusClass(dayEvents)}
                    ${!isCurrentMonth ? 'opacity-50' : ''}
                    ${isToday ? 'ring-2 ring-purple-500 shadow-lg' : ''}
                  `}
                >
                  <span className={`text-sm ${isToday ? 'font-bold text-purple-700' : ''}`}>
                    {date.getDate()}
                  </span>
                  
                  {giftingDay && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    </div>
                  )}
                  
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-xs bg-black bg-opacity-75 text-white px-1 rounded text-center">
                        {dayEvents.length} gift{dayEvents.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                  
                  {dayEvents.length === 0 && isCurrentMonth && (
                    <div className="absolute bottom-1 right-1">
                      <Plus className="h-3 w-3 text-gray-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
    
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100">
        <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <button
            onClick={() => setCalendarView('decade')}
            className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors"
          >
            {currentDate.getFullYear()}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {months.map((month, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentDate(month);
                  setCalendarView('month');
                }}
                className="p-4 text-center rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                <div className="font-medium text-gray-900">
                  {month.toLocaleDateString('en-US', { month: 'long' })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {allEvents.filter(event => {
                    const eventDate = new Date(event.eventDate);
                    return eventDate.getMonth() === index && eventDate.getFullYear() === currentDate.getFullYear();
                  }).length} gifts
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gift Overview
          </h1>
          <p className="text-gray-600 mt-2">Manage and track all your scheduled gifts</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-1 flex border border-purple-100">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
          </div>
          
          <button
            onClick={() => setCurrentPage('add-event')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Gift</span>
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div>
          {calendarView === 'month' && renderMonthView()}
          {calendarView === 'year' && renderYearView()}
        </div>
      )}

      {/* Enhanced List View */}
      {viewMode === 'list' && (
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {[...allEvents, ...getMajorGiftingDays().map(day => ({ 
                id: `holiday-${day.date}`, 
                friendName: day.name, 
                eventType: 'Holiday', 
                eventDate: day.date,
                isHoliday: true
              }))].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).map((event, index) => {
                if (event.isHoliday) {
                  return (
                    <tr key={event.id} className="hover:bg-pink-25 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                            🎉
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-pink-700">
                              {event.friendName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-600">
                        Holiday
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(event.eventDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-700">
                          Holiday
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setPrefillDate(event.eventDate);
                            setCurrentPage('add-event');
                          }}
                          className="text-pink-600 hover:text-pink-900 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }
                
                const statusInfo = getStatusInfo(event);
                return (
                  <tr key={event.id || index} className="hover:bg-purple-25 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {event.friendName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {event.friendName}
                          </div>
                          {event.nickname && event.nickname !== event.friendName && (
                            <div className="text-sm text-gray-500">
                              ({event.nickname})
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.eventType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.eventDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
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
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No gifts scheduled yet.</p>
              <p className="text-gray-400 mb-6">Start by adding your first gift to get organized!</p>
              <button
                onClick={() => setCurrentPage('add-event')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
              >
                Schedule Your First Gift
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Day Events Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl max-w-lg w-full max-h-96 overflow-y-auto shadow-2xl border border-purple-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {selectedDay.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              {(() => {
                const dayEvents = getEventsForDay(selectedDay);
                const giftingDay = isGiftingDay(selectedDay.toISOString().split('T')[0]);
                
                return (
                  <div className="space-y-3">
                    {giftingDay && (
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🎉</span>
                          <span className="font-medium text-pink-700">{giftingDay.name}</span>
                        </div>
                      </div>
                    )}
                    
                    {dayEvents.map((event, index) => {
                      const statusInfo = getStatusInfo(event);
                      return (
                        <div key={index} className="border border-purple-100 rounded-lg p-4 bg-white/80 backdrop-blur-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{event.friendName}</h4>
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
                              className="text-purple-600 hover:text-purple-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    <button
                      onClick={() => addGiftForDate(selectedDay)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 mt-4 flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Gift for this Date</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftsOverviewPage;
