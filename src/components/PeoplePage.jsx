
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Calendar, MapPin, Plus } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import PersonSummaryModal from './PersonSummaryModal';
import AddPersonModal from './AddPersonModal';

const PeoplePage = () => {
  const { allEvents } = useFirebase();
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);

  // Aggregate people data from events
  useEffect(() => {
    const peopleMap = new Map();
    
    allEvents.forEach(event => {
      const name = event.friendName;
      if (!name) return;
      
      if (peopleMap.has(name)) {
        const person = peopleMap.get(name);
        person.events.push(event);
        person.giftsScheduled = person.events.length;
        
        // Update with most recent data
        if (event.birthday && !person.birthday) person.birthday = event.birthday;
        if (event.anniversary && !person.anniversary) person.anniversary = event.anniversary;
        if (event.address?.street && !person.address?.street) person.address = event.address;
        if (event.nickname && !person.nickname) person.nickname = event.nickname;
      } else {
        peopleMap.set(name, {
          name,
          nickname: event.nickname || '',
          birthday: event.birthday || '',
          anniversary: event.anniversary || '',
          address: event.address || { street: '', city: '', state: '', zipCode: '', country: 'USA' },
          giftsScheduled: 1,
          events: [event]
        });
      }
    });
    
    setPeople(Array.from(peopleMap.values()));
  }, [allEvents]);

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  const hasCompleteAddress = (address) => {
    return address && address.street && address.city && address.state && address.zipCode;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">
            People Management
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            {people.length} people • Manage your gift recipients and their information
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="font-semibold">{people.length} People</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddPersonModal(true)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-lg border border-gray-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Person</span>
          </button>
        </div>
      </div>

      {/* People Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300">
                  Nickname
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300">
                  Birthday
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300">
                  Anniversary
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300">
                  Gifts Scheduled
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300">
                  Address on File
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {people.map((person, index) => (
                <tr 
                  key={person.name} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handlePersonClick(person)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                        {person.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors">
                          {person.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {person.nickname || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {person.birthday ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{new Date(person.birthday).toLocaleDateString()}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {person.anniversary ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{new Date(person.anniversary).toLocaleDateString()}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-sm font-bold rounded-full bg-gray-100 text-gray-900 border border-gray-300">
                      {person.giftsScheduled} {person.giftsScheduled === 1 ? 'gift' : 'gifts'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {hasCompleteAddress(person.address) ? (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-bold">Complete</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <XCircle className="h-5 w-5" />
                          <span className="text-sm font-bold">Incomplete</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {people.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No people found.</p>
              <p className="text-gray-400">Start by adding some people or gifts to see them here.</p>
              <button
                onClick={() => setShowAddPersonModal(true)}
                className="mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Person</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Person Summary Modal */}
      {showModal && selectedPerson && (
        <PersonSummaryModal
          person={selectedPerson}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={showAddPersonModal}
        onClose={() => setShowAddPersonModal(false)}
      />
    </div>
  );
};

export default PeoplePage;
