import { create } from 'zustand';
import api from '../services/api';

export interface Expense {
    _id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
}

export interface Category {
    name: string;
}

interface ExpenseState {
    expenses: Expense[];
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    fetchExpenses: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    addExpense: (expense: Omit<Expense, '_id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
    expenses: [],
    categories: [],
    isLoading: false,
    error: null,

    fetchExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
            const expenses = await api.getExpenses();
            set({ expenses, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch expenses', isLoading: false });
        }
    },

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const categories = await api.getCategories();
            set({ categories, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch categories', isLoading: false });
        }
    },

    addExpense: async (expense) => {
        set({ isLoading: true, error: null });
        try {
            const newExpense = await api.addExpense(expense);
            set((state) => ({
                expenses: [...state.expenses, newExpense],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to add expense', isLoading: false });
        }
    },

    deleteExpense: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.deleteExpense(id);
            set((state) => ({
                expenses: state.expenses.filter((expense) => expense._id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to delete expense', isLoading: false });
        }
    },
}));