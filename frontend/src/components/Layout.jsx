import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { name: 'Analyze', path: '/analyze' },
        { name: 'Train', path: '/train' },
        { name: 'Explain', path: '/explain' },
        { name: 'Predict', path: '/predict' },
        { name: 'Story', path: '/story' },
    ];

    return (
        <div className="min-h-screen bg-apple-gray font-sans selection:bg-electric-blue selection:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transaction-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-electric-blue to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/30">
                                    IL
                                </span>
                                InsightLens AI
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 z-10 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute inset-0 bg-electric-blue rounded-full -z-10 shadow-md shadow-blue-500/30"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Menu Button (Simplified) */}
                        <div className="md:hidden">
                            <button className="text-gray-500 hover:text-gray-900">
                                <span className="sr-only">Open menu</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    © 2026 Harvtek Labs. Built with precision.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
