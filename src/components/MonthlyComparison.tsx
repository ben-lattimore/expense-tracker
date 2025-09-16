import React, { useEffect } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import SpendingComparison from './analytics/SpendingComparison';
import TrendIndicators from './analytics/TrendIndicators';

const MonthlyComparison: React.FC = () => {
    const {
        monthlyComparison,
        spendingTrends,
        summary,
        isLoadingMonthly,
        isLoadingSummary,
        errorMonthly,
        errorSummary,
        fetchMonthlyComparison,
        fetchSpendingTrends,
        fetchSummary
    } = useAnalyticsStore();

    useEffect(() => {
        fetchMonthlyComparison();
        fetchSpendingTrends(12); // Get last 12 months
        fetchSummary();
    }, [fetchMonthlyComparison, fetchSpendingTrends, fetchSummary]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Monthly Analysis</h1>
                    <p className="text-gray-600 mt-1">Compare your spending patterns across months</p>
                </div>
            </div>

            {/* Trend Indicators */}
            <TrendIndicators
                monthlyComparison={monthlyComparison}
                summary={summary}
                isLoading={isLoadingMonthly || isLoadingSummary}
                error={errorMonthly || errorSummary}
            />

            {/* Current vs Previous Month */}
            <SpendingComparison
                monthlyData={monthlyComparison}
                isLoading={isLoadingMonthly}
                error={errorMonthly}
                type="monthly"
                title="This Month vs Last Month"
                height={350}
            />

            {/* Monthly Spending Trends */}
            {spendingTrends.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Spending History</h3>
                    
                    {/* Monthly Trend Chart Data Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Month
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transactions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg per Transaction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        vs Previous Month
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {spendingTrends.slice().reverse().map((month, index) => {
                                    const prevMonth = spendingTrends[spendingTrends.length - index - 2];
                                    const change = prevMonth ? ((month.totalSpent - prevMonth.totalSpent) / prevMonth.totalSpent) * 100 : 0;
                                    const isIncrease = change > 0;
                                    const isSignificantChange = Math.abs(change) > 10;
                                    
                                    return (
                                        <tr key={`${month.year}-${month.month}`} className={index === 0 ? 'bg-blue-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {month.monthName}
                                                </div>
                                                {index === 0 && (
                                                    <div className="text-xs text-blue-600 font-medium">Current Month</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    £{month.totalSpent.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {month.transactionCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                £{month.avgTransaction.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {prevMonth ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isSignificantChange
                                                            ? isIncrease 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {isIncrease ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed Insights */}
            {monthlyComparison && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Month Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {monthlyComparison.currentMonth.monthName} Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Spending:</span>
                                <span className="font-medium">£{monthlyComparison.currentMonth.totalSpent.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Transactions:</span>
                                <span className="font-medium">{monthlyComparison.currentMonth.transactionCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Average per Transaction:</span>
                                <span className="font-medium">£{monthlyComparison.currentMonth.avgTransaction.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Categories Used:</span>
                                <span className="font-medium">{monthlyComparison.currentMonth.categoryCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Previous Month Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {monthlyComparison.previousMonth.monthName} Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Spending:</span>
                                <span className="font-medium">£{monthlyComparison.previousMonth.totalSpent.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Transactions:</span>
                                <span className="font-medium">{monthlyComparison.previousMonth.transactionCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Average per Transaction:</span>
                                <span className="font-medium">£{monthlyComparison.previousMonth.avgTransaction.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Categories Used:</span>
                                <span className="font-medium">{monthlyComparison.previousMonth.categoryCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Insights */}
            {monthlyComparison && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Key Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Spending Changes</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>
                                    • Spending {monthlyComparison.changes.spending > 0 ? 'increased' : 'decreased'} by{' '}
                                    <span className="font-medium">{Math.abs(monthlyComparison.changes.spending).toFixed(1)}%</span>
                                </li>
                                <li>
                                    • Transaction count {monthlyComparison.changes.transactions > 0 ? 'increased' : 'decreased'} by{' '}
                                    <span className="font-medium">{Math.abs(monthlyComparison.changes.transactions).toFixed(1)}%</span>
                                </li>
                                <li>
                                    • Average transaction size{' '}
                                    {monthlyComparison.currentMonth.avgTransaction > monthlyComparison.previousMonth.avgTransaction ? 'increased' : 'decreased'} by{' '}
                                    <span className="font-medium">
                                        £{Math.abs(monthlyComparison.currentMonth.avgTransaction - monthlyComparison.previousMonth.avgTransaction).toFixed(2)}
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {monthlyComparison.changes.spending > 10 && (
                                    <li>• Consider reviewing your budget - spending increased significantly</li>
                                )}
                                {monthlyComparison.changes.spending < -10 && (
                                    <li>• Great job reducing spending! Keep up the good work</li>
                                )}
                                {monthlyComparison.currentMonth.avgTransaction > monthlyComparison.previousMonth.avgTransaction + 5 && (
                                    <li>• Average transaction size increased - review larger purchases</li>
                                )}
                                {monthlyComparison.currentMonth.categoryCount > monthlyComparison.previousMonth.categoryCount && (
                                    <li>• You're spending across more categories - consider focusing your budget</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyComparison;