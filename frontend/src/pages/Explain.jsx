import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Explain = () => {
    const [datasetId, setDatasetId] = useState(null);
    const [modelId, setModelId] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aiSummary, setAiSummary] = useState(null);

    useEffect(() => {
        const dId = localStorage.getItem('dataset_id');
        // Ideally we get the best model ID from local storage too, or let user pick.
        // For now, let's assume the user just trained a model and we saved it? 
        // Or we could fetch train history.
        // Let's rely on user pasting ID or selecting from a Mock "Recent Models" list if we had one.
        // Actually, Train component didn't save model_id to localStorage. Let's assume user copied it or we should save it.
        // Let's update Train.jsx to save 'best_model_id' to localStorage later.
        const mId = localStorage.getItem('best_model_id');

        setDatasetId(dId);
        setModelId(mId);
    }, []);

    const handleExplain = async () => {
        if (!datasetId || !modelId) return;
        setLoading(true);
        setError(null);
        setAiSummary(null);

        try {
            const res = await axios.post('http://localhost:8000/explain/', {
                dataset_id: datasetId,
                model_id: modelId
            });
            setExplanation(res.data);

            // Trigger AI Summary
            generateAiSummary(res.data.feature_importance);

        } catch (err) {
            setError("Explanation failed. Ensure model ID is valid.");
        } finally {
            setLoading(false);
        }
    };

    const generateAiSummary = async (importanceData) => {
        try {
            const topFeatures = importanceData.slice(0, 3).map(f => f.feature).join(', ');
            const context = `Top 3 important features are: ${topFeatures}.`;
            const res = await axios.post('http://localhost:8000/insight/', {
                context: context,
                query: "What do these features imply? Provide a brief narrative."
            });
            setAiSummary(res.data.response);
        } catch (err) {
            console.error("AI Summary failed", err);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Explainability</h1>
                <p className="mt-2 text-gray-500">Understand why the model makes its predictions (SHAP values).</p>
            </div>

            {!modelId && (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl">
                    No model found. Please go to the <strong>Train</strong> tab and train a model first.
                </div>
            )}

            {modelId && (
                <button
                    onClick={handleExplain}
                    disabled={loading}
                    className="px-6 py-2 bg-electric-blue text-white rounded-lg hover:bg-slate-700 transition"
                >
                    {loading ? 'Analyzing...' : 'Generate Explanations'}
                </button>
            )}

            {error && <div className="text-red-500">{error}</div>}

            {explanation && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                        <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={explanation.feature_importance} layout="vertical" margin={{ left: 40, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis dataKey="feature" type="category" width={120} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="importance" fill="#007AFF" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                            <span>✨</span> AI Insight
                        </h3>
                        {aiSummary ? (
                            <p className="text-indigo-800 leading-relaxed whitespace-pre-line">
                                {aiSummary}
                            </p>
                        ) : (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                                <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Explain;
