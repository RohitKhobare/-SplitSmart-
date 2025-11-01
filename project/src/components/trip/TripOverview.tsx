import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  FileText
} from 'lucide-react';
import { Trip } from '../../store/tripStore';
import { exportTripToPDF } from '../../utils/pdfExport';
import toast from 'react-hot-toast';

interface TripOverviewProps {
  trip: Trip;
}

const TripOverview: React.FC<TripOverviewProps> = ({ trip }) => {
  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    
    // Initialize balances
    trip.members.forEach(member => {
      balances[member.id] = 0;
    });

    // Calculate what each person paid vs what they owe
    trip.expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitAmong.length;
      
      // Person who paid gets credited
      balances[expense.paidBy] += expense.amount;
      
      // Everyone who shares the expense gets debited
      expense.splitAmong.forEach(memberId => {
        balances[memberId] -= splitAmount;
      });
    });

    return balances;
  };

  const handleExportPDF = () => {
    try {
      exportTripToPDF(trip);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const balances = calculateBalances();
  const totalExpenses = trip.expenses.length;
  const averageExpense = totalExpenses > 0 ? trip.totalAmount / totalExpenses : 0;

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={handleExportPDF}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF Report</span>
        </button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${trip.totalAmount.toFixed(2)}
          </h3>
          <p className="text-gray-600">Total Spent</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {trip.members.length}
          </h3>
          <p className="text-gray-600">Members</p>
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
            {totalExpenses}
          </h3>
          <p className="text-gray-600">Expenses</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${averageExpense.toFixed(2)}
          </h3>
          <p className="text-gray-600">Avg. Expense</p>
        </motion.div>
      </div>

      {/* Balances */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Member Balances</h3>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Export Details</span>
          </button>
        </div>
        <div className="space-y-3">
          {trip.members.map((member) => {
            const balance = balances[member.id];
            const isPositive = balance > 0;
            const isZero = Math.abs(balance) < 0.01;
            
            return (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isZero ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className={`w-5 h-5 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
                  )}
                  <span className={`font-semibold ${
                    isZero ? 'text-green-600' : isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isZero ? 'Settled' : `${isPositive ? '+' : ''}$${balance.toFixed(2)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Expenses */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        {trip.expenses.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No expenses added yet</p>
            <p className="text-sm text-gray-400 mt-2">Start by adding your first expense to track spending</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trip.expenses.slice(-5).reverse().map((expense) => {
              const paidByMember = trip.members.find(m => m.id === expense.paidBy);
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{expense.title}</p>
                    <p className="text-sm text-gray-500">
                      Paid by {paidByMember?.name} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{expense.category}</p>
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

export default TripOverview;