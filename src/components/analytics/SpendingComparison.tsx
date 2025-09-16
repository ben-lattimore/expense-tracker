import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MonthlyComparison, WeeklyTrend } from '../../store/analyticsStore';

interface SpendingComparisonProps {
    monthlyData?: MonthlyComparison | null;
    weeklyData?: WeeklyTrend[];
    isLoading: boolean;
    error: string | null;
    type: 'monthly' | 'weekly';
    title?: string;
    height?: number;
}

const SpendingComparison: React.FC<SpendingComparisonProps> = ({
    monthlyData,
    weeklyData = [],
    isLoading,
    error,
    type,
    title,
    height = 300
}) => {
    const defaultTitle = type === 'monthly' ? 'Monthly Comparison' : 'Weekly Spending Patterns';
    const chartTitle = title || defaultTitle;

    // Prepare data based on type
    let chartData: any[] = [];
    let maxValue = 0;

    if (type === 'monthly' && monthlyData) {
        chartData = [
            {
                name: 'Previous Month',
                fullName: monthlyData.previousMonth.monthName,
                value: monthlyData.previousMonth.totalSpent,
                transactions: monthlyData.previousMonth.transactionCount,
                avgTransaction: monthlyData.previousMonth.avgTransaction,
                categories: monthlyData.previousMonth.categoryCount
            },
            {
                name: 'Current Month',
                fullName: monthlyData.currentMonth.monthName,
                value: monthlyData.currentMonth.totalSpent,
                transactions: monthlyData.currentMonth.transactionCount,
                avgTransaction: monthlyData.currentMonth.avgTransaction,
                categories: monthlyData.currentMonth.categoryCount
            }
        ];
        maxValue = Math.max(monthlyData.previousMonth.totalSpent, monthlyData.currentMonth.totalSpent);
    } else if (type === 'weekly' && weeklyData.length > 0) {
        chartData = weeklyData.map(day => ({
            name: day.dayName.substring(0, 3), // Short name for x-axis
            fullName: day.dayName,
            value: day.totalSpent,
            transactions: day.transactionCount,
            avgTransaction: day.avgTransaction
        }));
        maxValue = Math.max(...weeklyData.map(day => day.totalSpent));
    }

    // Color scheme
    const getBarColor = (index: number, value: number) => {
        if (type === 'monthly') {
            return index === 0 ? '#6B7280' : '#3B82F6'; // Gray for previous, blue for current
        } else {
            // Color intensity based on spending amount for weekly
            const intensity = value / maxValue;
            if (intensity > 0.8) return '#EF4444'; // Red for high spending
            if (intensity > 0.6) return '#F59E0B'; // Orange for medium-high
            if (intensity > 0.4) return '#3B82F6'; // Blue for medium
            if (intensity > 0.2) return '#10B981'; // Green for low-medium
            return '#6B7280'; // Gray for low
        }
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="font-semibold text-gray-800">{data.fullName}</p>
                    <p className="text-blue-600">
                        <span className="font-medium">Total Spent:</span> £{data.value.toFixed(2)}
                    </p>
                    <p className="text-green-600">
                        <span className="font-medium">Transactions:</span> {data.transactions}
                    </p>
                    <p className="text-purple-600">
                        <span className="font-medium">Avg per transaction:</span> £{data.avgTransaction.toFixed(2)}
                    </p>
                    {data.categories && (
                        <p className="text-orange-600">
                            <span className="font-medium">Categories used:</span> {data.categories}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{chartTitle}</h3>
                <div className="flex items-center justify-center" style={{ height }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{chartTitle}</h3>
                <div className="flex items-center justify-center text-red-500" style={{ height }}>
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="mt-2 text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{chartTitle}</h3>
                <div className="flex items-center justify-center text-gray-500" style={{ height }}>
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="mt-2 text-sm">No data available</p>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate insights
    let insights = null;
    if (type === 'monthly' && monthlyData) {
        const change = monthlyData.changes.spending;
        const isIncrease = change > 0;
        insights = (
            <div className={`text-center p-3 rounded-lg ${isIncrease ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className={`text-sm font-medium ${isIncrease ? 'text-red-700' : 'text-green-700'}`}>
                    {isIncrease ? '↗️ Spending increased' : '↘️ Spending decreased'} by {Math.abs(change).toFixed(1)}% 
                    from last month
                </p>
            </div>
        );
    } else if (type === 'weekly') {
        const highestDay = chartData.reduce((max, day) => day.value > max.value ? day : max);
        const lowestDay = chartData.reduce((min, day) => day.value < min.value ? day : min);
        insights = (
            <div className="text-center p-3 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-700">
                    <span className="font-medium">{highestDay.fullName}</span> is your highest spending day 
                    (£{highestDay.value.toFixed(2)}), <span className="font-medium">{lowestDay.fullName}</span> is lowest 
                    (£{lowestDay.value.toFixed(2)})
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{chartTitle}</h3>
                {type === 'weekly' && (
                    <div className="text-sm text-gray-600">
                        <span>Total: £{chartData.reduce((sum, day) => sum + day.value, 0).toFixed(2)}</span>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e0e0e0' }}
                            tickFormatter={(value) => `£${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={getBarColor(index, entry.value)} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {insights && (
                <div className="mb-4">
                    {insights}
                </div>
            )}

            {/* Summary stats */}
            {type === 'weekly' && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">
                            £{(chartData.reduce((sum, day) => sum + day.value, 0) / 7).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Daily Average</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-green-600">
                            {chartData.reduce((sum, day) => sum + day.transactions, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Total Transactions</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">
                            £{(chartData.reduce((sum, day) => sum + day.value, 0) / 
                              chartData.reduce((sum, day) => sum + day.transactions, 0)).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Avg per Transaction</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpendingComparison;