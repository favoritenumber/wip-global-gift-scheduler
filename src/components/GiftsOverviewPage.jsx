
import React, { useState } from 'react';
import { Calendar, List, ChevronLeft, ChevronRight, Plus, Edit, Eye } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { formatDate, getStatusInfo, getDayStatusClass, getHolidays } from '../utils/helpers';

const GiftsOverviewPage = () => {
  const { allEvents, setCurrentPage, setEditingEvent, setPrefillDate } = useFirebase();
  const [viewMode, setViewMode] = useState('calendar');
  const [calendarView, setCalendarView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // Helper function to get events for a specific day
  const getEventsForDay = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return allEvents.filter(event => event.eventDate === dateString);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateYear = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateDecade = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 10);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 10);
    }
    setCurrentDate(newDate);
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
    setShowDayModal(true);
  };

  const handleAddGift = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setPrefillDate(dateString);
    setCurrentPage('add-event');
    setShowDayModal(false);
  };

  const handleEditGift = (event) => {
    setEditingEvent(event);
    setCurrentPage('add-event');
    setShowDayModal(false);
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const holidays = getHolidays(year);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = getEventsForDay(date);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const dayString = date.toISOString().split('T')[0];
      const isHoliday = holidays.some(h => h.date === dayString);
      
      let dayClass = 'h-24 border border-gray-300 p-2 cursor-pointer transition-all duration-200 flex flex-col justify-between';
      
      if (!isCurrentMonth) {
        dayClass += ' text-gray-400 bg-gray-50';
      } else if (isToday) {
        dayClass += ' ring-2 ring-black';
      }
      
      if (isHoliday) {
        dayClass += ' bg-gray-100 border-gray-400';
      } else if (dayEvents.length > 0) {
        dayClass += ` ${getDayStatusClass(dayEvents)}`;
      } else {
        dayClass += ' bg-white hover:bg-gray-50';
      }

      days.push(
        <div
          key={i}
          className={dayClass}
          onClick={() => handleDayClick(date)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-semibold ${isToday ? 'text-black' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
              {date.getDate()}
            </span>
            {dayEvents.length > 0 && (
              <span className="bg-black text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                {dayEvents.length}
              </span>
            )}
          </div>
          {isHoliday && (
            <div className="text-xs text-gray-600 font-medium truncate">
              {holidays.find(h => h.date === dayString)?.name}
            </div>
          )}
          {dayEvents.length > 0 && (
            <div className="flex flex-col space-y-1">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div key={idx} className="text-xs truncate opacity-75">
                  {event.friendName}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs opacity-75">+{dayEvents.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-100 p-3 text-center font-bold text-gray-900 border-b border-r border-gray-300 last:border-r-0">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
      const monthEvents = allEvents.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      });
      
      months.push(
        <div
          key={month}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-300 hover:border-black"
          onClick={() => {
            setCurrentDate(new Date(year, month, 1));
            setCalendarView('month');
          }}
        >
          <h3 className="font-bold text-lg text-gray-900 mb-2">{monthName}</h3>
          <p className="text-gray-600 font-medium">{monthEvents.length} gifts scheduled</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 gap-6">
        {months}
      </div>
    );
  };

  const renderDecadeView = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    const years = [];
    
    // Show previous 10, current 10, and future 10 decades worth of years
    for (let decade = -1; decade <= 1; decade++) {
      const decadeStartYear = startYear + (decade * 10);
      
      for (let i = 0; i < 10; i++) {
        const year = decadeStartYear + i;
        const yearEvents = allEvents.filter(event => {
          const eventDate = new Date(event.eventDate);
          return eventDate.getFullYear() === year;
        });
        
        const isCurrentDecade = decade === 0;
        
        years.push(
          <div
            key={year}
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border hover:border-black ${
              isCurrentDecade 
                ? 'bg-white border-gray-300' 
                : 'bg-gray-50 border-gray-200'
            }`}
            onClick={() => {
              setCurrentDate(new Date(year, 0, 1));
              setCalendarView('year');
            }}
          >
            <h3 className={`font-bold text-lg mb-2 ${isCurrentDecade ? 'text-gray-900' : 'text-gray-600'}`}>
              {year}
            </h3>
            <p className={`font-medium ${isCurrentDecade ? 'text-gray-600' : 'text-gray-500'}`}>
              {yearEvents.length} gifts scheduled
            </p>
          </div>
        );
      }
    }
    
    return (
      <div className="grid grid-cols-5 gap-4">
        {years}
      </div>
    );
  };

  const renderListView = () => {
    const holidays = getHolidays(2025).concat(getHolidays(2024), getHolidays(2026));
    const allItems = [...allEvents, ...holidays.map(h => ({ ...h, isHoliday: true }))];
    const sortedItems = allItems.sort((a, b) => new Date(a.eventDate || a.date) - new Date(b.eventDate || b.date));

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-b border-gray-300">Recipient/Event</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-b border-gray-300">Type</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-b border-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-b border-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-b border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedItems.map((item, index) => {
                if (item.isHoliday) {
                  return (
                    <tr key={`holiday-${index}`} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-700">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">Holiday</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(item.date)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          Upcoming Holiday
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleAddGift(new Date(item.date))}
                          className="text-black hover:text-gray-600 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                const statusInfo = getStatusInfo(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-gray-900">{item.friendName}</span>
                        {item.nickname && (
                          <span className="text-gray-500 ml-2">({item.nickname})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.eventType}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(item.eventDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditGift(item)}
                        className="text-black hover:text-gray-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCalendarHeader = () => {
    const getHeaderText = () => {
      switch (calendarView) {
        case 'month':
          return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        case 'year':
          return currentDate.getFullYear().toString();
        case 'decade':
          const startYear = Math.floor(currentDate.getFullYear() / 10) * 10;
          return `${startYear - 10} - ${startYear + 19}`;
        default:
          return '';
      }
    };

    const getNavigationFunction = () => {
      switch (calendarView) {
        case 'month': return navigateMonth;
        case 'year': return navigateYear;
        case 'decade': return navigateDecade;
        default: return navigateMonth;
      }
    };

    const handleHeaderClick = () => {
      if (calendarView === 'month') {
        setCalendarView('year');
      } else if (calendarView === 'year') {
        setCalendarView('decade');
      }
    };

    return (
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => getNavigationFunction()('prev')}
          className="p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        
        <button
          onClick={handleHeaderClick}
          className="text-2xl font-bold text-gray-900 hover:text-gray-600 transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          {getHeaderText()}
        </button>
        
        <button
          onClick={() => getNavigationFunction()('next')}
          className="p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    );
  };

  const renderCalendarView = () => {
    switch (calendarView) {
      case 'month': return renderMonthView();
      case 'year': return renderYearView();
      case 'decade': return renderDecadeView();
      default: return renderMonthView();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">
            Your Gifts
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            {allEvents.length} gifts scheduled • Never miss a special moment
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-300">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
          </div>
          
          {/* Add Gift Button */}
          <button
            onClick={() => setCurrentPage('add-event')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-lg border border-gray-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Gift</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <div>
          {renderCalendarHeader()}
          {renderCalendarView()}
        </div>
      ) : (
        renderListView()
      )}

      {/* Day Events Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto border border-gray-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedDay.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                {getEventsForDay(selectedDay).map((event) => (
                  <div key={event.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.friendName}</h4>
                        <p className="text-sm text-gray-600">{event.eventType}</p>
                        {event.personalMessage && (
                          <p className="text-xs text-gray-500 mt-1">{event.personalMessage}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditGift(event)}
                        className="text-black hover:text-gray-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {getEventsForDay(selectedDay).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No gifts scheduled for this day</p>
                )}
                
                <button
                  onClick={() => handleAddGift(selectedDay)}
                  className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-300"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Gift for this Date</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftsOverviewPage;
