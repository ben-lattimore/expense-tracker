import React from 'react';
import { MonthlyComparison, AnalyticsSummary } from '../../store/analyticsStore';

interface TrendIndicatorsProps {
    monthlyComparison?: MonthlyComparison | null;
    summary?: AnalyticsSummary | null;
    isLoading: boolean;
    error: string | null;
}

interface TrendIndicatorProps {
    title: string;
    value: string;
    change: number;
    description?: string;
    isLoading?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
    title,
    value,
    change,
    description,
    isLoading = false,
    size = 'medium'
}) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    const sizeClasses = {
        small: 'p-3',
        medium: 'p-4',
        large: 'p-6'
    };
    
    const valueClasses = {
        small: 'text-lg',
        medium: 'text-2xl',
        large: 'text-3xl'
    };
    
    const iconClasses = {
        small: 'h-4 w-4',
        medium: 'h-5 w-5',
        large: 'h-6 w-6'
    };

    if (isLoading) {
        return (
            <div className={`bg-white rounded-lg shadow-md ${sizeClasses[size]} animate-pulse`}>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
        );
    }

    const getTrendColor = () => {
        if (isNeutral) return 'text-gray-500';
        return isPositive ? 'text-red-500' : 'text-green-500'; // Red for increase (bad for spending), green for decrease (good)
    };

    const getTrendBgColor = () => {
        if (isNeutral) return 'bg-gray-50';
        return isPositive ? 'bg-red-50' : 'bg-green-50';
    };

    const getTrendIcon = () => {
        if (isNeutral) {
            return (
                <svg className={`${iconClasses[size]} text-gray-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
                </svg>
            );
        }
        
        return isPositive ? (
            <svg className={`${iconClasses[size]} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ) : (
            <svg className={`${iconClasses[size]} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
        );
    };

    return (
        <div className={`bg-white rounded-lg shadow-md ${sizeClasses[size]} hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h4>
                {getTrendIcon()}
            </div>
            
            <div className={`${valueClasses[size]} font-bold text-gray-900 mb-2`}>
                {value}
            </div>
            
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrendBgColor()} ${getTrendColor()}`}>
                <span className="mr-1">
                    {isNeutral ? '→' : isPositive ? '↗' : '↘'}
                </span>
                {Math.abs(change).toFixed(1)}%
                {!isNeutral && (
                    <span className="ml-1">
                        {isPositive ? 'increase' : 'decrease'}
                    </span>
                )}
            </div>
            
            {description && (
                <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}
        </div>
    );
};

const TrendIndicators: React.FC<TrendIndicatorsProps> = ({
    monthlyComparison,
    summary,
    isLoading,
    error
}) => {
    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
                <div className="text-center text-red-500">
                    <svg className="mx-auto h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="mt-1 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // Prepare trend data
    const trends = [];

    if (monthlyComparison) {
        trends.push({
            title: 'Monthly Spending',
            value: `£${monthlyComparison.currentMonth.totalSpent.toFixed(2)}`,
            change: monthlyComparison.changes.spending,
            description: `vs ${monthlyComparison.previousMonth.monthName}`
        });

        trends.push({
            title: 'Monthly Transactions',
            value: monthlyComparison.currentMonth.transactionCount.toString(),
            change: monthlyComparison.changes.transactions,
            description: `vs ${monthlyComparison.previousMonth.transactionCount} last month`
        });
        
        const avgChange = monthlyComparison.currentMonth.avgTransaction > 0 && monthlyComparison.previousMonth.avgTransaction > 0
            ? ((monthlyComparison.currentMonth.avgTransaction - monthlyComparison.previousMonth.avgTransaction) / monthlyComparison.previousMonth.avgTransaction) * 100
            : 0;
            
        trends.push({
            title: 'Avg Transaction',
            value: `£${monthlyComparison.currentMonth.avgTransaction.toFixed(2)}`,
            change: avgChange,
            description: `vs £${monthlyComparison.previousMonth.avgTransaction.toFixed(2)} last month`
        });
    }

    if (summary) {
        const weekendRatio = summary.spendingPatterns.weekendVsWeekdayRatio;
        const weekendTrend = weekendRatio > 1 ? (weekendRatio - 1) * 100 : -(1 - weekendRatio) * 100;
        
        trends.push({
            title: 'Weekend vs Weekday',
            value: `${(weekendRatio * 100).toFixed(0)}%`,
            change: weekendTrend,
            description: weekendRatio > 1 
                ? `You spend ${(weekendRatio * 100).toFixed(0)}% more on weekends`
                : `You spend ${((1/weekendRatio) * 100).toFixed(0)}% more on weekdays`
        });
        
        // Calculate a trend for daily average (we'll simulate this based on current data)
        // In a real app, you'd compare with historical daily averages
        const dailyAvgTrend = 0; // Placeholder - would need historical data to calculate
        trends.push({
            title: 'Daily Average',
            value: `£${summary.last7Days.dailyAverage.toFixed(2)}`,
            change: dailyAvgTrend,
            description: 'Last 7 days average'
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Spending Trends</h3>
                <div className="text-xs text-gray-500">
                    <span>🟢 Decrease 🔴 Increase ⚫ No change</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {trends.map((trend, index) => (
                    <TrendIndicator
                        key={index}
                        title={trend.title}
                        value={trend.value}
                        change={trend.change}
                        description={trend.description}
                        isLoading={isLoading}
                        size="medium"
                    />
                ))}
                
                {isLoading && trends.length === 0 && (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <TrendIndicator
                                key={i}
                                title=""
                                value=""
                                change={0}
                                isLoading={true}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Additional insights section */}
            {monthlyComparison && !isLoading && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Quick Insights</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                        {monthlyComparison.changes.spending < -10 && (
                            <p>• Great job! You've reduced spending by over 10% this month</p>
                        )}
                        {monthlyComparison.changes.spending > 10 && (
                            <p>• Spending increased by over 10% - consider reviewing your budget</p>
                        )}
                        {monthlyComparison.currentMonth.categoryCount > monthlyComparison.previousMonth.categoryCount && (
                            <p>• You're spending across more categories this month ({monthlyComparison.currentMonth.categoryCount} vs {monthlyComparison.previousMonth.categoryCount})</p>
                        )}
                        {monthlyComparison.currentMonth.avgTransaction > monthlyComparison.previousMonth.avgTransaction + 5 && (
                            <p>• Your average transaction size has increased by £{(monthlyComparison.currentMonth.avgTransaction - monthlyComparison.previousMonth.avgTransaction).toFixed(2)}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendIndicators;