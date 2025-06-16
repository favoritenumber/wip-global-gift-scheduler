
// Date formatting utility
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Get today's date in YYYY-MM-DD format
export const TODAY = new Date().toISOString().split('T')[0];

// Status logic for gifts
export const getStatusInfo = (event) => {
  const eventDate = new Date(event.eventDate);
  const today = new Date(TODAY);
  
  const isFullyConfigured = event.address?.street && event.personalMessage && event.polaroidPhotoUrl;
  const isPartiallyConfigured = event.address?.street || event.personalMessage || event.polaroidPhotoUrl;
  
  if (eventDate < today) {
    // Past events
    if (isFullyConfigured) {
      return { text: 'Gift Delivered', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    } else {
      return { text: 'Gift Not Sent', color: 'text-red-800', bgColor: 'bg-red-100' };
    }
  } else {
    // Future/present events
    if (isFullyConfigured) {
      return { text: 'Gift Scheduled', color: 'text-green-700', bgColor: 'bg-green-100' };
    } else if (isPartiallyConfigured) {
      return { text: 'Gift In Progress', color: 'text-orange-700', bgColor: 'bg-orange-100' };
    } else {
      return { text: 'Gift Not Started', color: 'text-red-700', bgColor: 'bg-red-100' };
    }
  }
};

// Calendar day status class logic
export const getDayStatusClass = (dayEvents) => {
  if (!dayEvents || dayEvents.length === 0) return 'bg-white hover:bg-gray-50';
  
  let hasNotSent = false;
  let hasNotStarted = false;
  let hasInProgress = false;
  let hasScheduled = false;
  
  dayEvents.forEach(event => {
    const status = getStatusInfo(event);
    if (status.text === 'Gift Not Sent') hasNotSent = true;
    else if (status.text === 'Gift Not Started') hasNotStarted = true;
    else if (status.text === 'Gift In Progress') hasInProgress = true;
    else if (status.text === 'Gift Scheduled') hasScheduled = true;
  });
  
  // Priority: Not Sent > Not Started > In Progress > Scheduled > Delivered
  if (hasNotSent) return 'bg-red-200 hover:bg-red-300';
  if (hasNotStarted) return 'bg-red-100 hover:bg-red-200';
  if (hasInProgress) return 'bg-orange-200 hover:bg-orange-300';
  if (hasScheduled) return 'bg-green-200 hover:bg-green-300';
  return 'bg-gray-200 hover:bg-gray-300';
};

// Event types by relationship
export const getEventTypesByRelationship = (relationship) => {
  const eventTypes = {
    'Family': ['Birthday', 'Anniversary', 'Christmas', 'Thanksgiving', 'Easter', 'Mother\'s Day', 'Father\'s Day', 'Graduation'],
    'Friend': ['Birthday', 'Christmas', 'Housewarming', 'Graduation', 'New Job', 'Wedding'],
    'Colleague': ['Birthday', 'Work Anniversary', 'Promotion', 'Farewell', 'Christmas'],
    'Romantic Partner': ['Birthday', 'Anniversary', 'Valentine\'s Day', 'Christmas', 'Just Because'],
    'Other': ['Birthday', 'Christmas', 'Thank You', 'Congratulations', 'Get Well Soon']
  };
  return eventTypes[relationship] || eventTypes['Other'];
};

// Dummy data for initial seeding
export const addDummyData = async (db, userId) => {
  const { collection, addDoc } = await import('firebase/firestore');
  
  const dummyEvents = [
    {
      friendName: 'Sarah Johnson',
      nickname: 'Sarah',
      eventType: 'Birthday',
      eventDate: '2024-07-15',
      relationship: 'Friend',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      personalMessage: 'Happy birthday! Hope your day is filled with joy!',
      polaroidPhotoUrl: '',
      birthday: '1990-07-15',
      anniversary: ''
    },
    {
      friendName: 'Mom',
      nickname: 'Mom',
      eventType: 'Mother\'s Day',
      eventDate: '2024-05-12',
      relationship: 'Family',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      personalMessage: 'Thank you for everything you do. Love you!',
      polaroidPhotoUrl: '',
      birthday: '1965-03-20',
      anniversary: '1988-06-15'
    },
    {
      friendName: 'John Smith',
      nickname: 'Johnny',
      eventType: 'Christmas',
      eventDate: '2024-12-25',
      relationship: 'Colleague',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      personalMessage: '',
      polaroidPhotoUrl: '',
      birthday: '1985-11-30',
      anniversary: ''
    }
  ];

  const eventsCollection = collection(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events');
  
  for (const event of dummyEvents) {
    await addDoc(eventsCollection, event);
  }
};
