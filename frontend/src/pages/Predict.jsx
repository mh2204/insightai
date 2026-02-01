import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Predict = () => {
    const [datasetId, setDatasetId] = useState(null);
    const [modelId, setModelId] = useState(null);
    const [columns, setColumns] = useState([]);
    const [formData, setFormData] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [target, setTarget] = useState(null);

    useEffect(() => {
        const dId = localStorage.getItem('dataset_id');
        const mId = localStorage.getItem('best_model_id');
        setDatasetId(dId);
        setModelId(mId);

        if (mId) {
            // Fetch model metadata to know exactly what to ask for
            axios.get(`http://localhost:8000/predict/metadata/${mId}`)
                .then(res => {
                    // Use input_schema if available (new robust way), else fallback to features (old way)
                    setColumns(res.data.input_schema && res.data.input_schema.length > 0
                        ? res.data.input_schema
                        : res.data.features);
                    setTarget(res.data.target);
                })
                .catch(err => {
                    console.error("Failed to fetch model metadata", err);
                    // Fallback to dataset profile if metadata fails (unlikely if flow is followed)
                    if (dId) {
                        axios.get(`http://localhost:8000/data/profile/${dId}`)
                            .then(p => setColumns(p.data.columns))
                            .catch(e => console.error(e));
                    }
                });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPrediction(null);

        // Convert types (simple heuristic: if it looks like a number, parse it)
        const features = {};
        for (const [key, value] of Object.entries(formData)) {
            if (!isNaN(value) && value !== '') {
                features[key] = parseFloat(value);
            } else {
                features[key] = value;
            }
        }

        try {
            const res = await axios.post('http://localhost:8000/predict/', {
                model_id: modelId,
                features: features
            });
            setPrediction(res.data);
        } catch (err) {
            setError("Prediction failed. " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Make Predictions</h1>
                <p className="mt-2 text-gray-500">
                    Predicting <span className="font-bold text-electric-blue">{target || 'Target'}</span> based on your inputs.
                </p>
            </div>

            {!modelId && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl">
                    No model available. Please train a model first.
                </div>
            )}

            {modelId && columns.length > 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {columns.map(field => {
                            // field might be a simple string (old fallback) or a schema object
                            const isSchema = typeof field === 'object';
                            const label = isSchema ? field.name : field;
                            const type = isSchema ? field.type : 'numeric';
                            const options = isSchema ? field.options : [];

                            if (label === target) return null; // Double check to hide target

                            return (
                                <div key={label}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

                                    {type === 'categorical' && options.length > 0 ? (
                                        <select
                                            name={label}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-electric-blue focus:ring-electric-blue sm:text-sm p-2 border"
                                            onChange={handleChange}
                                        >
                                            <option value="">Select {label}...</option>
                                            {options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={type === 'numeric' ? 'number' : 'text'}
                                            name={label}
                                            step="any"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-electric-blue focus:ring-electric-blue sm:text-sm p-2 border"
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            );
                        })}
                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-electric-blue text-white font-medium rounded-lg hover:bg-blue-600 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {loading ? 'Computing...' : 'Run Prediction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {prediction && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl text-center"
                >
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Predicted Outcome</h3>
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        {typeof prediction.prediction === 'number'
                            ? prediction.prediction.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : prediction.prediction}
                    </div>
                    {prediction.probabilities && (
                        <div className="mt-4 text-sm text-gray-400">
                            Confidence: {(Math.max(...prediction.probabilities) * 100).toFixed(1)}%
                        </div>
                    )}
                </motion.div>
            )}

            {error && <div className="text-red-500 text-center">{error}</div>}
        </div>
    );
};

export default Predict;
