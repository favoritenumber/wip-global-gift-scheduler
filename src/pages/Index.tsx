
import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';
import { addDummyData } from '../utils/helpers';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import Header from '../components/Header';
import GiftsOverviewPage from '../components/GiftsOverviewPage';
import AddEditEventPage from '../components/AddEditEventPage';
import PeoplePage from '../components/PeoplePage';
import SettingsPage from '../components/SettingsPage';
import SupportPage from '../components/SupportPage';

const Index = () => {
  // Core app state
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('gifts');
  const [editingEvent, setEditingEvent] = useState(null);
  const [prefillDate, setPrefillDate] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [userSettings, setUserSettings] = useState({
    senderName: 'John Doe',
    defaultSignature: 'With love ❤️',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    notifications: {
      email: true,
      sms: true,
      reminders: true
    },
    giftDefaults: {
      defaultGiftType: 'Personal Note and photo ($5)',
      defaultMessage: 'Hope this brightens your day!',
      autoRecurring: false
    }
  });

  // Firebase auth setup
  useEffect(() => {
    console.log('Setting up Firebase auth...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        console.log('No user, signing in anonymously...');
        try {
          const result = await signInAnonymously(auth);
          console.log('Anonymous sign-in successful:', result.user.uid);
          setUserId(result.user.uid);
          setIsAuthReady(true);
        } catch (error) {
          console.error('Error signing in anonymously:', error);
          setIsAuthReady(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Data fetching setup
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up Firestore listener for user:', userId);
    
    const eventsRef = collection(db, 'artifacts', 'gift-scheduler-app', 'users', userId, 'events');
    const q = query(eventsRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('Firestore snapshot received, documents:', snapshot.size);
      
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAllEvents(events);

      // Add dummy data if collection is empty
      if (events.length === 0) {
        console.log('No events found, adding dummy data...');
        try {
          await addDummyData(db, userId);
          console.log('Dummy data added successfully');
        } catch (error) {
          console.error('Error adding dummy data:', error);
        }
      }
    }, (error) => {
      console.error('Error listening to events:', error);
    });

    return () => unsubscribe();
  }, [userId]);

  // Firebase context value
  const firebaseContextValue = {
    db,
    auth,
    userId,
    allEvents,
    userSettings,
    setUserSettings,
    currentPage,
    setCurrentPage,
    editingEvent,
    setEditingEvent,
    prefillDate,
    setPrefillDate
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Global Gift Scheduler...</h2>
          <p className="text-gray-600">Setting up your personalized gifting experience</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider value={firebaseContextValue}>
      <div className="min-h-screen bg-white">
        <Header 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setEditingEvent={setEditingEvent}
        />
        
        <main>
          {currentPage === 'gifts' && <GiftsOverviewPage />}
          {currentPage === 'people' && <PeoplePage />}
          {currentPage === 'settings' && <SettingsPage />}
          {currentPage === 'support' && <SupportPage />}
          {currentPage === 'add-event' && <AddEditEventPage />}
        </main>
      </div>
    </FirebaseProvider>
  );
};

export default Index;
