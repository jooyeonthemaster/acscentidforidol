import React from 'react';

interface TabNavigationProps {
  activeTab: 'analysis' | 'perfume';
  onTabChange: (tab: 'analysis' | 'perfume') => void;
  t: (key: string) => string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, t }) => {
  return (
    <div className="flex mb-6 border-b border-gray-200">
      <button 
        className={`flex-1 px-3 py-2 text-sm ${activeTab === 'analysis' ? 'border-b-2 border-yellow-400 text-gray-900 font-medium' : 'text-gray-700'}`}
        onClick={() => onTabChange('analysis')}
      >
        {t('result.tab.analysis')}
      </button>
      <button 
        className={`flex-1 px-3 py-2 text-sm ${activeTab === 'perfume' ? 'border-b-2 border-yellow-400 text-gray-900 font-medium' : 'text-gray-700'}`}
        onClick={() => onTabChange('perfume')}
      >
        {t('result.tab.perfume')}
      </button>
    </div>
  );
};