import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Expense Tracker Dashboard</h1>
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Total Daily Average Spend</h2>
                <p className="text-4xl font-bold text-blue-600">£0.00</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder for category averages */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Category 1</h3>
                    <p className="text-2xl font-bold text-green-600">£0.00</p>
                </div>
                {/* Add more category boxes as needed */}
            </div>
        </div>
    );
};

export default Dashboard;