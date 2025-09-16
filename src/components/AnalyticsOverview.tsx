import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import TimeSeriesChart from './analytics/TimeSeriesChart';
import SpendingComparison from './analytics/SpendingComparison';
import TrendIndicators from './analytics/TrendIndicators';

const AnalyticsOverview: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState(7);
    const {
        dailySpending,
        monthlyComparison,
        weeklyTrends,
        summary,
        isLoadingDaily,
        isLoadingMonthly,
        isLoadingWeekly,
        isLoadingSummary,
        errorDaily,
        errorMonthly,
        errorWeekly,
        errorSummary,
        fetchDailySpending,
        fetchMonthlyComparison,
        fetchWeeklyTrends,
        fetchSummary,
        refreshAllData
    } = useAnalyticsStore();

    useEffect(() => {
        // Fetch all analytics data when component mounts
        fetchDailySpending(selectedPeriod);
        fetchMonthlyComparison();
        fetchWeeklyTrends();
        fetchSummary();
    }, [selectedPeriod, fetchDailySpending, fetchMonthlyComparison, fetchWeeklyTrends, fetchSummary]);

    const handlePeriodChange = (days: number) => {
        setSelectedPeriod(days);
        fetchDailySpending(days);
    };

    const handleRefresh = () => {
        refreshAllData();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
                    <p className="text-gray-600 mt-1">Comprehensive insights into your spending patterns</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* Period Selector */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Time Period:</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(Number(e.target.value))}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={60}>Last 60 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>
                    
                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Trend Indicators */}
            <TrendIndicators
                monthlyComparison={monthlyComparison}
                summary={summary}
                isLoading={isLoadingMonthly || isLoadingSummary}
                error={errorMonthly || errorSummary}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Spending Chart */}
                <div className="lg:col-span-2">
                    <TimeSeriesChart
                        data={dailySpending}
                        isLoading={isLoadingDaily}
                        error={errorDaily}
                        title={`Daily Spending Trends (Last ${selectedPeriod} days)`}
                        height={350}
                        showTransactions={false}
                    />
                </div>

                {/* Monthly Comparison */}
                <SpendingComparison
                    monthlyData={monthlyComparison}
                    isLoading={isLoadingMonthly}
                    error={errorMonthly}
                    type="monthly"
                    height={300}
                />

                {/* Weekly Patterns */}
                <SpendingComparison
                    weeklyData={weeklyTrends}
                    isLoading={isLoadingWeekly}
                    error={errorWeekly}
                    type="weekly"
                    height={300}
                />
            </div>

            {/* Summary Stats */}
            {summary && !isLoadingSummary && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                                £{summary.last7Days.totalSpent.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">Last 7 Days Total</div>
                            <div className="text-xs text-gray-400 mt-1">
                                £{summary.last7Days.dailyAverage.toFixed(2)} daily average
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {summary.monthlyComparison.changePercent.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">Monthly Change</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {summary.monthlyComparison.changePercent > 0 ? 'Increase' : 'Decrease'} from last month
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {(summary.spendingPatterns.weekendVsWeekdayRatio * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-500">Weekend/Weekday Ratio</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {summary.spendingPatterns.weekendVsWeekdayRatio > 1 ? 'More on weekends' : 'More on weekdays'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsOverview;