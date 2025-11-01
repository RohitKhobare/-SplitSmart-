import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  DollarSign,
  Download,
  FileText
} from 'lucide-react';
import { Trip } from '../../store/tripStore';
import { useTripStore } from '../../store/tripStore';
import { exportExpensesToPDF } from '../../utils/pdfExport';
import { sendExpenseDeletedNotification } from '../../utils/emailNotifications';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ExpensesListProps {
  trip: Trip;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ trip }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  const { deleteExpense, updateTrip } = useTripStore();
  const { user } = useAuthStore();

  const categories = ['all', ...new Set(trip.expenses.map(e => e.category))];

  const filteredExpenses = trip.expenses
    .filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const getMemberName = (memberId: string) => {
    return trip.members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const expense = trip.expenses.find(e => e.id === expenseId);
    if (expense) {
      deleteExpense(trip.id, expenseId);
      
      // Update trip total
      const updatedTrip = {
        ...trip,
        totalAmount: trip.totalAmount - expense.amount,
        expenses: trip.expenses.filter(e => e.id !== expenseId)
      };
      updateTrip(updatedTrip);

      // Send email notifications
      const memberEmails = trip.members
        .filter(member => member.id !== user?.id)
        .map(member => member.email);

      if (memberEmails.length > 0) {
        try {
          await sendExpenseDeletedNotification(
            memberEmails,
            trip.name,
            expense.title,
            user?.name || 'Someone'
          );
        } catch (error) {
          console.error('Failed to send deletion notification:', error);
        }
      }
      
      toast.success('Expense deleted successfully');
    }
    setShowDeleteModal(null);
  };

  const handleExportExpenses = () => {
    try {
      exportExpensesToPDF(trip, filteredExpenses);
      toast.success('Expenses exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting expenses:', error);
      toast.error('Failed to export expenses');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExportExpenses}
            disabled={filteredExpenses.length === 0}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export Expenses</span>
          </button>
        </div>
      </motion.div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first expense'}
            </p>
          </motion.div>
        ) : (
          filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {expense.title}
                  </h3>
                  {expense.description && (
                    <p className="text-gray-600 text-sm mb-2">{expense.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Paid by {getMemberName(expense.paidBy)}</span>
                    </div>
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                      {expense.category}
                    </span>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Split {expense.splitAmong.length} ways
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Split among:</p>
                    <div className="flex flex-wrap gap-1">
                      {expense.splitAmong.map(memberId => (
                        <span
                          key={memberId}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {getMemberName(memberId)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              <h3 className="text-xl font-semibold text-gray-900">Delete Expense</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone and all members will be notified.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExpense(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Expense
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExpensesList;