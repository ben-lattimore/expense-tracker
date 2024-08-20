import React, { useEffect } from 'react';
import { useExpenseStore } from '../store/expenseStore';

const Dashboard: React.FC = () => {
    const { dailyTotals, calculateRunningAverages, expenses, categories } = useExpenseStore();

    useEffect(() => {
        calculateRunningAverages();
    }, [calculateRunningAverages]);

    // Get the latest running average
    const latestRunningAverage = dailyTotals.length > 0 ? dailyTotals[dailyTotals.length - 1].runningAverage : 0;

    // Get the latest category averages
    const latestCategoryAverages = dailyTotals.length > 0 ? dailyTotals[dailyTotals.length - 1].categoryRunningAverages : {};

    // Get the latest 10 transactions
    const latestTransactions = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Expense Tracker Dashboard</h1>

            {/* 1. Total Running Average */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Total Running Average</h2>
                <p className="text-5xl font-bold text-blue-600">£{latestRunningAverage.toFixed(2)}</p>
            </div>

            {/* 2. Category Running Averages */}
            <h2 className="text-2xl font-semibold mb-4">Category Averages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {Object.entries(latestCategoryAverages).map(([category, average]) => (
                    <div key={category} className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">{category}</h3>
                        <p className="text-2xl font-bold text-green-600">£{average.toFixed(2)}</p>
                    </div>
                ))}
            </div>

            {/* 3. Latest Transactions */}
            <h2 className="text-2xl font-semibold mb-4">Latest Transactions</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {latestTransactions.map((transaction) => {
                        const category = categories.find(cat => cat.id === transaction.categoryId);
                        return (
                            <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{transaction.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">£{transaction.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{category ? category.name : 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(transaction.date).toLocaleDateString()}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;