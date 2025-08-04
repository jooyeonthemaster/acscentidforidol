import React from 'react';
import { motion } from 'framer-motion';

interface UserImageDisplayProps {
  userImage: string;
  t: (key: string) => string;
}

export const UserImageDisplay: React.FC<UserImageDisplayProps> = ({ userImage, t }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <div className="rounded-2xl overflow-hidden border-4 border-yellow-200 shadow-lg">
        <img 
          src={userImage} 
          alt={t('result.analysisResult')} 
          className="w-full h-auto object-cover"
        />
      </div>
    </motion.div>
  );
};