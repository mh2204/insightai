import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl px-4"
            >
                <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
                    Harvtek Labs
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
                    See insights before <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-indigo-600">
                        they happen.
                    </span>
                </h1>
                <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                    Empowering data professionals to train, understand, and trust machine learning models through a beautiful, intuitive interface.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/analyze"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all duration-200 bg-gray-900 rounded-full hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        Start Analysis
                    </Link>
                    <a
                        href="https://github.com/harvtek"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                    >
                        View on GitHub
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
