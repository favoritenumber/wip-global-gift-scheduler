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
  const eventsRef = collection(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events');
  
  console.log('Adding comprehensive dummy data...');
  
  // Define the 20 people with their details
  const people = [
    { name: 'Priya Patel', nickname: 'Pri', birthday: '1990-03-15', anniversary: '2018-10-26' },
    { name: 'David Chen', nickname: 'Dave', birthday: '1985-07-22', anniversary: '2019-06-01' },
    { name: 'Maria Garcia', nickname: '', birthday: '1992-09-05', anniversary: '' },
    { name: 'John "Sully" Sullivan', nickname: 'Sully', birthday: '1988-01-30', anniversary: '' },
    { name: 'Fatima Al-Jamil', nickname: '', birthday: '1993-11-12', anniversary: '2020-05-20' },
    { name: 'Liam O\'Connell', nickname: '', birthday: '1987-02-08', anniversary: '' },
    { name: 'Chloe Nguyen', nickname: '', birthday: '1991-08-19', anniversary: '2021-09-17' },
    { name: 'Ben Carter', nickname: 'Benny', birthday: '1989-06-04', anniversary: '' },
    { name: 'Sophia Rossi', nickname: 'Soph', birthday: '1994-12-25', anniversary: '' },
    { name: 'Leo Schmidt', nickname: '', birthday: '1986-05-10', anniversary: '2017-07-15' },
    { name: 'Isabella Costa', nickname: 'Bella', birthday: '1990-04-03', anniversary: '' },
    { name: 'Noah Takahashi', nickname: '', birthday: '1992-10-02', anniversary: '' },
    { name: 'Ava Williams', nickname: '', birthday: '1988-07-07', anniversary: '2020-08-08' },
    { name: 'James Kim', nickname: 'Jimmy', birthday: '1991-03-29', anniversary: '' },
    { name: 'Olivia Martinez', nickname: 'Liv', birthday: '1993-06-30', anniversary: '' },
    { name: 'Michael Johnson', nickname: 'Mike', birthday: '', anniversary: '' },
    { name: 'Emma Dubois', nickname: '', birthday: '1989-01-01', anniversary: '2019-12-01' },
    { name: 'William Taylor', nickname: 'Will', birthday: '', anniversary: '2018-11-05' },
    { name: 'Grace Lee', nickname: '', birthday: '1992-08-11', anniversary: '' },
    { name: 'Daniel Abebe', nickname: 'Dan', birthday: '', anniversary: '' }
  ];

  // Define all 45 gifts as specified
  const gifts = [
    { friendName: 'David Chen', eventType: 'Anniversary', eventDate: '2025-06-01', giftType: 'Generous Gesture ($100)', giftStatus: 'delivered' },
    { friendName: 'Ben Carter', eventType: 'Birthday', eventDate: '2025-06-04', giftType: 'Thoughtful Present ($50)', giftStatus: 'scheduled' },
    { friendName: 'Priya Patel', eventType: 'Holiday', eventDate: '2025-06-05', giftType: 'Personal Note and photo ($5)', giftStatus: 'in-progress' },
    { friendName: 'John "Sully" Sullivan', eventType: 'Thank You', eventDate: '2025-06-06', giftType: 'Sweet Something ($25)', giftStatus: 'not-started' },
    { friendName: 'Fatima Al-Jamil', eventType: 'Holiday', eventDate: '2025-06-08', giftType: 'Thoughtful Present ($50)', giftStatus: 'delivered' },
    { friendName: 'Liam O\'Connell', eventType: 'Get Well Soon', eventDate: '2025-06-10', giftType: 'Sweet Something ($25)', giftStatus: 'scheduled' },
    { friendName: 'Chloe Nguyen', eventType: 'Congratulations', eventDate: '2025-06-11', giftType: 'Personal Note and photo ($5)', giftStatus: 'in-progress' },
    { friendName: 'Ben Carter', eventType: 'Holiday', eventDate: '2025-06-12', giftType: 'Thoughtful Present ($50)', giftStatus: 'not-started' },
    { friendName: 'Sophia Rossi', eventType: 'Holiday', eventDate: '2025-06-14', giftType: 'Generous Gesture ($100)', giftStatus: 'delivered' },
    { friendName: 'Dad', eventType: 'Father\'s Day', eventDate: '2025-06-15', giftType: 'Generous Gesture ($100)', giftStatus: 'scheduled' },
    { friendName: 'Isabella Costa', eventType: 'Thank You', eventDate: '2025-06-16', giftType: 'Personal Note and photo ($5)', giftStatus: 'in-progress' },
    { friendName: 'Noah Takahashi', eventType: 'Holiday', eventDate: '2025-06-17', giftType: 'Sweet Something ($25)', giftStatus: 'not-started' },
    { friendName: 'Ava Williams', eventType: 'Congratulations', eventDate: '2025-06-18', giftType: 'Thoughtful Present ($50)', giftStatus: 'delivered' },
    { friendName: 'James Kim', eventType: 'Holiday', eventDate: '2025-06-19', giftType: 'Personal Note and photo ($5)', giftStatus: 'scheduled' },
    { friendName: 'Olivia Martinez', eventType: 'Holiday', eventDate: '2025-06-20', giftType: 'Sweet Something ($25)', giftStatus: 'in-progress' },
    { friendName: 'Michael Johnson', eventType: 'Holiday', eventDate: '2025-06-21', giftType: 'Thoughtful Present ($50)', giftStatus: 'not-started' },
    { friendName: 'Emma Dubois', eventType: 'Holiday', eventDate: '2025-06-22', giftType: 'Personal Note and photo ($5)', giftStatus: 'delivered' },
    { friendName: 'William Taylor', eventType: 'Holiday', eventDate: '2025-06-23', giftType: 'Sweet Something ($25)', giftStatus: 'scheduled' },
    { friendName: 'Grace Lee', eventType: 'Congratulations', eventDate: '2025-06-24', giftType: 'Thoughtful Present ($50)', giftStatus: 'in-progress' },
    { friendName: 'Daniel Abebe', eventType: 'Holiday', eventDate: '2025-06-25', giftType: 'Personal Note and photo ($5)', giftStatus: 'not-started' },
    { friendName: 'Priya Patel', eventType: 'Anniversary', eventDate: '2025-06-26', giftType: 'Generous Gesture ($100)', giftStatus: 'delivered' },
    { friendName: 'David Chen', eventType: 'Thank You', eventDate: '2025-06-27', giftType: 'Sweet Something ($25)', giftStatus: 'scheduled' },
    { friendName: 'Maria Garcia', eventType: 'Holiday', eventDate: '2025-06-28', giftType: 'Thoughtful Present ($50)', giftStatus: 'in-progress' },
    { friendName: 'John "Sully" Sullivan', eventType: 'Holiday', eventDate: '2025-06-29', giftType: 'Personal Note and photo ($5)', giftStatus: 'not-started' },
    { friendName: 'Olivia Martinez', eventType: 'Birthday', eventDate: '2025-06-30', giftType: 'Generous Gesture ($100)', giftStatus: 'delivered' },
    { friendName: 'Fatima Al-Jamil', eventType: 'Thank You', eventDate: '2025-07-01', giftType: 'Sweet Something ($25)', giftStatus: 'scheduled' },
    { friendName: 'Liam O\'Connell', eventType: 'Congratulations', eventDate: '2025-07-02', giftType: 'Thoughtful Present ($50)', giftStatus: 'in-progress' },
    { friendName: 'Chloe Nguyen', eventType: 'Holiday', eventDate: '2025-07-03', giftType: 'Personal Note and photo ($5)', giftStatus: 'not-started' },
    { friendName: 'USA', eventType: 'Independence Day', eventDate: '2025-07-04', giftType: 'Personal Note and photo ($5)', giftStatus: 'delivered' },
    { friendName: 'Ben Carter', eventType: 'Congratulations', eventDate: '2025-07-05', giftType: 'Sweet Something ($25)', giftStatus: 'scheduled' },
    { friendName: 'Sophia Rossi', eventType: 'Thank You', eventDate: '2025-07-06', giftType: 'Thoughtful Present ($50)', giftStatus: 'in-progress' },
    { friendName: 'Ava Williams', eventType: 'Birthday', eventDate: '2025-07-07', giftType: 'Generous Gesture ($100)', giftStatus: 'not-started' },
    { friendName: 'Isabella Costa', eventType: 'Holiday', eventDate: '2025-07-08', giftType: 'Personal Note and photo ($5)', giftStatus: 'delivered' },
    { friendName: 'Noah Takahashi', eventType: 'Congratulations', eventDate: '2025-07-09', giftType: 'Sweet Something ($25)', giftStatus: 'scheduled' },
    { friendName: 'James Kim', eventType: 'Thank You', eventDate: '2025-07-10', giftType: 'Thoughtful Present ($50)', giftStatus: 'in-progress' },
    { friendName: 'Michael Johnson', eventType: 'Holiday', eventDate: '2025-07-11', giftType: 'Personal Note and photo ($5)', giftStatus: 'not-started' },
    { friendName: 'Emma Dubois', eventType: 'Congratulations', eventDate: '2025-07-12', giftType: 'Sweet Something ($25)', giftStatus: 'delivered' },
    { friendName: 'William Taylor', eventType: 'Thank You', eventDate: '2025-07-13', giftType: 'Thoughtful Present ($50)', giftStatus: 'scheduled' },
    { friendName: 'Grace Lee', eventType: 'Holiday', eventDate: '2025-07-14', giftType: 'Personal Note and photo ($5)', giftStatus: 'in-progress' },
    { friendName: 'Leo Schmidt', eventType: 'Anniversary', eventDate: '2025-07-15', giftType: 'Generous Gesture ($100)', giftStatus: 'not-started' },
    { friendName: 'Daniel Abebe', eventType: 'Congratulations', eventDate: '2025-07-16', giftType: 'Sweet Something ($25)', giftStatus: 'delivered' },
    { friendName: 'David Chen', eventType: 'Birthday', eventDate: '2025-07-22', giftType: 'Generous Gesture ($100)', giftStatus: 'scheduled' },
    { friendName: 'Priya Patel', eventType: 'Thank You', eventDate: '2025-07-24', giftType: 'Sweet Something ($25)', giftStatus: 'in-progress' },
    { friendName: 'Maria Garcia', eventType: 'Congratulations', eventDate: '2025-07-28', giftType: 'Thoughtful Present ($50)', giftStatus: 'not-started' },
    { friendName: 'John "Sully" Sullivan', eventType: 'Thank You', eventDate: '2025-07-30', giftType: 'Personal Note and photo ($5)', giftStatus: 'delivered' }
  ];

  // Generate complete address data
  const addresses = [
    { street: '123 Maple St', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA' },
    { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90210', country: 'USA' },
    { street: '789 Pine Rd', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    { street: '321 Elm Dr', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA' },
    { street: '654 Cedar Ln', city: 'Houston', state: 'TX', zipCode: '77001', country: 'USA' },
    { street: '987 Birch St', city: 'Phoenix', state: 'AZ', zipCode: '85001', country: 'USA' },
    { street: '147 Willow Way', city: 'Philadelphia', state: 'PA', zipCode: '19101', country: 'USA' },
    { street: '258 Spruce Ct', city: 'San Antonio', state: 'TX', zipCode: '78201', country: 'USA' },
    { street: '369 Poplar Pl', city: 'San Diego', state: 'CA', zipCode: '92101', country: 'USA' },
    { street: '741 Cherry Ave', city: 'Dallas', state: 'TX', zipCode: '75201', country: 'USA' },
    { street: '852 Ash Blvd', city: 'San Jose', state: 'CA', zipCode: '95101', country: 'USA' },
    { street: '963 Walnut St', city: 'Austin', state: 'TX', zipCode: '73301', country: 'USA' },
    { street: '159 Hickory Rd', city: 'Jacksonville', state: 'FL', zipCode: '32099', country: 'USA' },
    { street: '357 Pecan Dr', city: 'Fort Worth', state: 'TX', zipCode: '76101', country: 'USA' },
    { street: '468 Magnolia Ln', city: 'Columbus', state: 'OH', zipCode: '43085', country: 'USA' },
    { street: '579 Dogwood Way', city: 'Charlotte', state: 'NC', zipCode: '28201', country: 'USA' },
    { street: '680 Sycamore St', city: 'San Francisco', state: 'CA', zipCode: '94103', country: 'USA' },
    { street: '791 Redwood Ave', city: 'Indianapolis', state: 'IN', zipCode: '46201', country: 'USA' },
    { street: '802 Cypress Ct', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'USA' },
    { street: '913 Juniper Pl', city: 'Denver', state: 'CO', zipCode: '80201', country: 'USA' }
  ];

  // Create gift events with full person data
  for (let i = 0; i < gifts.length; i++) {
    const gift = gifts[i];
    const person = people.find(p => p.name === gift.friendName) || { name: gift.friendName, nickname: '', birthday: '', anniversary: '' };
    const address = addresses[i % addresses.length];
    
    const eventData = {
      friendName: gift.friendName,
      nickname: person.nickname,
      birthday: person.birthday,
      anniversary: person.anniversary,
      address: address,
      eventType: gift.eventType,
      eventDate: gift.eventDate,
      giftType: gift.giftType,
      giftStatus: gift.giftStatus,
      personalMessage: getRandomMessage(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await addDoc(eventsRef, eventData);
      console.log(`Added gift event: ${gift.friendName} - ${gift.eventType} on ${gift.eventDate}`);
    } catch (error) {
      console.error('Error adding gift event:', error);
    }
  }

  console.log('Comprehensive dummy data added successfully!');
};

const getRandomMessage = () => {
  const messages = [
    'Hope this brightens your day!',
    'Thinking of you and sending love.',
    'You deserve something special.',
    'A little something to show I care.',
    'Hope you love this as much as I love you!',
    'Sending you warm wishes and good vibes.',
    'You mean the world to me.',
    'Just because you\'re amazing!',
    'Hope this puts a smile on your face.',
    'With all my love and best wishes.'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};
