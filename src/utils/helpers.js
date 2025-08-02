// Firebase imports removed - using Supabase instead

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get day status class based on events - Updated for black and white theme
export const getDayStatusClass = (events) => {
  if (events.length === 0) return 'bg-white hover:bg-gray-50 border-gray-200';
  
  // Priority: Not Sent > Not Started > In Progress > Scheduled > Delivered
  const hasNotSent = events.some(event => getStatusInfo(event).priority === 4);
  const hasNotStarted = events.some(event => getStatusInfo(event).priority === 3);
  const hasInProgress = events.some(event => getStatusInfo(event).priority === 2);
  const hasScheduled = events.some(event => getStatusInfo(event).priority === 1);
  
  if (hasNotSent) return 'bg-calendar-not-sent';
  if (hasNotStarted) return 'bg-calendar-not-started';
  if (hasInProgress) return 'bg-calendar-progress';
  if (hasScheduled) return 'bg-calendar-scheduled';
  
  return 'bg-calendar-delivered'; // All delivered
};

// Get status information for an event - Updated for black and white theme
export const getStatusInfo = (event) => {
  const today = new Date();
  const eventDate = new Date(event.eventDate);
  
  // Check if event is in the past
  if (eventDate < today) {
    const isFullyConfigured = event.address?.street && event.personalMessage && event.polaroidPhotoUrl;
    if (isFullyConfigured) {
      return {
        text: 'Gift Delivered',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        className: 'bg-gray-100 text-gray-800',
        priority: 0
      };
    } else {
      return {
        text: 'Gift Not Sent',
        color: 'text-gray-900',
        bgColor: 'bg-gray-200',
        className: 'bg-gray-200 text-gray-900',
        priority: 4
      };
    }
  }
  
  // Future/Present events
  const isFullyConfigured = event.address?.street && event.personalMessage && event.polaroidPhotoUrl;
  if (isFullyConfigured) {
    return {
      text: 'Gift Scheduled',
      color: 'text-white',
      bgColor: 'bg-gray-800',
      className: 'bg-gray-800 text-white',
      priority: 1
    };
  }
  
  const isPartiallyConfigured = event.address?.street || event.personalMessage || event.polaroidPhotoUrl;
  if (isPartiallyConfigured) {
    return {
      text: 'Gift In Progress',
      color: 'text-white',
      bgColor: 'bg-gray-600',
      className: 'bg-gray-600 text-white',
      priority: 2
    };
  }
  
  return {
    text: 'Gift Not Started',
    color: 'text-gray-800',
    bgColor: 'bg-gray-300',
    className: 'bg-gray-300 text-gray-800',
    priority: 3
  };
};

// Get event types by relationship
export const getEventTypesByRelationship = (relationship) => {
  const eventTypes = {
    'Family': ['Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Graduation', 'Christmas', 'Thanksgiving', 'Easter', 'Mother\'s Day', 'Father\'s Day'],
    'Friend': ['Birthday', 'Wedding', 'Baby Shower', 'Graduation', 'Housewarming', 'Christmas', 'New Year'],
    'Colleague': ['Birthday', 'Work Anniversary', 'Promotion', 'Retirement', 'Christmas', 'Boss\'s Day'],
    'Romantic Partner': ['Birthday', 'Anniversary', 'Valentine\'s Day', 'Christmas', 'New Year', 'Just Because'],
    'Other': ['Birthday', 'Thank You', 'Get Well Soon', 'Congratulations', 'Apology', 'Just Because']
  };
  
  return eventTypes[relationship] || eventTypes['Other'];
};

// Major gifting holidays for 2025
export const getMajorGiftingDays = () => {
  return [
    { date: '2025-01-01', name: 'New Year\'s Day', type: 'holiday' },
    { date: '2025-02-14', name: 'Valentine\'s Day', type: 'holiday' },
    { date: '2025-03-08', name: 'International Women\'s Day', type: 'holiday' },
    { date: '2025-04-13', name: 'Easter', type: 'holiday' },
    { date: '2025-05-11', name: 'Mother\'s Day', type: 'holiday' },
    { date: '2025-06-15', name: 'Father\'s Day', type: 'holiday' },
    { date: '2025-07-04', name: 'Independence Day', type: 'holiday' },
    { date: '2025-10-31', name: 'Halloween', type: 'holiday' },
    { date: '2025-11-27', name: 'Thanksgiving', type: 'holiday' },
    { date: '2025-12-25', name: 'Christmas', type: 'holiday' },
    { date: '2025-12-31', name: 'New Year\'s Eve', type: 'holiday' }
  ];
};

// Get holidays for a specific year
export const getHolidays = (year) => {
  // For now, we'll return the 2025 holidays for any year
  // In a real app, you'd generate holidays based on the year
  const holidays = [
    { date: `${year}-01-01`, name: 'New Year\'s Day', type: 'holiday' },
    { date: `${year}-02-14`, name: 'Valentine\'s Day', type: 'holiday' },
    { date: `${year}-03-08`, name: 'International Women\'s Day', type: 'holiday' },
    { date: `${year}-04-13`, name: 'Easter', type: 'holiday' },
    { date: `${year}-05-11`, name: 'Mother\'s Day', type: 'holiday' },
    { date: `${year}-06-15`, name: 'Father\'s Day', type: 'holiday' },
    { date: `${year}-07-04`, name: 'Independence Day', type: 'holiday' },
    { date: `${year}-10-31`, name: 'Halloween', type: 'holiday' },
    { date: `${year}-11-27`, name: 'Thanksgiving', type: 'holiday' },
    { date: `${year}-12-25`, name: 'Christmas', type: 'holiday' },
    { date: `${year}-12-31`, name: 'New Year\'s Eve', type: 'holiday' }
  ];
  
  return holidays;
};

// Check if a date is a major gifting day
export const isGiftingDay = (dateString) => {
  const giftingDays = getMajorGiftingDays();
  return giftingDays.find(day => day.date === dateString);
};

// Firebase-dependent function removed - using Supabase instead
