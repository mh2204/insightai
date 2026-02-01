import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#FFCC00', '#4CD964'];

const Analyze = () => {
    const [datasetId, setDatasetId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        const storedId = localStorage.getItem('dataset_id');
        if (storedId) {
            setDatasetId(storedId);
            // Optionally fetch profile if ID exists
            axios.get(`http://localhost:8000/data/profile/${storedId}`)
                .then(res => setProfile(res.data))
                .catch(err => console.error(err));
        }
    }, []);

    const handleUpload = async (file) => {
        setLoading(true);
        setError(null);
        // ... (upload logic stays same, simplifiying for diff if possible but creating full replacement for safety)
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await axios.post('http://localhost:8000/data/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const id = uploadRes.data.dataset_id;
            setDatasetId(id);
            localStorage.setItem('dataset_id', id);

            const profileRes = await axios.get(`http://localhost:8000/data/profile/${id}`);
            setProfile(profileRes.data);
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
                    className="space-y-6"
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
