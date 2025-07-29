
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import GiftsOverviewPage from '@/components/GiftsOverviewPage';
import AddEditEventPage from '@/components/AddEditEventPage';
import PeoplePage from '@/components/PeoplePage';
import SettingsPage from '@/components/SettingsPage';
import SupportPage from '@/components/SupportPage';

const Index = () => {
  const { user, isLoaded } = useUser();
  const [currentPage, setCurrentPage] = useState('gifts');
  const [editingEvent, setEditingEvent] = useState(null);
  const [prefillDate, setPrefillDate] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [allPeople, setAllPeople] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user data when authenticated
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);

      // Fetch people
      const { data: people } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      setAllPeople(people || []);

      // Fetch gifts
      const { data: gifts } = await supabase
        .from('gifts')
        .select(`
          *,
          people:recipient_id (
            name,
            nickname
          )
        `)
        .eq('user_id', user.id)
        .order('event_date');
      
      setAllEvents(gifts || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Gift Scheduler...</h2>
          <p className="text-gray-600">Setting up your personalized gifting experience</p>
        </div>
      </div>
    );
  }

  // This component will only render when user is signed in due to App.tsx routing

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setEditingEvent={setEditingEvent}
      />
      
      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          {currentPage === 'gifts' && (
            <GiftsOverviewPage 
              allEvents={allEvents}
              setCurrentPage={setCurrentPage}
              setEditingEvent={setEditingEvent}
              setPrefillDate={setPrefillDate}
              refreshData={fetchUserData}
            />
          )}
          {currentPage === 'people' && (
            <PeoplePage 
              allPeople={allPeople}
              refreshData={fetchUserData}
            />
          )}
          {currentPage === 'settings' && (
            <SettingsPage 
              userProfile={userProfile}
              refreshData={fetchUserData}
            />
          )}
          {currentPage === 'support' && <SupportPage />}
          {currentPage === 'add-event' && (
            <AddEditEventPage 
              editingEvent={editingEvent}
              prefillDate={prefillDate}
              allPeople={allPeople}
              setCurrentPage={setCurrentPage}
              setEditingEvent={setEditingEvent}
              refreshData={fetchUserData}
            />
          )}
        </div>
      </main>
    </div>
  );
};


export default Index;
