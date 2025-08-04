import React from 'react';

interface ActionButtonsProps {
  onFeedback: () => void;
  onRestart: () => void;
  t: (key: string) => string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onFeedback, onRestart, t }) => {
  return (
    <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-gray-200">
      <button
        onClick={onFeedback}
        className="px-4 py-2.5 bg-yellow-400 text-gray-900 rounded-full font-bold text-sm hover:bg-yellow-500 transition-colors shadow-sm"
      >
        {t('result.feedback')}
      </button>
      <button
        onClick={onRestart}
        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
      >
        {t('result.restart')}
      </button>
    </div>
  );
};