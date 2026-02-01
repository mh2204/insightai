import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Train = () => {
    const [datasetId, setDatasetId] = useState(null);
    const [targetColumn, setTargetColumn] = useState('');
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem('dataset_id');
        setDatasetId(id);
        if (id) {
            // Fetch columns to populate target selector
            axios.get(`http://localhost:8000/data/profile/${id}`)
                .then(res => setColumns(res.data.columns))
                .catch(err => console.error(err));
        }
    }, []);

    const handleTrain = async () => {
        if (!datasetId || !targetColumn) return;
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post('http://localhost:8000/train/', {
                dataset_id: datasetId,
                target_column: targetColumn,
                // problem_type auto-detected
            });
            setResults(res.data);
            // Auto-save best model ID for explainability
            if (res.data.best_model) {
                localStorage.setItem('best_model_id', res.data.best_model.model_id);
            }
        } catch (err) {
            setError("Training failed. " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Model Training</h1>
                <p className="mt-2 text-gray-500">AutoML mode: We'll test multiple algorithms to find the best fit.</p>
            </div>

            {!datasetId && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl">
                    Please upload a dataset in the Analyze tab first.
                </div>
            )}

            {datasetId && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Column (What to predict)</label>
                        <select
                            value={targetColumn}
                            onChange={(e) => setTargetColumn(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-electric-blue focus:ring-electric-blue sm:text-sm p-2.5 border"
                        >
                            <option value="">Select a column...</option>
                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleTrain}
                        disabled={loading || !targetColumn}
                        className={`
                        px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-md
                        ${loading || !targetColumn ? 'bg-gray-300 cursor-not-allowed' : 'bg-electric-blue hover:bg-indigo-600 hover:shadow-lg'}
                    `}
                    >
                        {loading ? 'Training Models...' : 'Start Auto-Training'}
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Training Logistic Regression, Random Forest, and XGBoost...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            {results && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Dropped Columns Warning */}
                    {results.dropped_columns && results.dropped_columns.length > 0 && (
                        <div className="lg:col-span-2 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <h4 className="font-bold text-sm">High Cardinality Columns Dropped</h4>
                                <p className="text-sm mt-1">
                                    The following columns had too many unique categories and were ignored to prevent memory errors:
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {results.dropped_columns.map(col => (
                                        <span key={col} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md font-mono border border-yellow-200">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metrics Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Model Performance</h3>
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide ${results.problem_type === 'classification'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                {results.problem_type} Mode
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={results.results}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey={results.problem_type === 'classification' ? 'accuracy' : 'r2'} radius={[4, 4, 0, 0]}>
                                    {results.results.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#6366f1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h3>
                        <div className="space-y-4">
                            <div className="space-y-4">
                                {results.results.map((res, idx) => {
                                    const isClass = results.problem_type === 'classification';
                                    const mainMetric = isClass ? res.accuracy : res.r2;
                                    const widthVal = Math.max(0, Math.min(100, mainMetric * 100));

                                    return (
                                        <motion.div
                                            key={res.model}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`p-4 rounded-xl border ${idx === 0 ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 bg-gray-50/50'}`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    {res.model}
                                                    {idx === 0 && (
                                                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wide font-bold text-emerald-700 bg-emerald-200 rounded-full">
                                                            Best
                                                        </span>
                                                    )}
                                                </h4>
                                                <span className="text-sm font-bold text-gray-700">
                                                    {isClass ? `${(res.accuracy * 100).toFixed(1)}%` : res.r2.toFixed(3)}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${widthVal}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className={`h-1.5 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                />
                                            </div>

                                            <div className="flex gap-4 text-xs text-gray-500">
                                                {isClass ? (
                                                    <span>F1 Score: <span className="font-medium text-gray-700">{(res.f1 * 100).toFixed(1)}%</span></span>
                                                ) : (
                                                    <span>MSE: <span className="font-medium text-gray-700">{res.mse.toFixed(3)}</span></span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Train;
