import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailySpending } from '../../store/analyticsStore';

interface TimeSeriesChartProps {
    data: DailySpending[];
    isLoading: boolean;
    error: string | null;
    title?: string;
    height?: number;
    showTransactions?: boolean;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
    data,
    isLoading,
    error,
    title = "Daily Spending Trends",
    height = 300,
    showTransactions = false
}) => {
    // Format data for the chart
    const chartData = data.map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'MMM dd'),
        fullDate: format(parseISO(item.date), 'MMMM dd, yyyy')
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="font-semibold text-gray-800">{data.fullDate}</p>
                    <p className="text-blue-600">
                        <span className="font-medium">Spent:</span> £{data.totalSpent.toFixed(2)}
                    </p>
                    {showTransactions && (
                        <p className="text-green-600">
                            <span className="font-medium">Transactions:</span> {data.transactionCount}
                        </p>
                    )}
                    <p className="text-purple-600">
                        <span className="font-medium">Avg per transaction:</span> £{data.avgTransaction.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="flex items-center justify-center" style={{ height }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
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

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
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

    // Calculate summary stats
    const totalSpent = data.reduce((sum, day) => sum + day.totalSpent, 0);
    const avgDaily = totalSpent / data.length;
    const maxDay = data.reduce((max, day) => day.totalSpent > max.totalSpent ? day : max);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Total: £{totalSpent.toFixed(2)}</span>
                    <span>Avg: £{avgDaily.toFixed(2)}/day</span>
                </div>
            </div>
            
            <div className="mb-4">
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="formattedDate" 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#e0e0e0' }}
                            tickFormatter={(value) => `£${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        <Line 
                            type="monotone" 
                            dataKey="totalSpent" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            name="Daily Spending"
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        
                        {showTransactions && (
                            <Line 
                                type="monotone" 
                                dataKey="transactionCount" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                name="Transactions"
                                yAxisId="right"
                                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">£{totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">£{avgDaily.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Daily Average</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">£{maxDay.totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Highest Day</p>
                </div>
            </div>
        </div>
    );
};

export default TimeSeriesChart;