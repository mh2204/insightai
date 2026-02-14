import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    ScatterChart, Scatter, ZAxis
} from 'recharts';

const COLORS = ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#FFCC00', '#4CD964'];

const Analyze = () => {
    const [datasetId, setDatasetId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Scatter plot state
    const [scatterX, setScatterX] = useState('');
    const [scatterY, setScatterY] = useState('');
    const [scatterData, setScatterData] = useState([]);

    useEffect(() => {
        const storedId = localStorage.getItem('dataset_id');
        if (storedId) {
            setDatasetId(storedId);
            fetchProfile(storedId);
        }
    }, []);

    const fetchProfile = (id) => {
        axios.get(`http://localhost:8000/data/profile/${id}`)
            .then(res => {
                setProfile(res.data);
                // Set default scatter axes if numeric columns exist
                const numericCols = Object.keys(res.data.dtypes).filter(col =>
                    res.data.dtypes[col].includes('int') || res.data.dtypes[col].includes('float')
                );
                if (numericCols.length >= 2) {
                    setScatterX(numericCols[0]);
                    setScatterY(numericCols[1]);
                }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (datasetId && scatterX && scatterY) {
            axios.get(`http://localhost:8000/data/scatter/${datasetId}?x=${scatterX}&y=${scatterY}`)
                .then(res => setScatterData(res.data))
                .catch(err => console.error(err));
        }
    }, [datasetId, scatterX, scatterY]);

    const handleUpload = async (file) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await axios.post('http://localhost:8000/data/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const id = uploadRes.data.dataset_id;
            setDatasetId(id);
            localStorage.setItem('dataset_id', id);

            fetchProfile(id);
        } catch (err) {
            console.error(err);
            setError("Failed to upload or analyze dataset. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const typeData = profile ? Object.entries(profile.dtypes).reduce((acc, [col, type]) => {
        const t = String(type);
        const key = t.includes('int') || t.includes('float') ? 'Numeric' : 'Categorical';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {}) : {};

    const pieData = Object.entries(typeData).map(([name, value]) => ({ name, value }));

    const missingData = profile ? Object.entries(profile.missing)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }))
        : [];

    const getCorrelationColor = (value) => {
        const val = Math.abs(value);
        if (val >= 0.8) return 'bg-blue-600 text-white';
        if (val >= 0.6) return 'bg-blue-400 text-white';
        if (val >= 0.4) return 'bg-blue-200 text-gray-800';
        if (val >= 0.2) return 'bg-blue-50 text-gray-800';
        return 'bg-gray-50 text-gray-400';
    };

    const numericColumns = profile ? Object.keys(profile.dtypes).filter(col =>
        String(profile.dtypes[col]).includes('int') || String(profile.dtypes[col]).includes('float')
    ) : [];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Data Analysis</h1>
                <p className="mt-2 text-gray-500">Upload your dataset to get instant insights.</p>
            </div>

            {!datasetId && !loading && (
                <FileUpload onUpload={handleUpload} />
            )}

            {datasetId && (
                <div className="flex justify-end">
                    <button
                        onClick={() => { setDatasetId(null); setProfile(null); localStorage.removeItem('dataset_id'); }}
                        className="text-sm text-gray-500 hover:text-electric-blue underline"
                    >
                        Upload a different dataset
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500">Crunching the numbers...</p>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-center border border-red-100">
                    {error}
                </div>
            )}

            {profile && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="space-y-8"
                >
                    {/* Key Metrics Row */}
                    <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Rows</p>
                            <p className="text-2xl font-bold text-gray-900">{profile.description?.ID?.count || profile.shape?.[0] || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Columns</p>
                            <p className="text-2xl font-bold text-gray-900">{profile.columns.length}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Missing Values</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {Object.values(profile.missing).reduce((a, b) => a + b, 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Numeric Features</p>
                            <p className="text-2xl font-bold text-gray-900">{pieData.find(d => d.name === 'Numeric')?.value || 0}</p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Data Composition */}
                        <motion.div
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
                            whileHover={{ y: -2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Composition</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Missing Values */}
                        <motion.div
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
                            whileHover={{ y: -2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Missing Values</h3>
                            {missingData.length > 0 ? (
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={missingData} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                            <Bar dataKey="value" fill="#FF2D55" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">
                                    No missing values found! 🎉
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Correlation Heatmap */}
                    {profile.correlations && (
                        <motion.div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Correlation Matrix</h3>
                            <div className="min-w-max">
                                <div className="flex">
                                    <div className="w-24"></div>
                                    {Object.keys(profile.correlations).map(col => (
                                        <div key={col} className="w-24 text-xs font-medium text-gray-500 text-center rotate-45 origin-bottom-left transform translate-x-4 mb-8">
                                            {col.length > 10 ? col.substring(0, 10) + '...' : col}
                                        </div>
                                    ))}
                                </div>
                                {Object.keys(profile.correlations).map(row => (
                                    <div key={row} className="flex items-center">
                                        <div className="w-24 text-xs font-medium text-gray-500 truncate" title={row}>{row}</div>
                                        {Object.keys(profile.correlations).map(col => {
                                            const val = profile.correlations[row][col];
                                            return (
                                                <div
                                                    key={`${row}-${col}`}
                                                    className={`w-24 h-12 flex items-center justify-center text-xs font-semibold ${getCorrelationColor(val)}`}
                                                    title={`${row} vs ${col}: ${val.toFixed(2)}`}
                                                >
                                                    {val.toFixed(2)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Scatter Plot Section */}
                    <motion.div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Variable Relationship Explorer</h3>
                            <div className="flex space-x-4">
                                <select
                                    className="border rounded-md px-3 py-1 text-sm text-gray-700"
                                    value={scatterX}
                                    onChange={(e) => setScatterX(e.target.value)}
                                >
                                    {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                                <span className="text-gray-400">vs</span>
                                <select
                                    className="border rounded-md px-3 py-1 text-sm text-gray-700"
                                    value={scatterY}
                                    onChange={(e) => setScatterY(e.target.value)}
                                >
                                    {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey={scatterX} name={scatterX} label={{ value: scatterX, position: 'insideBottomRight', offset: -10 }} />
                                    <YAxis type="number" dataKey={scatterY} name={scatterY} label={{ value: scatterY, angle: -90, position: 'insideLeft' }} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Data Points" data={scatterData} fill="#007AFF" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Detailed Stats Grid */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Statistics</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean/Top</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.keys(profile.dtypes).slice(0, 10).map((col) => {
                                        const stats = profile.description[col] || {};
                                        return (
                                            <tr key={col}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{col}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(profile.dtypes[col])}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.missing[col]}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.unique || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {stats.mean ? Number(stats.mean).toFixed(2) : (stats.top || '-')}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {Object.keys(profile.dtypes).length > 10 && (
                                <div className="text-center mt-4 text-sm text-gray-400">
                                    Showing first 10 columns...
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Analyze;
