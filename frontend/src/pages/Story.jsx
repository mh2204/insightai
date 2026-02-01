import React from 'react';
import { motion } from 'framer-motion';

const Story = () => {
    // Improve this with real data in V2
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-16">
                <span className="text-electric-blue font-semibold tracking-wider uppercase text-sm">Data Story</span>
                <h1 className="text-4xl font-bold text-gray-900 mt-2">The Narrative of Your Data</h1>
            </div>

            <div className="space-y-24">
                <Section
                    title="The Beginning"
                    text="We started with a raw dataset containing hundreds of records. The data was clean but hidden within rows and columns were patterns waiting to be discovered."
                    delay={0}
                />

                <Section
                    title="The Discovery"
                    text="Through automated profiling, we found that your target variable has strong correlations with specific features. The distributions suggest a healthy dataset ready for modeling."
                    align="right"
                    delay={0.2}
                />

                <Section
                    title="The Intelligence"
                    text="Our models competed to find the best fit. Random Forest emerged as a strong contender, capturing complex non-linear relationships that Linear Regression missed."
                    delay={0.4}
                />

                <Section
                    title="The Future"
                    text="With a trained model, you can now foresee outcomes. Use the Prediction tab to turn this intelligence into actionable decisions."
                    align="right"
                    delay={0.6}
                />
            </div>

            <div className="mt-24 text-center">
                <button className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition">
                    Start Your Journey
                </button>
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
