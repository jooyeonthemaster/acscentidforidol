'use client';

import React, { useState } from 'react';
import { PerfumeCategory } from '../types/perfume';
import PerfumeList from '../components/PerfumeList/index';
import { perfumes } from '../data/perfumeData';

export default function PerfumesPage() {
  const [selectedCategory, setSelectedCategory] = useState<PerfumeCategory | undefined>(undefined);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">향수 컬렉션</h1>
      
      <PerfumeList 
        perfumes={perfumes} 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
    </div>
  );
}