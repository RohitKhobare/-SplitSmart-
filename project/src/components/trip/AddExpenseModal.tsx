import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  X, 
  DollarSign, 
  FileText, 
  Calendar, 
  Users,
  Camera,
  Save
} from 'lucide-react';
import { Trip } from '../../store/tripStore';
import { useTripStore } from '../../store/tripStore';
import { useAuthStore } from '../../store/authStore';
import { sendExpenseAddedNotification } from '../../utils/emailNotifications';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  trip: Trip;
  onClose: () => void;
}

interface ExpenseForm {
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  paidBy: string;
  splitType: 'equal' | 'custom';
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ trip, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(trip.members.map(m => m.id));
  const [customSplits, setCustomSplits] = useState<{ [key: string]: number }>({});
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ExpenseForm>({
    defaultValues: {
      paidBy: trip.members[0]?.id || '',
      splitType: 'equal',
      date: new Date().toISOString().split('T')[0],
      category: 'Food'
    }
  });

  const { addExpense, updateTrip } = useTripStore();
  const { user } = useAuthStore();

  const splitType = watch('splitType');
  const amount = watch('amount') || 0;

  const categories = [
    'Food', 'Accommodation', 'Transportation', 'Entertainment', 
    'Shopping', 'Activities', 'Utilities', 'Other'
  ];

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const updateCustomSplit = (memberId: string, value: number) => {
    setCustomSplits(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  const onSubmit = async (data: ExpenseForm) => {
    try {
      if (selectedMembers.length === 0) {
        toast.error('Please select at least one member to split with');
        return;
      }

      if (splitType === 'custom') {
        const totalCustom = selectedMembers.reduce((sum, id) => sum + (customSplits[id] || 0), 0);
        if (Math.abs(totalCustom - data.amount) > 0.01) {
          toast.error('Custom split amounts must equal the total expense amount');
          return;
        }
      }

      setIsLoading(true);
      
      const newExpense = {
        id: Date.now().toString(),
        title: data.title,
        amount: Number(data.amount),
        paidBy: data.paidBy,
        splitAmong: selectedMembers,
        category: data.category,
        date: data.date,
        description: data.description || ''
      };

      // Add expense to store
      addExpense(trip.id, newExpense);
      
      // Update trip total
      const updatedTrip = {
        ...trip,
        totalAmount: trip.totalAmount + Number(data.amount),
        expenses: [...trip.expenses, newExpense]
      };
      updateTrip(updatedTrip);

      // Send email notifications to all members except the one who added the expense
      const memberEmails = trip.members
        .filter(member => member.id !== user?.id)
        .map(member => member.email);

      const paidByMember = trip.members.find(m => m.id === data.paidBy);
      
      if (memberEmails.length > 0) {
        try {
          await sendExpenseAddedNotification(
            memberEmails,
            trip.name,
            {
              title: data.title,
              amount: Number(data.amount),
              paidBy: paidByMember?.name || 'Unknown',
              category: data.category,
              date: data.date
            },
            user?.name || 'Someone'
          );
          
          toast.success('Expense added and notifications sent!');
        } catch (error) {
          toast.success('Expense added successfully!');
          toast.error('Failed to send email notifications');
        }
      } else {
        toast.success('Expense added successfully!');
      }

      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dinner at restaurant"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' },
                      valueAsNumber: true
                    })}
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('date', { required: 'Date is required' })}
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional details..."
              />
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid By
              </label>
              <select
                {...register('paidBy', { required: 'Please select who paid' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {trip.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.id === user?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
              {errors.paidBy && (
                <p className="mt-1 text-sm text-red-600">{errors.paidBy.message}</p>
              )}
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    {...register('splitType')}
                    type="radio"
                    value="equal"
                    className="mr-2"
                  />
                  <span>Split Equally</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('splitType')}
                    type="radio"
                    value="custom"
                    className="mr-2"
                  />
                  <span>Custom Split</span>
                </label>
              </div>
            </div>

            {/* Split Among */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Among ({selectedMembers.length} selected)
              </label>
              <div className="space-y-2">
                {trip.members.map(member => {
                  const isSelected = selectedMembers.includes(member.id);
                  const equalShare = amount && selectedMembers.length > 0 ? amount / selectedMembers.length : 0;
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMember(member.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          {splitType === 'equal' ? (
                            <span className="text-gray-600">${equalShare.toFixed(2)}</span>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <input
                                type="number"
                                step="0.01"
                                value={customSplits[member.id] || ''}
                                onChange={(e) => updateCustomSplit(member.id, parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedMembers.length === 0 && (
                <p className="mt-1 text-sm text-red-600">Please select at least one member</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || selectedMembers.length === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Adding...' : 'Add Expense'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddExpenseModal;