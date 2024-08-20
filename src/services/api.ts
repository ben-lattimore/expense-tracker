import axios from 'axios';
import { Expense, Category } from '../store/expenseStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

const api = {
    getExpenses: async (): Promise<Expense[]> => {
        const response = await axios.get(`${API_BASE_URL}/expenses`);
        return response.data;
    },

    addExpense: async (expense: Omit<Expense, '_id'>): Promise<Expense> => {
        const response = await axios.post(`${API_BASE_URL}/expenses/add`, expense);
        return response.data;
    },

    deleteExpense: async (id: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/expenses/${id}`);
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        return response.data;
    },
};

export default api;