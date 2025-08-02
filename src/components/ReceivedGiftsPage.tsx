import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit, Trash2, Calendar, User, DollarSign, Heart, Star, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReceivedGift {
  id: string;
  sender_name: string;
  sender_email?: string;
  gift_description: string;
  received_date: string;
  gift_type: string;
  value?: number;
  notes?: string;
  created_at: string;
}

const ReceivedGiftsPage: React.FC = () => {
  const { user } = useAuth();
  const [receivedGifts, setReceivedGifts] = useState<ReceivedGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGift, setEditingGift] = useState<ReceivedGift | null>(null);

  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    gift_description: '',
    received_date: '',
    gift_type: '',
    value: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchReceivedGifts();
    }
  }, [user]);

  const fetchReceivedGifts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('received_gifts')
        .select('*')
        .eq('user_id', user.id)
        .order('received_date', { ascending: false });

      if (error) throw error;
      setReceivedGifts(data || []);
    } catch (error) {
      console.error('Error fetching received gifts:', error);
      setError('Failed to load received gifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const giftData = {
        user_id: user.id,
        sender_name: formData.sender_name,
        sender_email: formData.sender_email || null,
        gift_description: formData.gift_description,
        received_date: formData.received_date,
        gift_type: formData.gift_type,
        value: formData.value ? parseFloat(formData.value) : null,
        notes: formData.notes || null
      };

      if (editingGift) {
        const { error } = await supabase
          .from('received_gifts')
          .update(giftData)
          .eq('id', editingGift.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('received_gifts')
          .insert(giftData);
        
        if (error) throw error;
      }

      setShowAddForm(false);
      setEditingGift(null);
      resetForm();
      fetchReceivedGifts();
    } catch (error) {
      console.error('Error saving received gift:', error);
      setError('Failed to save gift');
    }
  };

  const handleDelete = async (giftId: string) => {
    if (!confirm('Are you sure you want to delete this gift?')) return;

    try {
      const { error } = await supabase
        .from('received_gifts')
        .delete()
        .eq('id', giftId);

      if (error) throw error;
      fetchReceivedGifts();
    } catch (error) {
      console.error('Error deleting gift:', error);
      setError('Failed to delete gift');
    }
  };

  const resetForm = () => {
    setFormData({
      sender_name: '',
      sender_email: '',
      gift_description: '',
      received_date: '',
      gift_type: '',
      value: '',
      notes: ''
    });
  };

  const handleEdit = (gift: ReceivedGift) => {
    setEditingGift(gift);
    setFormData({
      sender_name: gift.sender_name,
      sender_email: gift.sender_email || '',
      gift_description: gift.gift_description,
      received_date: gift.received_date,
      gift_type: gift.gift_type,
      value: gift.value?.toString() || '',
      notes: gift.notes || ''
    });
    setShowAddForm(true);
  };

  const filteredGifts = receivedGifts.filter(gift => {
    const matchesSearch = gift.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.gift_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || gift.gift_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getGiftTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'birthday': return 'bg-pink-100 text-pink-800';
      case 'christmas': return 'bg-green-100 text-green-800';
      case 'anniversary': return 'bg-purple-100 text-purple-800';
      case 'graduation': return 'bg-blue-100 text-blue-800';
      case 'wedding': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Received Gifts</h2>
                <p className="text-blue-100 text-sm">Track gifts you've received from others</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setShowAddForm(true);
                setEditingGift(null);
                resetForm();
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm flex items-center space-x-2 hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Add Gift</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search gifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Birthday">Birthday</option>
              <option value="Christmas">Christmas</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Graduation">Graduation</option>
              <option value="Wedding">Wedding</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="bg-white shadow-xl border border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {editingGift ? 'Edit Received Gift' : 'Add Received Gift'}
            </CardTitle>
            <CardDescription>
              {editingGift ? 'Update the gift details' : 'Record a gift you received'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sender Name *</label>
                  <Input
                    value={formData.sender_name}
                    onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                    placeholder="Who gave you this gift?"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sender Email</label>
                  <Input
                    type="email"
                    value={formData.sender_email}
                    onChange={(e) => setFormData({...formData, sender_email: e.target.value})}
                    placeholder="sender@example.com"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gift Description *</label>
                <Input
                  value={formData.gift_description}
                  onChange={(e) => setFormData({...formData, gift_description: e.target.value})}
                  placeholder="What was the gift?"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Received Date *</label>
                  <Input
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => setFormData({...formData, received_date: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gift Type</label>
                  <select
                    value={formData.gift_type}
                    onChange={(e) => setFormData({...formData, gift_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Christmas">Christmas</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Value ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="0.00"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes about the gift..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingGift ? 'Update Gift' : 'Add Gift'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGift(null);
                    resetForm();
                  }}
                  className="px-6 py-2 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Gifts List */}
      <div className="space-y-4">
        {filteredGifts.length === 0 ? (
          <Card className="bg-white shadow-xl border border-blue-100">
            <CardContent className="p-8 text-center">
              <div className="p-6 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Gift className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No received gifts yet</h3>
              <p className="text-gray-600 mb-4">Start tracking the gifts you receive from others</p>
              <Button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingGift(null);
                  resetForm();
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Gift
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGifts.map((gift) => (
            <Card key={gift.id} className="bg-white shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{gift.sender_name}</h3>
                      {gift.gift_type && (
                        <Badge className={getGiftTypeColor(gift.gift_type)}>
                          {gift.gift_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{gift.gift_description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(gift.received_date).toLocaleDateString()}</span>
                      </div>
                      {gift.value && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${gift.value}</span>
                        </div>
                      )}
                    </div>
                    {gift.notes && (
                      <p className="text-gray-600 text-sm mt-2 italic">"{gift.notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(gift)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(gift.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {receivedGifts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{receivedGifts.length}</p>
                  <p className="text-sm text-blue-700">Total Gifts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    ${receivedGifts.reduce((sum, gift) => sum + (gift.value || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    {new Set(receivedGifts.map(g => g.sender_name)).size}
                  </p>
                  <p className="text-sm text-purple-700">Unique Senders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReceivedGiftsPage; 