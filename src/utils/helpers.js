
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

// Get day status class based on events
export const getDayStatusClass = (events) => {
  if (events.length === 0) return 'bg-white hover:bg-gray-50 border-gray-200';
  
  // Priority: Not Sent > Not Started > In Progress > Scheduled > Delivered
  const hasNotSent = events.some(event => getStatusInfo(event).priority === 4);
  const hasNotStarted = events.some(event => getStatusInfo(event).priority === 3);
  const hasInProgress = events.some(event => getStatusInfo(event).priority === 2);
  const hasScheduled = events.some(event => getStatusInfo(event).priority === 1);
  
  if (hasNotSent) return 'bg-red-100 hover:bg-red-200 border-red-300 text-red-900';
  if (hasNotStarted) return 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800';
  if (hasInProgress) return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-900';
  if (hasScheduled) return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-900';
  
  return 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'; // All delivered
};

// Get status information for an event
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
        priority: 0
      };
    } else {
      return {
        text: 'Gift Not Sent',
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        priority: 4
      };
    }
  }
  
  // Future/Present events
  const isFullyConfigured = event.address?.street && event.personalMessage && event.polaroidPhotoUrl;
  if (isFullyConfigured) {
    return {
      text: 'Gift Scheduled',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      priority: 1
    };
  }
  
  const isPartiallyConfigured = event.address?.street || event.personalMessage || event.polaroidPhotoUrl;
  if (isPartiallyConfigured) {
    return {
      text: 'Gift In Progress',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      priority: 2
    };
  }
  
  return {
    text: 'Gift Not Started',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
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

// Check if a date is a major gifting day
export const isGiftingDay = (dateString) => {
  const giftingDays = getMajorGiftingDays();
  return giftingDays.find(day => day.date === dateString);
};

// Add comprehensive dummy data for June and July 2025
export const addDummyData = async (db, userId) => {
  const eventsCollection = collection(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events');
  
  const dummyEvents = [
    // Sarah Johnson - Multiple gifts
    {
      friendName: 'Sarah Johnson',
      nickname: 'Sarah',
      relationship: 'Friend',
      eventType: 'Birthday',
      eventDate: '2025-06-15',
      personalMessage: 'Happy Birthday Sarah! Hope your special day is as amazing as you are! 🎉',
      polaroidPhotoUrl: '',
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
    {
      friendName: 'Sarah Johnson',
      nickname: 'Sarah',
      relationship: 'Friend',
      eventType: 'Christmas',
      eventDate: '2025-12-25',
      personalMessage: 'Merry Christmas Sarah! Wishing you joy and happiness this holiday season!',
      polaroidPhotoUrl: '',
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
    
    // Michael Chen - Multiple gifts
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
    {
      friendName: 'Michael Chen',
      nickname: 'Mike',
      relationship: 'Colleague',
      eventType: 'Work Anniversary',
      eventDate: '2025-07-10',
      personalMessage: 'Congratulations on your work anniversary, Mike! Here\'s to many more successful years!',
      polaroidPhotoUrl: '',
      address: {
        street: '456 Oak Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      birthday: '1985-06-22',
      anniversary: '2020-07-10',
      isRecurring: true
    },
    
    // Emma Wilson - Wife with multiple gifts
    {
      friendName: 'Emma Wilson',
      nickname: 'Em',
      relationship: 'Romantic Partner',
      eventType: 'Birthday',
      eventDate: '2025-07-03',
      personalMessage: 'Happy Birthday to my amazing wife! You make every day brighter! ❤️',
      polaroidPhotoUrl: '',
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
    {
      friendName: 'Emma Wilson',
      nickname: 'Em',
      relationship: 'Romantic Partner',
      eventType: 'Anniversary',
      eventDate: '2025-09-15',
      personalMessage: 'Happy Anniversary my love! Seven wonderful years and counting! 💕',
      polaroidPhotoUrl: '',
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
    
    // David Miller - Father
    {
      friendName: 'David Miller',
      nickname: 'Dad',
      relationship: 'Family',
      eventType: 'Father\'s Day',
      eventDate: '2025-06-15',
      personalMessage: 'Happy Father\'s Day Dad! Thank you for everything you\'ve done for our family.',
      polaroidPhotoUrl: '',
      address: {
        street: '321 Elm Street',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA'
      },
      birthday: '1955-03-20',
      anniversary: '',
      isRecurring: true
    },
    
    // Lisa Garcia - Birthday in July
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
    
    // James Rodriguez - Wedding
    {
      friendName: 'James Rodriguez',
      nickname: 'Jimmy',
      relationship: 'Friend',
      eventType: 'Wedding',
      eventDate: '2025-07-25',
      personalMessage: 'Congratulations on your wedding day! Wishing you both a lifetime of happiness!',
      polaroidPhotoUrl: '',
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
    
    // Additional gifts for variety
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
    
    {
      friendName: 'Robert Taylor',
      nickname: 'Bob',
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
    }
  ];
  
  console.log('Adding dummy data...');
  
  for (const event of dummyEvents) {
    try {
      await addDoc(eventsCollection, event);
    } catch (error) {
      console.error('Error adding dummy event:', error);
    }
  }
  
  console.log('Dummy data added successfully');
};
