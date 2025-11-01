// Email notification utility functions
// In a real application, these would make API calls to your backend

export interface EmailNotification {
  to: string[];
  subject: string;
  message: string;
  tripName: string;
  expenseDetails?: {
    title: string;
    amount: number;
    paidBy: string;
    category: string;
    date: string;
  };
}

export const sendExpenseAddedNotification = async (
  memberEmails: string[],
  tripName: string,
  expenseDetails: {
    title: string;
    amount: number;
    paidBy: string;
    category: string;
    date: string;
  },
  addedBy: string
): Promise<boolean> => {
  try {
    // Simulate API call to backend email service
    console.log('Sending expense added notification:', {
      to: memberEmails,
      subject: `New expense added to ${tripName}`,
      message: `${addedBy} added a new expense "${expenseDetails.title}" for $${expenseDetails.amount.toFixed(2)} to your trip "${tripName}".`,
      expenseDetails
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would be:
    // const response = await fetch('/api/notifications/expense-added', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     memberEmails,
    //     tripName,
    //     expenseDetails,
    //     addedBy
    //   })
    // });
    // return response.ok;

    return true; // Simulate success
  } catch (error) {
    console.error('Failed to send expense notification:', error);
    return false;
  }
};

export const sendExpenseUpdatedNotification = async (
  memberEmails: string[],
  tripName: string,
  expenseDetails: {
    title: string;
    amount: number;
    paidBy: string;
    category: string;
    date: string;
  },
  updatedBy: string
): Promise<boolean> => {
  try {
    console.log('Sending expense updated notification:', {
      to: memberEmails,
      subject: `Expense updated in ${tripName}`,
      message: `${updatedBy} updated the expense "${expenseDetails.title}" in your trip "${tripName}".`,
      expenseDetails
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error('Failed to send expense update notification:', error);
    return false;
  }
};

export const sendExpenseDeletedNotification = async (
  memberEmails: string[],
  tripName: string,
  expenseTitle: string,
  deletedBy: string
): Promise<boolean> => {
  try {
    console.log('Sending expense deleted notification:', {
      to: memberEmails,
      subject: `Expense deleted from ${tripName}`,
      message: `${deletedBy} deleted the expense "${expenseTitle}" from your trip "${tripName}".`,
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error('Failed to send expense deletion notification:', error);
    return false;
  }
};

export const sendTripInviteNotification = async (
  email: string,
  tripName: string,
  invitedBy: string,
  inviteLink: string
): Promise<boolean> => {
  try {
    console.log('Sending trip invite notification:', {
      to: [email],
      subject: `You're invited to join ${tripName}`,
      message: `${invitedBy} has invited you to join the trip "${tripName}". Click the link to join: ${inviteLink}`,
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error('Failed to send trip invite notification:', error);
    return false;
  }
};

// Real-time notification simulation
export const simulateRealTimeNotification = (message: string) => {
  // In a real app, this would use WebSocket or Server-Sent Events
  console.log('Real-time notification:', message);
  
  // You could integrate with browser notifications here
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('SplitSmart', {
      body: message,
      icon: '/favicon.ico'
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};