// src/components/Dashboard.tsx
import React, { useEffect, useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';

const Dashboard: React.FC = () => {
    const { expenses, isLoading, error, fetchExpenses, deleteExpense } = useExpenseStore();

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const { totalDailyAverage, categoryDailyAverages, daysSinceFirstExpense } = useMemo(() => {
        if (expenses.length === 0) {
            return { totalDailyAverage: 0, categoryDailyAverages: {}, daysSinceFirstExpense: 0 };
        }

        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstExpenseDate = new Date(sortedExpenses[0].date);
        const today = new Date();
        const daysSinceFirstExpense = Math.max(1, Math.ceil((today.getTime() - firstExpenseDate.getTime()) / (1000 * 60 * 60 * 24)));

        let totalSum = 0;
        const categorySums: Record<string, number> = {};

        sortedExpenses.forEach(expense => {
            totalSum += expense.amount;
            if (!categorySums[expense.category]) {
                categorySums[expense.category] = 0;
            }
            categorySums[expense.category] += expense.amount;
        });

        const totalDailyAverage = totalSum / daysSinceFirstExpense;
        const categoryDailyAverages = Object.entries(categorySums).reduce((acc, [category, sum]) => {
            acc[category] = sum / daysSinceFirstExpense;
            return acc;
        }, {} as Record<string, number>);

        return { totalDailyAverage, categoryDailyAverages, daysSinceFirstExpense };
    }, [expenses]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            await deleteExpense(id);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Expense Tracker Dashboard</h1>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Total Daily Average (Last {daysSinceFirstExpense} days)</h2>
                <p className="text-5xl font-bold text-blue-600">£{totalDailyAverage.toFixed(2)}</p>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Category Daily Averages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {Object.entries(categoryDailyAverages).map(([category, average]) => (
                    <div key={category} className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">{category}</h3>
                        <p className="text-2xl font-bold text-green-600">£{average?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                ))}
            </div>
            <h2 className="text-2xl font-semibold mb-4">Latest Transactions</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.slice(-10).reverse().map((expense) => (
                        <tr key={expense._id}>
                            <td className="px-6 py-4 whitespace-nowrap">{expense.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">£{expense.amount?.toFixed(2) ?? 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{expense.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => handleDelete(expense._id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;