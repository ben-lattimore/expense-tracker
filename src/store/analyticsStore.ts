import { create } from 'zustand';

// Types for analytics data
export interface DailySpending {
    date: string;
    totalSpent: number;
    transactionCount: number;
    avgTransaction: number;
}

export interface MonthlyComparison {
    currentMonth: {
        monthName: string;
        totalSpent: number;
        transactionCount: number;
        avgTransaction: number;
        categoryCount: number;
    };
    previousMonth: {
        monthName: string;
        totalSpent: number;
        transactionCount: number;
        avgTransaction: number;
        categoryCount: number;
    };
    changes: {
        spending: number;
        transactions: number;
    };
}

export interface WeeklyTrend {
    dayOfWeek: number;
    dayName: string;
    totalSpent: number;
    transactionCount: number;
    avgTransaction: number;
}

export interface SpendingTrend {
    year: number;
    month: number;
    monthName: string;
    totalSpent: number;
    transactionCount: number;
    avgTransaction: number;
}

export interface AnalyticsSummary {
    last7Days: {
        totalSpent: number;
        dailyAverage: number;
        transactionCount: number;
    };
    monthlyComparison: {
        currentMonth: number;
        previousMonth: number;
        changePercent: number;
    };
    spendingPatterns: {
        weekendSpending: number;
        weekdaySpending: number;
        weekendVsWeekdayRatio: number;
    };
}

interface AnalyticsState {
    // Data
    dailySpending: DailySpending[];
    monthlyComparison: MonthlyComparison | null;
    weeklyTrends: WeeklyTrend[];
    spendingTrends: SpendingTrend[];
    summary: AnalyticsSummary | null;
    
    // Loading states
    isLoadingDaily: boolean;
    isLoadingMonthly: boolean;
    isLoadingWeekly: boolean;
    isLoadingTrends: boolean;
    isLoadingSummary: boolean;
    
    // Error states
    errorDaily: string | null;
    errorMonthly: string | null;
    errorWeekly: string | null;
    errorTrends: string | null;
    errorSummary: string | null;
    
    // Cache timestamps for data freshness
    lastFetchDaily: number | null;
    lastFetchMonthly: number | null;
    lastFetchWeekly: number | null;
    lastFetchTrends: number | null;
    lastFetchSummary: number | null;
    
    // Actions
    fetchDailySpending: (days?: number) => Promise<void>;
    fetchMonthlyComparison: () => Promise<void>;
    fetchWeeklyTrends: (weeks?: number) => Promise<void>;
    fetchSpendingTrends: (months?: number) => Promise<void>;
    fetchSummary: () => Promise<void>;
    clearErrors: () => void;
    refreshAllData: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to check if data is fresh
const isFresh = (timestamp: number | null): boolean => {
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
};

// API helper function
const apiRequest = async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
    // Initial state
    dailySpending: [],
    monthlyComparison: null,
    weeklyTrends: [],
    spendingTrends: [],
    summary: null,
    
    // Loading states
    isLoadingDaily: false,
    isLoadingMonthly: false,
    isLoadingWeekly: false,
    isLoadingTrends: false,
    isLoadingSummary: false,
    
    // Error states
    errorDaily: null,
    errorMonthly: null,
    errorWeekly: null,
    errorTrends: null,
    errorSummary: null,
    
    // Cache timestamps
    lastFetchDaily: null,
    lastFetchMonthly: null,
    lastFetchWeekly: null,
    lastFetchTrends: null,
    lastFetchSummary: null,
    
    // Actions
    fetchDailySpending: async (days = 7) => {
        const state = get();
        
        // Check cache freshness
        if (state.dailySpending.length > 0 && isFresh(state.lastFetchDaily)) {
            return;
        }
        
        set({ isLoadingDaily: true, errorDaily: null });
        
        try {
            const response = await apiRequest(`/analytics/daily-spending?days=${days}`);
            set({
                dailySpending: response.data,
                isLoadingDaily: false,
                lastFetchDaily: Date.now()
            });
        } catch (error) {
            set({
                errorDaily: error instanceof Error ? error.message : 'Failed to fetch daily spending',
                isLoadingDaily: false
            });
        }
    },
    
    fetchMonthlyComparison: async () => {
        const state = get();
        
        // Check cache freshness
        if (state.monthlyComparison && isFresh(state.lastFetchMonthly)) {
            return;
        }
        
        set({ isLoadingMonthly: true, errorMonthly: null });
        
        try {
            const response = await apiRequest('/analytics/monthly-comparison');
            set({
                monthlyComparison: response.data,
                isLoadingMonthly: false,
                lastFetchMonthly: Date.now()
            });
        } catch (error) {
            set({
                errorMonthly: error instanceof Error ? error.message : 'Failed to fetch monthly comparison',
                isLoadingMonthly: false
            });
        }
    },
    
    fetchWeeklyTrends: async (weeks = 4) => {
        const state = get();
        
        // Check cache freshness
        if (state.weeklyTrends.length > 0 && isFresh(state.lastFetchWeekly)) {
            return;
        }
        
        set({ isLoadingWeekly: true, errorWeekly: null });
        
        try {
            const response = await apiRequest(`/analytics/weekly-trends?weeks=${weeks}`);
            set({
                weeklyTrends: response.data,
                isLoadingWeekly: false,
                lastFetchWeekly: Date.now()
            });
        } catch (error) {
            set({
                errorWeekly: error instanceof Error ? error.message : 'Failed to fetch weekly trends',
                isLoadingWeekly: false
            });
        }
    },
    
    fetchSpendingTrends: async (months = 6) => {
        const state = get();
        
        // Check cache freshness
        if (state.spendingTrends.length > 0 && isFresh(state.lastFetchTrends)) {
            return;
        }
        
        set({ isLoadingTrends: true, errorTrends: null });
        
        try {
            const response = await apiRequest(`/analytics/spending-trends?months=${months}`);
            set({
                spendingTrends: response.data,
                isLoadingTrends: false,
                lastFetchTrends: Date.now()
            });
        } catch (error) {
            set({
                errorTrends: error instanceof Error ? error.message : 'Failed to fetch spending trends',
                isLoadingTrends: false
            });
        }
    },
    
    fetchSummary: async () => {
        const state = get();
        
        // Check cache freshness
        if (state.summary && isFresh(state.lastFetchSummary)) {
            return;
        }
        
        set({ isLoadingSummary: true, errorSummary: null });
        
        try {
            const response = await apiRequest('/analytics/summary');
            set({
                summary: response.data,
                isLoadingSummary: false,
                lastFetchSummary: Date.now()
            });
        } catch (error) {
            set({
                errorSummary: error instanceof Error ? error.message : 'Failed to fetch summary',
                isLoadingSummary: false
            });
        }
    },
    
    clearErrors: () => {
        set({
            errorDaily: null,
            errorMonthly: null,
            errorWeekly: null,
            errorTrends: null,
            errorSummary: null
        });
    },
    
    refreshAllData: async () => {
        // Clear cache timestamps to force fresh data
        set({
            lastFetchDaily: null,
            lastFetchMonthly: null,
            lastFetchWeekly: null,
            lastFetchTrends: null,
            lastFetchSummary: null
        });
        
        // Fetch all data in parallel
        const { 
            fetchDailySpending, 
            fetchMonthlyComparison, 
            fetchWeeklyTrends, 
            fetchSpendingTrends, 
            fetchSummary 
        } = get();
        
        await Promise.all([
            fetchDailySpending(),
            fetchMonthlyComparison(),
            fetchWeeklyTrends(),
            fetchSpendingTrends(),
            fetchSummary()
        ]);
    }
}));