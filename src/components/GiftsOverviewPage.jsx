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
      
      let dayClass = 'h-32 border border-gray-300 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-white hover:bg-gray-50';
      
      if (!isCurrentMonth) {
        dayClass = 'h-32 border border-gray-200 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-gray-50 text-gray-400';
      } else if (isToday) {
        dayClass += ' ring-2 ring-black';
      }
      
      // Apply color coding based on gift status
      if (dayEvents.length > 0 && isCurrentMonth) {
        const statusClass = getDayStatusClass(dayEvents);
        if (statusClass.includes('delivered')) {
          dayClass = 'h-32 border border-gray-400 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-gray-100 hover:bg-gray-200 text-gray-800';
        } else if (statusClass.includes('scheduled')) {
          dayClass = 'h-32 border border-gray-600 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-gray-800 hover:bg-gray-900 text-white';
        } else if (statusClass.includes('progress')) {
          dayClass = 'h-32 border border-gray-500 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-gray-600 hover:bg-gray-700 text-white';
        } else if (statusClass.includes('not-started')) {
          dayClass = 'h-32 border border-gray-400 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-gray-300 hover:bg-gray-400 text-gray-800';
        } else {
          dayClass = 'h-32 border border-gray-300 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-gray-200 hover:bg-gray-300 text-gray-900';
        }
      } else if (isHoliday && isCurrentMonth) {
        dayClass = 'h-32 border border-gray-200 p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between bg-gray-50 hover:bg-gray-100 text-gray-600';
      }

      days.push(
        <div
          key={i}
          className={dayClass}
        >
          <div className="flex justify-between items-start">
            <span className={`text-lg font-bold ${isToday ? 'text-black' : ''}`}>
              {date.getDate()}
            </span>
            {dayEvents.length > 0 && (
              <span className="bg-black text-white text-sm px-2 py-1 rounded-full font-bold min-w-[24px] text-center">
                {dayEvents.length}
              </span>
            )}
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-1">
            {isHoliday && (
              <div className="text-xs font-medium truncate opacity-75">
                {holidays.find(h => h.date === dayString)?.name}
              </div>
            )}
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div key={idx} className="text-xs truncate font-medium opacity-80">
                {event.friendName}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs font-medium opacity-75">+{dayEvents.length - 2} more</div>
            )}
          </div>
          
          <div onClick={(e) => {
            e.stopPropagation();
            handleDayClick(date);
          }} className="w-full h-full absolute top-0 left-0"></div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-100 p-4 text-center font-bold text-gray-900 border-b border-r border-gray-300 last:border-r-0">
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
    const years = [];
    
    // Show decades from 1920 to 2130 (21 decades total)
    for (let decade = 1920; decade <= 2120; decade += 10) {
      const decadeEvents = allEvents.filter(event => {
        const eventDate = new Date(event.eventDate);
        const eventYear = eventDate.getFullYear();
        return eventYear >= decade && eventYear < decade + 10;
      });
      
      const currentDecade = Math.floor(new Date().getFullYear() / 10) * 10;
      const isCurrentDecade = decade === currentDecade;
      
      years.push(
        <div
          key={decade}
          className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border hover:border-black ${
            isCurrentDecade 
              ? 'bg-white border-gray-300 ring-2 ring-black' 
              : 'bg-gray-50 border-gray-200'
          }`}
          onClick={() => {
            setCurrentDate(new Date(decade, 0, 1));
            setCalendarView('year');
          }}
        >
          <h3 className={`font-bold text-lg mb-2 ${isCurrentDecade ? 'text-gray-900' : 'text-gray-600'}`}>
            {decade}s
          </h3>
          <p className={`text-sm font-medium ${isCurrentDecade ? 'text-gray-600' : 'text-gray-500'}`}>
            {decade} - {decade + 9}
          </p>
          <p className={`font-medium mt-1 ${isCurrentDecade ? 'text-gray-600' : 'text-gray-500'}`}>
            {decadeEvents.length} gifts scheduled
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-5 gap-4 max-h-96 overflow-y-auto">
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
          return 'Decades (1920s - 2120s)';
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
        {calendarView !== 'decade' && (
          <button
            onClick={() => getNavigationFunction()('prev')}
            className="p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}
        
        <button
          onClick={handleHeaderClick}
          className="text-2xl font-bold text-gray-900 hover:text-gray-600 transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          {getHeaderText()}
        </button>
        
        {calendarView !== 'decade' && (
          <button
            onClick={() => getNavigationFunction()('next')}
            className="p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}
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
