import React, { useEffect } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import SpendingComparison from './analytics/SpendingComparison';

const WeeklyPatterns: React.FC = () => {
    const {
        weeklyTrends,
        isLoadingWeekly,
        errorWeekly,
        fetchWeeklyTrends
    } = useAnalyticsStore();

    useEffect(() => {
        fetchWeeklyTrends(4); // Last 4 weeks
    }, [fetchWeeklyTrends]);

    // Calculate insights
    const insights = React.useMemo(() => {
        if (weeklyTrends.length === 0) return null;

        const totalWeeklySpending = weeklyTrends.reduce((sum, day) => sum + day.totalSpent, 0);
        const avgDailySpending = totalWeeklySpending / 7;
        
        const sortedBySpending = [...weeklyTrends].sort((a, b) => b.totalSpent - a.totalSpent);
        const sortedByTransactions = [...weeklyTrends].sort((a, b) => b.transactionCount - a.transactionCount);
        
        const weekendDays = weeklyTrends.filter(day => day.dayOfWeek === 1 || day.dayOfWeek === 7); // Sunday & Saturday
        const weekdayDays = weeklyTrends.filter(day => day.dayOfWeek >= 2 && day.dayOfWeek <= 6); // Monday - Friday
        
        const weekendSpending = weekendDays.reduce((sum, day) => sum + day.totalSpent, 0);
        const weekdaySpending = weekdayDays.reduce((sum, day) => sum + day.totalSpent, 0);
        
        const weekendAvg = weekendSpending / weekendDays.length;
        const weekdayAvg = weekdaySpending / weekdayDays.length;

        return {
            totalWeeklySpending,
            avgDailySpending,
            highestSpendingDay: sortedBySpending[0],
            lowestSpendingDay: sortedBySpending[sortedBySpending.length - 1],
            mostTransactionsDay: sortedByTransactions[0],
            weekendSpending,
            weekdaySpending,
            weekendAvg,
            weekdayAvg,
            weekendVsWeekdayRatio: weekendAvg / weekdayAvg
        };
    }, [weeklyTrends]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Weekly Spending Patterns</h1>
                    <p className="text-gray-600 mt-1">Discover how your spending varies by day of the week</p>
                </div>
            </div>

            {/* Main Chart */}
            <SpendingComparison
                weeklyData={weeklyTrends}
                isLoading={isLoadingWeekly}
                error={errorWeekly}
                type="weekly"
                title="Average Spending by Day of Week"
                height={400}
            />

            {/* Insights Grid */}
            {insights && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Highest/Lowest Days */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Extremes</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Highest Spending Day</p>
                                <p className="text-xl font-bold text-red-600">{insights.highestSpendingDay.dayName}</p>
                                <p className="text-sm text-gray-500">£{insights.highestSpendingDay.totalSpent.toFixed(2)} average</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Lowest Spending Day</p>
                                <p className="text-xl font-bold text-green-600">{insights.lowestSpendingDay.dayName}</p>
                                <p className="text-sm text-gray-500">£{insights.lowestSpendingDay.totalSpent.toFixed(2)} average</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Patterns */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Patterns</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Most Active Day</p>
                                <p className="text-xl font-bold text-blue-600">{insights.mostTransactionsDay.dayName}</p>
                                <p className="text-sm text-gray-500">{insights.mostTransactionsDay.transactionCount} transactions</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Weekly Average</p>
                                <p className="text-xl font-bold text-purple-600">
                                    {(weeklyTrends.reduce((sum, day) => sum + day.transactionCount, 0) / 7).toFixed(1)}
                                </p>
                                <p className="text-sm text-gray-500">transactions per day</p>
                            </div>
                        </div>
                    </div>

                    {/* Weekend vs Weekday */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekend vs Weekday</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Weekend Average</p>
                                <p className="text-xl font-bold text-orange-600">£{insights.weekendAvg.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">Sat & Sun average</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Weekday Average</p>
                                <p className="text-xl font-bold text-indigo-600">£{insights.weekdayAvg.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">Mon-Fri average</p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Totals */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Summary</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Weekly Total</p>
                                <p className="text-xl font-bold text-gray-900">£{insights.totalWeeklySpending.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">Last 4 weeks average</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Daily Average</p>
                                <p className="text-xl font-bold text-blue-600">£{insights.avgDailySpending.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">per day</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Day Analysis */}
            {weeklyTrends.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Detailed Day Analysis</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Day of Week
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Average Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg Transactions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg per Transaction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        % of Weekly Spending
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {weeklyTrends.map((day) => {
                                    const weeklyPercentage = insights ? (day.totalSpent / insights.totalWeeklySpending) * 100 : 0;
                                    const isWeekend = day.dayOfWeek === 1 || day.dayOfWeek === 7;
                                    
                                    return (
                                        <tr key={day.dayName} className={isWeekend ? 'bg-orange-50' : 'bg-blue-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {day.dayName}
                                                    </div>
                                                    {isWeekend && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                            Weekend
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    £{day.totalSpent.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {day.transactionCount.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                £{day.avgTransaction.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${weeklyPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {weeklyPercentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Insights and Recommendations */}
            {insights && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Weekly Pattern Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">Spending Patterns</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    You spend most on <strong>{insights.highestSpendingDay.dayName}s</strong> 
                                    (£{insights.highestSpendingDay.totalSpent.toFixed(2)} average)
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">•</span>
                                    Your lightest spending day is <strong>{insights.lowestSpendingDay.dayName}</strong> 
                                    (£{insights.lowestSpendingDay.totalSpent.toFixed(2)} average)
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    {insights.weekendVsWeekdayRatio > 1 
                                        ? `You spend ${((insights.weekendVsWeekdayRatio - 1) * 100).toFixed(0)}% more on weekends than weekdays`
                                        : `You spend ${((1 - insights.weekendVsWeekdayRatio) * 100).toFixed(0)}% less on weekends than weekdays`
                                    }
                                </li>
                                <li className="flex items-start">
                                    <span className="text-orange-500 mr-2">•</span>
                                    <strong>{insights.mostTransactionsDay.dayName}</strong> is your busiest day 
                                    ({insights.mostTransactionsDay.transactionCount} transactions on average)
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">Optimization Tips</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                {insights.weekendVsWeekdayRatio > 1.3 && (
                                    <li className="flex items-start">
                                        <span className="text-yellow-500 mr-2">💡</span>
                                        Consider planning weekend activities that don't involve spending
                                    </li>
                                )}
                                {insights.highestSpendingDay.totalSpent > insights.avgDailySpending * 1.5 && (
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">📊</span>
                                        {insights.highestSpendingDay.dayName}s account for a large portion of your weekly spending
                                    </li>
                                )}
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    Try to keep daily spending under £{(insights.avgDailySpending * 1.2).toFixed(2)} 
                                    (20% above your current average)
                                </li>
                                {insights.mostTransactionsDay.transactionCount > 3 && (
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">🎯</span>
                                        Consider consolidating {insights.mostTransactionsDay.dayName} purchases to reduce transaction fees
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyPatterns;