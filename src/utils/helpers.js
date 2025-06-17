import { addDoc, collection } from 'firebase/firestore';

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

// Add comprehensive dummy data for June and July 2025
export const addDummyData = async (db, userId) => {
  const eventsCollection = collection(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events');
  
  const dummyEvents = [
    // Sarah Johnson - Multiple gifts (fully configured)
    {
      friendName: 'Sarah Johnson',
      nickname: 'Sarah',
      relationship: 'Friend',
      eventType: 'Birthday',
      eventDate: '2025-06-15',
      personalMessage: 'Happy Birthday Sarah! Hope your special day is as amazing as you are! 🎉',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b787?w=400',
      address: {
        street: '123 Maple Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      birthday: '1990-06-15',
      anniversary: '',
      isRecurring: true
    },
    
    // Michael Chen - Work colleague (in progress)
    {
      friendName: 'Michael Chen',
      nickname: 'Mike',
      relationship: 'Colleague',
      eventType: 'Birthday',
      eventDate: '2025-06-22',
      personalMessage: 'Happy Birthday Mike! Thanks for being such a great colleague!',
      polaroidPhotoUrl: '',
      address: {
        street: '456 Oak Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      birthday: '1985-06-22',
      anniversary: '',
      isRecurring: true
    },
    
    // Emma Wilson - Wife (fully configured)
    {
      friendName: 'Emma Wilson',
      nickname: 'Em',
      relationship: 'Wife',
      eventType: 'Birthday',
      eventDate: '2025-07-03',
      personalMessage: 'Happy Birthday to my amazing wife! You make every day brighter! ❤️',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400',
      address: {
        street: '789 Pine Road',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      birthday: '1992-07-03',
      anniversary: '2018-09-15',
      isRecurring: true
    },
    
    // David Miller - Father (not started)
    {
      friendName: 'David Miller',
      nickname: 'Dad',
      relationship: 'Family',
      eventType: 'Father\'s Day',
      eventDate: '2025-06-15',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1955-03-20',
      anniversary: '',
      isRecurring: true
    },
    
    // Lisa Garcia - Friend (not started)
    {
      friendName: 'Lisa Garcia',
      nickname: 'Lisa',
      relationship: 'Friend',
      eventType: 'Birthday',
      eventDate: '2025-07-18',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1988-07-18',
      anniversary: '',
      isRecurring: false
    },
    
    // James Rodriguez - Wedding (fully configured)
    {
      friendName: 'James Rodriguez',
      nickname: 'Jimmy',
      relationship: 'Friend',
      eventType: 'Wedding',
      eventDate: '2025-07-25',
      personalMessage: 'Congratulations on your wedding day! Wishing you both a lifetime of happiness!',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      address: {
        street: '654 Cedar Lane',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      },
      birthday: '1990-04-12',
      anniversary: '',
      isRecurring: false
    },
    
    // Maria Santos - Colleague (in progress)
    {
      friendName: 'Maria Santos',
      nickname: 'Maria',
      relationship: 'Colleague',
      eventType: 'Birthday',
      eventDate: '2025-06-08',
      personalMessage: 'Happy Birthday Maria! Hope you have a wonderful day!',
      polaroidPhotoUrl: '',
      address: {
        street: '987 Birch Drive',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      birthday: '1987-06-08',
      anniversary: '',
      isRecurring: true
    },
    
    // Robert Taylor - Uncle (not started)
    {
      friendName: 'Robert Taylor',
      nickname: 'Uncle Bob',
      relationship: 'Family',
      eventType: 'Birthday',
      eventDate: '2025-07-12',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1970-07-12',
      anniversary: '',
      isRecurring: false
    },
    
    // Additional 17 gifts for variety (mix of all statuses)
    {
      friendName: 'Jennifer Lee',
      nickname: 'Jen',
      relationship: 'Friend',
      eventType: 'Graduation',
      eventDate: '2025-06-10',
      personalMessage: 'Congratulations on your graduation! So proud of you!',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      address: {
        street: '234 Willow St',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        country: 'USA'
      },
      birthday: '1995-03-14',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Carlos Mendez',
      nickname: 'Carlos',
      relationship: 'Romantic Partner',
      eventType: 'Anniversary',
      eventDate: '2025-06-20',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1989-11-22',
      anniversary: '2022-06-20',
      isRecurring: true
    },
    
    {
      friendName: 'Amanda Foster',
      nickname: 'Mandy',
      relationship: 'Friend',
      eventType: 'Baby Shower',
      eventDate: '2025-06-28',
      personalMessage: 'Congratulations on your upcoming little one!',
      polaroidPhotoUrl: '',
      address: {
        street: '567 Elm Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80201',
        country: 'USA'
      },
      birthday: '1991-08-15',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Kevin O\'Connor',
      nickname: 'Kev',
      relationship: 'Colleague',
      eventType: 'Work Anniversary',
      eventDate: '2025-07-05',
      personalMessage: 'Congratulations on 5 years with the company!',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      address: {
        street: '890 Spruce Ave',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA'
      },
      birthday: '1983-02-28',
      anniversary: '2020-07-05',
      isRecurring: true
    },
    
    {
      friendName: 'Rachel Green',
      nickname: 'Rachel',
      relationship: 'Friend',
      eventType: 'Housewarming',
      eventDate: '2025-07-15',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1986-09-10',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Thomas Anderson',
      nickname: 'Tom',
      relationship: 'Family',
      eventType: 'Birthday',
      eventDate: '2025-06-05',
      personalMessage: 'Happy Birthday cousin! Hope it\'s a great one!',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      address: {
        street: '345 Aspen Way',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        country: 'USA'
      },
      birthday: '1992-06-05',
      anniversary: '',
      isRecurring: true
    },
    
    {
      friendName: 'Sophie Turner',
      nickname: 'Sophie',
      relationship: 'Friend',
      eventType: 'Birthday',
      eventDate: '2025-06-30',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1994-06-30',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Mark Davis',
      nickname: 'Mark',
      relationship: 'Colleague',
      eventType: 'Promotion',
      eventDate: '2025-07-08',
      personalMessage: 'Congratulations on your well-deserved promotion!',
      polaroidPhotoUrl: '',
      address: {
        street: '123 Corporate Blvd',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30301',
        country: 'USA'
      },
      birthday: '1980-01-15',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Isabella Rodriguez',
      nickname: 'Bella',
      relationship: 'Family',
      eventType: 'Birthday',
      eventDate: '2025-07-20',
      personalMessage: 'Happy Sweet 16 Bella! You\'re growing up so fast!',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      address: {
        street: '678 Valley Road',
        city: 'Las Vegas',
        state: 'NV',
        zipCode: '89101',
        country: 'USA'
      },
      birthday: '2009-07-20',
      anniversary: '',
      isRecurring: true
    },
    
    {
      friendName: 'Alexander Kim',
      nickname: 'Alex',
      relationship: 'Friend',
      eventType: 'Birthday',
      eventDate: '2025-06-12',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1987-06-12',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Olivia Brown',
      nickname: 'Liv',
      relationship: 'Friend',
      eventType: 'Wedding',
      eventDate: '2025-07-30',
      personalMessage: 'Wishing you a lifetime of love and happiness!',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      address: {
        street: '456 Sunshine Dr',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
        country: 'USA'
      },
      birthday: '1993-04-18',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Daniel Thompson',
      nickname: 'Dan',
      relationship: 'Colleague',
      eventType: 'Birthday',
      eventDate: '2025-06-25',
      personalMessage: 'Happy Birthday Dan! Thanks for all your hard work!',
      polaroidPhotoUrl: '',
      address: {
        street: '789 Office Park',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        country: 'USA'
      },
      birthday: '1985-06-25',
      anniversary: '',
      isRecurring: true
    },
    
    {
      friendName: 'Grace Williams',
      nickname: 'Grace',
      relationship: 'Family',
      eventType: 'Birthday',
      eventDate: '2025-07-01',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1975-07-01',
      anniversary: '',
      isRecurring: false
    },
    
    {
      friendName: 'Ryan Murphy',
      nickname: 'Ryan',
      relationship: 'Friend',
      eventType: 'Birthday',
      eventDate: '2025-07-10',
      personalMessage: 'Happy Birthday Ryan! Hope you have an awesome day!',
      polaroidPhotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
      address: {
        street: '234 Park Avenue',
        city: 'Minneapolis',
        state: 'MN',
        zipCode: '55401',
        country: 'USA'
      },
      birthday: '1990-07-10',
      anniversary: '',
      isRecurring: true
    },
    
    {
      friendName: 'Hannah Clark',
      nickname: 'Hannah',
      relationship: 'Friend',
      eventType: 'Graduation',
      eventDate: '2025-06-18',
      personalMessage: '',
      polaroidPhotoUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      birthday: '1996-12-03',
      anniversary: '',
      isRecurring: false
    }
  ];
  
  console.log('Adding enhanced dummy data with 25 gifts...');
  
  for (const event of dummyEvents) {
    try {
      await addDoc(eventsCollection, event);
    } catch (error) {
      console.error('Error adding dummy event:', error);
    }
  }
  
  console.log('Enhanced dummy data added successfully');
};
