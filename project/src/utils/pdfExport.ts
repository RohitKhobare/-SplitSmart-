import jsPDF from 'jspdf';
import { Trip } from '../store/tripStore';

export const exportTripToPDF = (trip: Trip) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    } else {
      doc.text(text, x, y);
      return y + (fontSize * 0.4);
    }
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Expense Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Trip Details
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  yPosition = addText(`${trip.name}`, 20, yPosition, undefined, 18);
  yPosition += 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  yPosition = addText(`Description: ${trip.description || 'No description'}`, 20, yPosition);
  yPosition = addText(`Duration: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`, 20, yPosition);
  yPosition = addText(`Total Amount: $${trip.totalAmount.toFixed(2)}`, 20, yPosition);
  yPosition = addText(`Members: ${trip.members.length}`, 20, yPosition);
  yPosition += 10;

  // Members Section
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('Trip Members', 20, yPosition, undefined, 16);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  trip.members.forEach((member, index) => {
    checkNewPage(15);
    const memberText = `${index + 1}. ${member.name} (${member.email})${member.isAdmin ? ' - Admin' : ''}`;
    yPosition = addText(memberText, 25, yPosition);
  });
  yPosition += 10;

  // Calculate balances
  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    
    trip.members.forEach(member => {
      balances[member.id] = 0;
    });

    trip.expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitAmong.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitAmong.forEach(memberId => {
        balances[memberId] -= splitAmount;
      });
    });

    return balances;
  };

  const balances = calculateBalances();

  // Balances Section
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('Member Balances', 20, yPosition, undefined, 16);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  trip.members.forEach(member => {
    checkNewPage(15);
    const balance = balances[member.id];
    const balanceText = Math.abs(balance) < 0.01 ? 'Settled' : 
                       balance > 0 ? `Gets back $${balance.toFixed(2)}` : 
                       `Owes $${Math.abs(balance).toFixed(2)}`;
    yPosition = addText(`${member.name}: ${balanceText}`, 25, yPosition);
  });
  yPosition += 10;

  // Expenses Section
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('Expense Details', 20, yPosition, undefined, 16);
  yPosition += 5;

  if (trip.expenses.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addText('No expenses recorded for this trip.', 25, yPosition);
  } else {
    trip.expenses.forEach((expense, index) => {
      checkNewPage(40);
      
      // Expense header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(`${index + 1}. ${expense.title}`, 25, yPosition, undefined, 12);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Expense details
      yPosition = addText(`Amount: $${expense.amount.toFixed(2)}`, 30, yPosition);
      yPosition = addText(`Category: ${expense.category}`, 30, yPosition);
      yPosition = addText(`Date: ${new Date(expense.date).toLocaleDateString()}`, 30, yPosition);
      
      const paidByMember = trip.members.find(m => m.id === expense.paidBy);
      yPosition = addText(`Paid by: ${paidByMember?.name || 'Unknown'}`, 30, yPosition);
      
      const splitMembers = expense.splitAmong.map(id => 
        trip.members.find(m => m.id === id)?.name || 'Unknown'
      ).join(', ');
      yPosition = addText(`Split among: ${splitMembers}`, 30, yPosition);
      
      if (expense.description) {
        yPosition = addText(`Description: ${expense.description}`, 30, yPosition, pageWidth - 50);
      }
      
      yPosition += 5;
    });
  }

  // Summary Section
  checkNewPage(60);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('Trip Summary', 20, yPosition, undefined, 16);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const totalExpenses = trip.expenses.length;
  const averageExpense = totalExpenses > 0 ? trip.totalAmount / totalExpenses : 0;
  const perPersonAverage = trip.totalAmount / trip.members.length;

  yPosition = addText(`Total Expenses: ${totalExpenses}`, 25, yPosition);
  yPosition = addText(`Total Amount: $${trip.totalAmount.toFixed(2)}`, 25, yPosition);
  yPosition = addText(`Average per Expense: $${averageExpense.toFixed(2)}`, 25, yPosition);
  yPosition = addText(`Average per Person: $${perPersonAverage.toFixed(2)}`, 25, yPosition);

  // Category breakdown
  const categoryTotals: { [key: string]: number } = {};
  trip.expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  if (Object.keys(categoryTotals).length > 0) {
    yPosition += 10;
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Spending by Category', 25, yPosition, undefined, 14);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      checkNewPage(15);
      const percentage = (amount / trip.totalAmount) * 100;
      yPosition = addText(`${category}: $${amount.toFixed(2)} (${percentage.toFixed(1)}%)`, 30, yPosition);
    });
  }

  // Footer
  const now = new Date();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Powered by SplitSmart', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Save the PDF
  const fileName = `${trip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_expense_report.pdf`;
  doc.save(fileName);
};

export const exportExpensesToPDF = (trip: Trip, expenses: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Helper functions (same as above)
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    } else {
      doc.text(text, x, y);
      return y + (fontSize * 0.4);
    }
  };

  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense List', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Trip info
  doc.setFontSize(14);
  yPosition = addText(`Trip: ${trip.name}`, 20, yPosition, undefined, 14);
  yPosition += 10;

  // Expenses
  expenses.forEach((expense, index) => {
    checkNewPage(35);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(`${index + 1}. ${expense.title}`, 20, yPosition, undefined, 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(`$${expense.amount.toFixed(2)} - ${expense.category} - ${new Date(expense.date).toLocaleDateString()}`, 25, yPosition);
    
    if (expense.description) {
      yPosition = addText(`Description: ${expense.description}`, 25, yPosition, pageWidth - 50);
    }
    
    yPosition += 5;
  });

  // Footer
  const now = new Date();
  doc.setFontSize(8);
  doc.text(`Generated on ${now.toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  const fileName = `${trip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_expenses.pdf`;
  doc.save(fileName);
};