// App.tsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'input'>('dashboard');
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        });
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
                    <div className="flex items-center">
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            className={`mr-4 text-sm ${currentPage === 'dashboard' ? 'text-white' : 'text-blue-200'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setCurrentPage('input')}
                            className={`text-sm ${currentPage === 'input' ? 'text-white' : 'text-blue-200'}`}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto mt-16 p-4">
                {currentPage === 'dashboard' ? <Dashboard /> : <InputForm />}
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