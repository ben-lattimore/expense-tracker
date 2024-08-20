import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Expense {
    id: string;
    amount: number;
    description: string;
    categoryId: string;
    date: string;
}

interface Category {
    id: string;
    name: string;
}

interface DailyTotal {
    date: string;
    total: number;
    runningAverage: number;
    categoryTotals: Record<string, number>;
    categoryRunningAverages: Record<string, number>;
}

interface ExpenseState {
    expenses: Expense[];
    categories: Category[];
    dailyTotals: DailyTotal[];
    addExpense: (expense: Omit<Expense, 'id' | 'categoryId'> & { categoryId?: string, categoryName?: string }) => void;
    addCategory: (name: string) => string;
    getOrCreateCategory: (name: string) => string;
    calculateRunningAverages: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
    expenses: [],
    categories: [],
    dailyTotals: [],

    addExpense: (expense) => set((state) => {
        const categoryId = expense.categoryId || get().getOrCreateCategory(expense.categoryName || 'Uncategorized');
        const newExpense: Expense = {
            id: uuidv4(),
            amount: expense.amount,
            description: expense.description,
            categoryId,
            date: expense.date,
        };
        return { expenses: [...state.expenses, newExpense] };
    }),

    addCategory: (name) => {
        const newCategory = { id: uuidv4(), name };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        return newCategory.id;
    },

    getOrCreateCategory: (name) => {
        const { categories } = get();
        const existingCategory = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
        if (existingCategory) {
            return existingCategory.id;
        }
        return get().addCategory(name);
    },

    calculateRunningAverages: () => {
        const { expenses, categories } = get();

        if (expenses.length === 0) {
            set({ dailyTotals: [] });
            return;
        }

        // Sort expenses by date
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let dailyTotals: DailyTotal[] = [];
        let cumulativeTotal = 0;
        let daysCount = 0;

        // Group expenses by date
        const expensesByDate = sortedExpenses.reduce((acc, expense) => {
            const date = expense.date.split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(expense);
            return acc;
        }, {} as Record<string, Expense[]>);

        // Calculate running averages
        Object.entries(expensesByDate).forEach(([date, dayExpenses], index) => {
            daysCount++;
            const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            cumulativeTotal += dayTotal;

            const categoryTotals: Record<string, number> = {};
            const categoryRunningAverages: Record<string, number> = {};

            categories.forEach(category => {
                const categoryDayTotal = dayExpenses
                    .filter(expense => expense.categoryId === category.id)
                    .reduce((sum, expense) => sum + expense.amount, 0);

                categoryTotals[category.name] = categoryDayTotal;

                // Calculate running average for the category
                const prevCategoryTotal = index > 0 ? dailyTotals[index - 1].categoryRunningAverages[category.name] * (daysCount - 1) : 0;
                categoryRunningAverages[category.name] = (prevCategoryTotal + categoryDayTotal) / daysCount;
            });

            dailyTotals.push({
                date,
                total: dayTotal,
                runningAverage: cumulativeTotal / daysCount,
                categoryTotals,
                categoryRunningAverages,
            });
        });

        set({ dailyTotals });
    },
}));