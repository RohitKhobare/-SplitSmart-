import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  MoreVertical,
  Shield,
  UserMinus,
  Copy,
  Check
} from 'lucide-react';
import { Trip } from '../../store/tripStore';
import toast from 'react-hot-toast';

interface TripMembersProps {
  trip: Trip;
}

const TripMembers: React.FC<TripMembersProps> = ({ trip }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteLink = `${window.location.origin}/join/${trip.id}`;

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteName('');
      setShowInviteModal(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      toast.success('Invite link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const calculateMemberBalance = (memberId: string) => {
    let balance = 0;
    
    trip.expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitAmong.length;
      
      // If this member paid, they get credited
      if (expense.paidBy === memberId) {
        balance += expense.amount;
      }
      
      // If this member is part of the split, they get debited
      if (expense.splitAmong.includes(memberId)) {
        balance -= splitAmount;
      }
    });
    
    return balance;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">Trip Members</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {trip.members.length}
            </span>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Invite Link */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Share invite link:</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={copyInviteLink}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Members List */}
      <div className="space-y-4">
        {trip.members.map((member, index) => {
          const balance = calculateMemberBalance(member.id);
          const isPositive = balance > 0;
          const isZero = Math.abs(balance) < 0.01;
          
          return (
            <motion.div
              key={member.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {member.isAdmin && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      {member.isAdmin && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isZero ? 'text-green-600' : isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isZero ? 'Settled' : `${isPositive ? '+' : ''}$${balance.toFixed(2)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isZero ? 'All settled up' : isPositive ? 'Gets back' : 'Owes'}
                    </p>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Member Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {trip.expenses.filter(e => e.paidBy === member.id).length}
                    </p>
                    <p className="text-sm text-gray-500">Expenses Paid</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      ${trip.expenses
                        .filter(e => e.paidBy === member.id)
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Total Paid</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {trip.expenses.filter(e => e.splitAmong.includes(member.id)).length}
                    </p>
                    <p className="text-sm text-gray-500">Shared Expenses</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Invite Member</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter member's name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TripMembers;