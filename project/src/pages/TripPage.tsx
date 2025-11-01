import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  PlusCircle, 
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Share2
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import TripOverview from '../components/trip/TripOverview';
import ExpensesList from '../components/trip/ExpensesList';
import TripAnalytics from '../components/trip/TripAnalytics';
import TripMembers from '../components/trip/TripMembers';
import AddExpenseModal from '../components/trip/AddExpenseModal';

const TripPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, setCurrentTrip, currentTrip } = useTripStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    const trip = trips.find(t => t.id === id);
    if (trip) {
      setCurrentTrip(trip);
    } else {
      navigate('/dashboard');
    }
  }, [id, trips, setCurrentTrip, navigate]);

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'expenses', name: 'Expenses', icon: DollarSign },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'members', name: 'Members', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentTrip.name}
                </h1>
                <p className="text-gray-600">{currentTrip.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{currentTrip.members.length} members</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button 
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <TripOverview trip={currentTrip} />}
          {activeTab === 'expenses' && <ExpensesList trip={currentTrip} />}
          {activeTab === 'analytics' && <TripAnalytics trip={currentTrip} />}
          {activeTab === 'members' && <TripMembers trip={currentTrip} />}
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          trip={currentTrip}
          onClose={() => setShowAddExpense(false)}
        />
      )}
    </div>
  );
};

export default TripPage;