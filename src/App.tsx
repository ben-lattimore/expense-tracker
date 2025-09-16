// App.tsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import AnalyticsOverview from './components/AnalyticsOverview';
import DailyTrends from './components/DailyTrends';
import MonthlyComparison from './components/MonthlyComparison';
import WeeklyPatterns from './components/WeeklyPatterns';

type PageType = 'dashboard' | 'input' | 'analytics-overview' | 'daily-trends' | 'monthly-comparison' | 'weekly-patterns';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        });

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.analytics-dropdown')) {
                setIsAnalyticsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                setDeferredPrompt(null);
                setIsInstallable(false);
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-blue-600 p-4 fixed top-0 left-0 right-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-white text-xl font-bold">Expense Tracker</h1>
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            className={`text-sm font-medium ${currentPage === 'dashboard' ? 'text-white' : 'text-blue-200 hover:text-white'}`}
                        >
                            Dashboard
                        </button>
                        
                        {/* Analytics Dropdown */}
                        <div className="relative analytics-dropdown">
                            <button
                                onClick={() => setIsAnalyticsDropdownOpen(!isAnalyticsDropdownOpen)}
                                className={`text-sm font-medium flex items-center ${
                                    currentPage.includes('analytics') || currentPage.includes('trends') || currentPage.includes('monthly') || currentPage.includes('weekly')
                                        ? 'text-white' 
                                        : 'text-blue-200 hover:text-white'
                                }`}
                            >
                                Analytics
                                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {isAnalyticsDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setCurrentPage('analytics-overview');
                                                setIsAnalyticsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            📊 Overview
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentPage('daily-trends');
                                                setIsAnalyticsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            📈 Daily Trends
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentPage('monthly-comparison');
                                                setIsAnalyticsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            📅 Monthly Analysis
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentPage('weekly-patterns');
                                                setIsAnalyticsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            📆 Weekly Patterns
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={() => setCurrentPage('input')}
                            className={`text-sm font-medium ${currentPage === 'input' ? 'text-white' : 'text-blue-200 hover:text-white'}`}
                        >
                            Add Expense
                        </button>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto mt-16 p-4">
                {currentPage === 'dashboard' && <Dashboard />}
                {currentPage === 'input' && <InputForm />}
                {currentPage === 'analytics-overview' && <AnalyticsOverview />}
                {currentPage === 'daily-trends' && <DailyTrends />}
                {currentPage === 'monthly-comparison' && <MonthlyComparison />}
                {currentPage === 'weekly-patterns' && <WeeklyPatterns />}
            </main>
            {isInstallable && (
                <button
                    onClick={handleInstall}
                    className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
                >
                    Install App
                </button>
            )}
        </div>
    );
};

export default App;