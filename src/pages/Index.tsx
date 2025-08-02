
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import GiftsOverviewPage from '@/components/GiftsOverviewPage';
import AddEditEventPage from '@/components/AddEditEventPage';
import PeoplePage from '@/components/PeoplePage';
import SettingsPage from '@/components/SettingsPage';
import SupportPage from '@/components/SupportPage';
import ReceivedGiftsPage from '@/components/ReceivedGiftsPage';
import AIFeatures from '@/components/AIFeatures';
import AIMessageGenerator from '@/components/AIMessageGenerator';
import BulkUploadPage from '@/components/BulkUploadPage';
import ChatPopup from '@/components/ChatPopup';

const Index = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('gifts');
  const [editingEvent, setEditingEvent] = useState(null);
  const [prefillDate, setPrefillDate] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [allPeople, setAllPeople] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data when authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user.id);
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user data for Supabase user ID:', user.id);
      
      // First, ensure user profile exists
      await ensureUserProfile();
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to load user profile. Database might not be configured.');
        return;
      }
      
      console.log('User profile loaded:', profile);
      setUserProfile(profile);

      // Fetch people
      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (peopleError) {
        console.error('Error fetching people:', peopleError);
        // Don't fail completely, just log the error and continue with empty people
        console.log('Continuing with empty people list');
        setAllPeople([]);
      } else {
        console.log('People loaded:', people);
        setAllPeople(people || []);
      }

      // Fetch gifts
      const { data: gifts, error: giftsError } = await supabase
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
      
      if (giftsError) {
        console.error('Error fetching gifts:', giftsError);
        // Don't fail completely, just log the error and continue with empty gifts
        console.log('Continuing with empty gifts list');
        setAllEvents([]);
      } else {
        console.log('Gifts loaded:', gifts);
        setAllEvents(gifts || []);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const ensureUserProfile = async () => {
    if (!user) return;
    
    try {
      // Check if profile exists
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') { // PGRST116 means "not found"
        console.log('Creating user profile for Supabase user');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email,
            email: user.email
          });
        
        if (insertError) {
          throw insertError;
        }
        console.log('User profile created successfully.');
      } else if (checkError) {
        throw checkError;
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      setError(`Failed to ensure user profile: ${error.message}`);
    }
  };

  const handleAIGiftSelection = (giftData: any) => {
    setEditingEvent(null);
    setPrefillDate(giftData.event_date || '');
    setCurrentPage('add-event');
    // You could also pre-populate the form with the gift data
  };

  const handleAIMessageSelection = (message: string) => {
    // This will be handled in the AddEditEventPage component
    console.log('AI message selected:', message);
  };

  if (!user) {
    return null; // AuthPage will handle unauthenticated state
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        setEditingEvent={setEditingEvent}
      />
      
      <main className="container mx-auto p-4 max-w-7xl">
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl mt-8 border border-blue-100">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-ping opacity-20"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Your Gift Scheduler...</h2>
              <p className="text-gray-600 mb-4">Setting up your personalized gifting experience</p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl relative mt-8 shadow-lg" role="alert">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <p className="text-sm mt-2 text-red-600">Please try refreshing the page or contact support if the issue persists.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentPage === 'gifts' && (
              <div className="space-y-8">
                <GiftsOverviewPage
                  allEvents={allEvents}
                  setCurrentPage={setCurrentPage}
                  setEditingEvent={setEditingEvent}
                  setPrefillDate={setPrefillDate}
                  refreshData={fetchUserData}
                />
                
                {/* AI Features Section */}
                <AIFeatures
                  allPeople={allPeople}
                  allEvents={allEvents}
                  onSelectGift={handleAIGiftSelection}
                />
              </div>
            )}
            
            {currentPage === 'add-event' && (
              <AddEditEventPage
                editingEvent={editingEvent}
                setEditingEvent={setEditingEvent}
                prefillDate={prefillDate}
                setPrefillDate={setPrefillDate}
                setCurrentPage={setCurrentPage}
                allPeople={allPeople}
                refreshData={fetchUserData}
              />
            )}
            
            {currentPage === 'people' && (
              <PeoplePage
                allPeople={allPeople}
                refreshData={fetchUserData}
              />
            )}
            
            {currentPage === 'received-gifts' && (
              <ReceivedGiftsPage />
            )}
            
            {currentPage === 'settings' && (
              <SettingsPage
                userProfile={userProfile}
                refreshData={fetchUserData}
              />
            )}
            
            {currentPage === 'support' && (
              <SupportPage />
            )}

            {currentPage === 'bulk-upload' && (
              <BulkUploadPage />
            )}
          </>
        )}
      </main>
      <ChatPopup />
    </div>
  );
};

export default Index;
