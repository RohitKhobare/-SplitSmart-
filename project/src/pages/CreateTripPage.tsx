import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  MapPin, 
  Users, 
  Calendar, 
  FileText, 
  ArrowLeft, 
  Plus,
  X,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';

interface CreateTripForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface InviteMember {
  email: string;
  name: string;
}

const CreateTripPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<InviteMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTripForm>();
  const navigate = useNavigate();
  const { addTrip } = useTripStore();
  const { user } = useAuthStore();

  const addMember = () => {
    if (newMemberEmail && newMemberName) {
      if (inviteMembers.some(member => member.email === newMemberEmail)) {
        toast.error('Member already added');
        return;
      }
      
      setInviteMembers([...inviteMembers, { 
        email: newMemberEmail, 
        name: newMemberName 
      }]);
      setNewMemberEmail('');
      setNewMemberName('');
    }
  };

  const removeMember = (email: string) => {
    setInviteMembers(inviteMembers.filter(member => member.email !== email));
  };

  const onSubmit = async (data: CreateTripForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTrip = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        members: [
          {
            id: user?.id || '1',
            name: user?.name || 'You',
            email: user?.email || 'you@example.com',
            isAdmin: true
          },
          ...inviteMembers.map((member, index) => ({
            id: `member-${index}`,
            name: member.name,
            email: member.email,
            isAdmin: false
          }))
        ],
        expenses: [],
        totalAmount: 0,
        createdBy: user?.id || '1',
        createdAt: new Date().toISOString()
      };

      addTrip(newTrip);
      toast.success('Trip created successfully!');
      navigate(`/trip/${newTrip.id}`);
    } catch (error) {
      toast.error('Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Trip</h1>
          <p className="text-gray-600">
            Set up a new trip and invite friends to start tracking expenses together
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Trip Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Trip Details</h2>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Name *
                </label>
                <input
                  {...register('name', { required: 'Trip name is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., Europe Adventure 2024"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Tell us about your trip..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    {...register('startDate', { required: 'Start date is required' })}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    {...register('endDate', { required: 'End date is required' })}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invite Members */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Invite Members</h2>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Member name"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Email address"
                    />
                    <button
                      type="button"
                      onClick={addMember}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {inviteMembers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Invited Members:</p>
                    {inviteMembers.map((member) => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(member.email)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  Members will receive email invitations to join your trip
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Create Trip</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTripPage;