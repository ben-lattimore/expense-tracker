import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import TimeSeriesChart from './analytics/TimeSeriesChart';

const DailyTrends: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [showTransactions, setShowTransactions] = useState(false);
    
    const {
        dailySpending,
        isLoadingDaily,
        errorDaily,
        fetchDailySpending
    } = useAnalyticsStore();

    useEffect(() => {
        fetchDailySpending(selectedPeriod);
    }, [selectedPeriod, fetchDailySpending]);

    const handlePeriodChange = (days: number) => {
        setSelectedPeriod(days);
    };

    // Calculate additional insights
    const insights = React.useMemo(() => {
        if (dailySpending.length === 0) return null;

        const totalSpent = dailySpending.reduce((sum, day) => sum + day.totalSpent, 0);
        const avgDaily = totalSpent / dailySpending.length;
        const maxDay = dailySpending.reduce((max, day) => day.totalSpent > max.totalSpent ? day : max);
        const minDay = dailySpending.reduce((min, day) => day.totalSpent < min.totalSpent ? day : min);
        
        // Find spending streaks
        const highSpendingDays = dailySpending.filter(day => day.totalSpent > avgDaily * 1.5);
        const lowSpendingDays = dailySpending.filter(day => day.totalSpent < avgDaily * 0.5);
        
        // Weekly pattern
        const weeklyData = dailySpending.reduce((acc, day) => {
            const dayOfWeek = new Date(day.date).getDay();
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
            if (!acc[dayName]) acc[dayName] = [];
            acc[dayName].push(day.totalSpent);
            return acc;
        }, {} as Record<string, number[]>);

        const weeklyAverages = Object.entries(weeklyData).map(([day, amounts]) => ({
            day,
            average: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
        })).sort((a, b) => b.average - a.average);

        return {
            totalSpent,
            avgDaily,
            maxDay,
            minDay,
            highSpendingDays: highSpendingDays.length,
            lowSpendingDays: lowSpendingDays.length,
            weeklyAverages
        };
    }, [dailySpending]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Daily Spending Trends</h1>
                    <p className="text-gray-600 mt-1">Deep dive into your day-by-day spending patterns</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* Period Selector */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Period:</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(Number(e.target.value))}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 2 weeks</option>
                            <option value={30}>Last 30 days</option>
                            <option value={60}>Last 60 days</option>
                            <option value={90}>Last 3 months</option>
                        </select>
                    </div>
                    
                    {/* Show Transactions Toggle */}
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={showTransactions}
                            onChange={(e) => setShowTransactions(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show transaction count</span>
                    </label>
                </div>
            </div>

            {/* Main Chart */}
            <TimeSeriesChart
                data={dailySpending}
                isLoading={isLoadingDaily}
                error={errorDaily}
                title={`Daily Spending Analysis (Last ${selectedPeriod} days)`}
                height={400}
                showTransactions={showTransactions}
            />

            {/* Insights Grid */}
            {insights && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Spending Range */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Range</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Highest Day</p>
                                <p className="text-xl font-bold text-red-600">£{insights.maxDay.totalSpent.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{new Date(insights.maxDay.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Lowest Day</p>
                                <p className="text-xl font-bold text-green-600">£{insights.minDay.totalSpent.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{new Date(insights.minDay.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Spending Patterns */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Patterns</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">High Spending Days</p>
                                <p className="text-xl font-bold text-orange-600">{insights.highSpendingDays}</p>
                                <p className="text-xs text-gray-500">Above 150% of average</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Low Spending Days</p>
                                <p className="text-xl font-bold text-blue-600">{insights.lowSpendingDays}</p>
                                <p className="text-xs text-gray-500">Below 50% of average</p>
                            </div>
                        </div>
                    </div>

                    {/* Daily Average */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Averages</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Daily Average</p>
                                <p className="text-xl font-bold text-blue-600">£{insights.avgDaily.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Over {selectedPeriod} days</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Period</p>
                                <p className="text-xl font-bold text-purple-600">£{insights.totalSpent.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Last {selectedPeriod} days</p>
                            </div>
                        </div>
                    </div>

                    {/* Day of Week Rankings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Day Rankings</h3>
                        <div className="space-y-2">
                            {insights.weeklyAverages.slice(0, 3).map((dayData, index) => (
                                <div key={dayData.day} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        {index + 1}. {dayData.day}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        £{dayData.average.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            <p className="text-xs text-gray-500 mt-2">Top spending days by average</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Day Breakdown */}
            {dailySpending.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Day of Week
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transactions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg per Transaction
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dailySpending.slice().reverse().slice(0, 20).map((day) => {
                                    const date = new Date(day.date);
                                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                    const isHighSpending = insights && day.totalSpent > insights.avgDaily * 1.5;
                                    const isLowSpending = insights && day.totalSpent < insights.avgDaily * 0.5;
                                    
                                    return (
                                        <tr key={day.date} className={`${isHighSpending ? 'bg-red-50' : isLowSpending ? 'bg-green-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {date.toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {dayName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={`${isHighSpending ? 'text-red-600' : isLowSpending ? 'text-green-600' : 'text-gray-900'}`}>
                                                    £{day.totalSpent.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {day.transactionCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                £{day.avgTransaction.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {dailySpending.length > 20 && (
                            <p className="text-sm text-gray-500 mt-4 text-center">
                                Showing latest 20 days. Select a shorter period to see all days.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyTrends;