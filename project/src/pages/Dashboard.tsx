import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  ArrowRight,
  Bell,
  Trash2,
  MoreVertical,
  Edit
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTripStore, Trip } from '../store/tripStore';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { trips, deleteTrip, getTripsByUser } = useTripStore();
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Get only user's trips (no predefined trips)
  const userTrips = getTripsByUser(user?.id || '');

  const handleDeleteTrip = (tripId: string) => {
    deleteTrip(tripId);
    toast.success('Trip deleted successfully');
    setShowDeleteModal(null);
    setDropdownOpen(null);
  };

  const totalSpent = userTrips.reduce((sum, trip) => sum + trip.totalAmount, 0);
  const activeTrips = userTrips.filter(trip => new Date(trip.endDate) >= new Date()).length;
  const totalTrips = userTrips.length;

  const notifications = [
    {
      id: '1',
      message: 'Welcome to SplitSmart! Create your first trip to get started.',
      type: 'info',
      time: 'Just now'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              Manage your trips and track expenses effortlessly
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Total Spent',
              value: `$${totalSpent.toFixed(2)}`,
              icon: DollarSign,
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            },
            {
              title: 'Active Trips',
              value: activeTrips.toString(),
              icon: MapPin,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100'
            },
            {
              title: 'Total Trips',
              value: totalTrips.toString(),
              icon: Calendar,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trips Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
              <Link
                to="/create-trip"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Trip</span>
              </Link>
            </div>

            <div className="space-y-4">
              {userTrips.length === 0 ? (
                <motion.div
                  className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by creating your first trip to track expenses with friends
                  </p>
                  <Link
                    to="/create-trip"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Your First Trip</span>
                  </Link>
                </motion.div>
              ) : (
                userTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {trip.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{trip.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ${trip.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">Total spent</p>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === trip.id ? null : trip.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {dropdownOpen === trip.id && (
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              <Link
                                to={`/trip/${trip.id}`}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={() => setDropdownOpen(null)}
                              >
                                <Edit className="w-4 h-4" />
                                <span>View/Edit</span>
                              </Link>
                              <button
                                onClick={() => {
                                  setShowDeleteModal(trip.id);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Trip</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{trip.members.length} members</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(trip.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/trip/${trip.id}`}
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm font-medium"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Notifications Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    className="p-3 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <p className="text-sm text-gray-900 mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </motion.div>
                ))}
              </div>

              {notifications.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">Delete Trip</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this trip? This action cannot be undone and will remove all expenses and data associated with this trip.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTrip(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Trip
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;