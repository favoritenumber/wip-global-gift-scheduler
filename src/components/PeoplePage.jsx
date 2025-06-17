
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Calendar, MapPin, Plus } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import PersonSummaryModal from './PersonSummaryModal';

const PeoplePage = () => {
  const { allEvents } = useFirebase();
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            People Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your gift recipients and their information</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <User className="h-5 w-5" />
            <span className="font-semibold">{people.length} People</span>
          </div>
        </div>
      </div>

      {/* People Table */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Nickname
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Birthday
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Anniversary
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Gifts Scheduled
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Address on File
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {people.map((person, index) => (
                <tr 
                  key={person.name} 
                  className="hover:bg-purple-25 transition-colors cursor-pointer"
                  onClick={() => handlePersonClick(person)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {person.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors">
                          {person.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {person.nickname || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {person.birthday ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{new Date(person.birthday).toLocaleDateString()}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {person.anniversary ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-pink-500" />
                        <span>{new Date(person.anniversary).toLocaleDateString()}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
                      {person.giftsScheduled} {person.giftsScheduled === 1 ? 'gift' : 'gifts'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {hasCompleteAddress(person.address) ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-red-500">
                          <XCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Incomplete</span>
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
              <p className="text-gray-500 text-lg">No people found.</p>
              <p className="text-gray-400">Start by adding some gifts to see people here.</p>
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
    </div>
  );
};

export default PeoplePage;
