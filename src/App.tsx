import React, { useState } from 'react';
import Dashboard from './components/Dashboard.tsx';
import InputForm from './components/InputForm.tsx';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'input'>('dashboard');

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-blue-600 p-4">
                <div className="container mx-auto flex justify-between">
                    <h1 className="text-white text-2xl font-bold">Expense Tracker</h1>
                    <div>
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            className={`mr-4 ${currentPage === 'dashboard' ? 'text-white' : 'text-blue-200'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setCurrentPage('input')}
                            className={currentPage === 'input' ? 'text-white' : 'text-blue-200'}
                        >
                            Add Expense
                        </button>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto mt-8">
                {currentPage === 'dashboard' ? <Dashboard /> : <InputForm />}
            </main>
        </div>
    );
};

export default App;