import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onUpload }) => {
    const onDrop = useCallback((acceptedFiles) => {
        // Determine file type and pass to parent
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/json': ['.json']
        },
        multiple: false
    });

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive
                        ? 'border-electric-blue bg-blue-50/50'
                        : 'border-gray-300 hover:border-indigo-400 bg-white hover:bg-gray-50'
                    }
        `}
            >
                <input {...getInputProps()} />
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className={`
              p-4 rounded-full bg-gradient-to-tr from-electric-blue to-indigo-600 shadow-lg
              ${isDragActive ? 'animate-bounce' : ''}
            `}>
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-xl font-medium text-gray-900">
                            {isDragActive ? 'Drop your dataset here' : 'Upload your dataset'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            CSV, Excel, or JSON (max 50MB)
                        </p>
                    </div>
                    <button className="px-6 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        Browse Files
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default FileUpload;
