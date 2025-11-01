import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Trip } from '../../store/tripStore';

interface TripAnalyticsProps {
  trip: Trip;
}

const TripAnalytics: React.FC<TripAnalyticsProps> = ({ trip }) => {
  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    trip.expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / trip.totalAmount) * 100
    }));
  };

  const getMemberSpending = () => {
    const memberTotals: { [key: string]: number } = {};
    
    trip.expenses.forEach(expense => {
      memberTotals[expense.paidBy] = (memberTotals[expense.paidBy] || 0) + expense.amount;
    });

    return trip.members.map(member => ({
      ...member,
      totalPaid: memberTotals[member.id] || 0,
      percentage: ((memberTotals[member.id] || 0) / trip.totalAmount) * 100
    }));
  };

  const getDailySpending = () => {
    const dailyTotals: { [key: string]: number } = {};
    
    trip.expenses.forEach(expense => {
      const date = expense.date.split('T')[0]; // Get date part only
      dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
    });

    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const categoryData = getCategoryData();
  const memberSpending = getMemberSpending();
  const dailySpending = getDailySpending();

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${(trip.totalAmount / trip.members.length).toFixed(2)}
          </h3>
          <p className="text-gray-600">Per Person</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${Math.max(...trip.expenses.map(e => e.amount)).toFixed(2)}
          </h3>
          <p className="text-gray-600">Largest Expense</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {dailySpending.length}
          </h3>
          <p className="text-gray-600">Active Days</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {categoryData.length}
          </h3>
          <p className="text-gray-600">Categories</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">Spending by Category</h3>
          </div>
          
          <div className="space-y-4">
            {categoryData.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <span className="text-gray-600">${item.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {item.percentage.toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Member Spending */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">Spending by Member</h3>
          </div>
          
          <div className="space-y-4">
            {memberSpending
              .sort((a, b) => b.totalPaid - a.totalPaid)
              .map((member, index) => (
                <div key={member.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                    <span className="text-gray-600">${member.totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${member.percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.percentage.toFixed(1)}% of total
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Daily Spending Chart */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Daily Spending</h3>
        </div>
        
        {dailySpending.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No spending data available</p>
        ) : (
          <div className="space-y-4">
            {dailySpending.map((day, index) => {
              const maxAmount = Math.max(...dailySpending.map(d => d.amount));
              const percentage = (day.amount / maxAmount) * 100;
              
              return (
                <div key={day.date} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-600">${day.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TripAnalytics;