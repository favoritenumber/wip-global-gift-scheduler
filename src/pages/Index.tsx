
import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';
import { addDummyData } from '../utils/helpers';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import Header from '../components/Header';
import GiftsOverviewPage from '../components/GiftsOverviewPage';

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
    defaultSignature: 'With love ❤️'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Gift Scheduler...</h2>
          <p className="text-gray-600 mt-2">Setting up your personalized experience</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider value={firebaseContextValue}>
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setEditingEvent={setEditingEvent}
        />
        
        <main>
          {currentPage === 'gifts' && <GiftsOverviewPage />}
          {currentPage === 'people' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">People Management</h1>
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <p className="text-gray-600">People management coming soon...</p>
              </div>
            </div>
          )}
          {currentPage === 'settings' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <p className="text-gray-600">Settings page coming soon...</p>
              </div>
            </div>
          )}
          {currentPage === 'support' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Support & FAQ</h1>
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <p className="text-gray-600">Support page coming soon...</p>
              </div>
            </div>
          )}
          {currentPage === 'add-event' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {editingEvent ? 'Edit Gift' : 'Add New Gift'}
              </h1>
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <p className="text-gray-600">Add/Edit gift form coming soon...</p>
                <button
                  onClick={() => setCurrentPage('gifts')}
                  className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Back to Gifts
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </FirebaseProvider>
  );
};

export default Index;
