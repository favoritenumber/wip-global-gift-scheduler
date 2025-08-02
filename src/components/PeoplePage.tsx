import React, { useState } from 'react';
import { User as UserIcon, CheckCircle, XCircle, Plus, Search, Filter } from 'lucide-react';
import AddPersonModal from './AddPersonModal';
import PersonSummaryModal from './PersonSummaryModal';

interface PeoplePageProps {
  allPeople: any[];
  refreshData: () => void;
}

const PeoplePage: React.FC<PeoplePageProps> = ({ allPeople, refreshData }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const filteredPeople = allPeople.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.nickname && person.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl mt-8 overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">People</h2>
                <p className="text-blue-100 text-sm">Manage your gift recipients</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Person</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search people by name or nickname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nickname
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Birthday
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Anniversary
                </th>
                <th className="px-8 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Gifts Scheduled
                </th>
                <th className="px-8 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Address on File
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">No people found</h3>
                        <p className="text-gray-500">
                          {searchTerm ? 'Try adjusting your search terms' : 'Add your first person to get started'}
                        </p>
                      </div>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Add Your First Person</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPerson(person)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                      >
                        {person.name}
                      </button>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {person.nickname || <span className="text-gray-400 italic">N/A</span>}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {person.birthday ? formatDate(person.birthday) : <span className="text-gray-400 italic">N/A</span>}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {person.anniversary ? formatDate(person.anniversary) : <span className="text-gray-400 italic">N/A</span>}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {person.gifts_count || 0} gifts
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-center">
                      {person.address ? (
                        <CheckCircle size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <XCircle size={20} className="text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredPeople.length > 0 && (
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredPeople.length} of {allPeople.length} people</span>
              <span>Click on a name to view details</span>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddPersonModal onClose={() => setShowAddModal(false)} refreshData={refreshData} />}
      {selectedPerson && <PersonSummaryModal person={selectedPerson} onClose={() => setSelectedPerson(null)} refreshData={refreshData} />}
    </>
  );
};

export default PeoplePage; 