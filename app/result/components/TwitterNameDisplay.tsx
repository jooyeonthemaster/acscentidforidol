import React from 'react';
import { motion } from 'framer-motion';

interface TwitterNameDisplayProps {
  twitterName: string;
}

export const TwitterNameDisplay: React.FC<TwitterNameDisplayProps> = ({ twitterName }) => {
  if (!twitterName) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-5"
    >
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center">
          <div className="mr-3 text-2xl">⭐</div>
          <div>
            <div className="font-bold text-gray-800 text-lg">{twitterName}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};