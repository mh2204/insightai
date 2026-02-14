import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Story = () => {
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [datasetId, setDatasetId] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem('dataset_id');
        if (id) {
            setDatasetId(id);
            fetchStory(id);
        }
    }, []);

    const fetchStory = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`http://localhost:8000/insight/story/${id}`);
            if (res.data.story) {
                // Handle fallback structure
                setStory(res.data.story); // array of sections
            } else if (res.data.sections) {
                // Handle AI structure
                setStory(res.data.sections);
            } else {
                setStory([]);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to generate story. Please ensure a dataset is uploaded.");
        } finally {
            setLoading(false);
        }
    };

    if (!datasetId) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Story to Tell (Yet)</h2>
                <p className="text-gray-500 mb-8">Upload a dataset in the Analyze tab to generate your data story.</p>
                <Link to="/analyze" className="px-6 py-3 bg-electric-blue text-white rounded-full hover:bg-blue-600 transition">
                    Go to Analyze
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                <h2 className="mt-8 text-xl font-semibold text-gray-900">Crafting your narrative...</h2>
                <p className="text-gray-500">Our AI is analyzing patterns and writing the story.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="p-4 bg-red-50 text-red-600 rounded-xl inline-block mb-4">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-16">
                <span className="text-electric-blue font-semibold tracking-wider uppercase text-sm">Data Story</span>
                <h1 className="text-4xl font-bold text-gray-900 mt-2">The Narrative of Your Data</h1>
            </div>

            <div className="space-y-24">
                {story && story.map((section, index) => (
                    <Section
                        key={index}
                        title={section.title}
                        text={section.text}
                        align={index % 2 === 1 ? 'right' : 'left'} // Alternating alignment
                        delay={index * 0.2}
                    />
                ))}
            </div>

            <div className="mt-24 text-center">
                <Link to="/predict">
                    <button className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition">
                        Start Your Journey with Predictions
                    </button>
                </Link>
            </div>
        </div>
    );
};

const Section = ({ title, text, align = 'left', delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay }}
        className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
    >
        <div className="w-16 h-1 bg-gradient-to-r from-electric-blue to-indigo-600 mb-6"></div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-xl text-gray-500 max-w-lg leading-relaxed">{text}</p>
    </motion.div>
);

export default Story;
