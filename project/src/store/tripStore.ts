import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  category: string;
  date: string;
  description?: string;
  receipt?: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  members: Member[];
  expenses: Expense[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
}

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  addExpense: (tripId: string, expense: Expense) => void;
  updateExpense: (tripId: string, expense: Expense) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  getTripsByUser: (userId: string) => Trip[];
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTrip: null,
      setTrips: (trips) => set({ trips }),
      addTrip: (trip) => set((state) => ({ trips: [...state.trips, trip] })),
      updateTrip: (trip) => set((state) => {
        const updatedTrips = state.trips.map(t => t.id === trip.id ? trip : t);
        return {
          trips: updatedTrips,
          currentTrip: state.currentTrip?.id === trip.id ? trip : state.currentTrip
        };
      }),
      deleteTrip: (tripId) => set((state) => ({
        trips: state.trips.filter(t => t.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip
      })),
      setCurrentTrip: (trip) => set({ currentTrip: trip }),
      addExpense: (tripId, expense) => set((state) => {
        const updatedTrips = state.trips.map(trip => 
          trip.id === tripId 
            ? { 
                ...trip, 
                expenses: [...trip.expenses, expense],
                totalAmount: trip.totalAmount + expense.amount
              }
            : trip
        );
        
        const updatedCurrentTrip = state.currentTrip?.id === tripId
          ? { 
              ...state.currentTrip, 
              expenses: [...state.currentTrip.expenses, expense],
              totalAmount: state.currentTrip.totalAmount + expense.amount
            }
          : state.currentTrip;

        return {
          trips: updatedTrips,
          currentTrip: updatedCurrentTrip
        };
      }),
      updateExpense: (tripId, expense) => set((state) => {
        const updatedTrips = state.trips.map(trip => 
          trip.id === tripId 
            ? { 
                ...trip, 
                expenses: trip.expenses.map(e => e.id === expense.id ? expense : e),
                totalAmount: trip.expenses
                  .map(e => e.id === expense.id ? expense : e)
                  .reduce((sum, e) => sum + e.amount, 0)
              }
            : trip
        );
        
        const updatedCurrentTrip = state.currentTrip?.id === tripId
          ? { 
              ...state.currentTrip, 
              expenses: state.currentTrip.expenses.map(e => e.id === expense.id ? expense : e),
              totalAmount: state.currentTrip.expenses
                .map(e => e.id === expense.id ? expense : e)
                .reduce((sum, e) => sum + e.amount, 0)
            }
          : state.currentTrip;

        return {
          trips: updatedTrips,
          currentTrip: updatedCurrentTrip
        };
      }),
      deleteExpense: (tripId, expenseId) => set((state) => {
        const updatedTrips = state.trips.map(trip => 
          trip.id === tripId 
            ? { 
                ...trip, 
                expenses: trip.expenses.filter(e => e.id !== expenseId),
                totalAmount: trip.expenses
                  .filter(e => e.id !== expenseId)
                  .reduce((sum, e) => sum + e.amount, 0)
              }
            : trip
        );
        
        const updatedCurrentTrip = state.currentTrip?.id === tripId
          ? { 
              ...state.currentTrip, 
              expenses: state.currentTrip.expenses.filter(e => e.id !== expenseId),
              totalAmount: state.currentTrip.expenses
                .filter(e => e.id !== expenseId)
                .reduce((sum, e) => sum + e.amount, 0)
            }
          : state.currentTrip;

        return {
          trips: updatedTrips,
          currentTrip: updatedCurrentTrip
        };
      }),
      getTripsByUser: (userId) => {
        const { trips } = get();
        return trips.filter(trip => 
          trip.createdBy === userId || 
          trip.members.some(member => member.id === userId)
        );
      }
    }),
    {
      name: 'trip-storage',
    }
  )
);