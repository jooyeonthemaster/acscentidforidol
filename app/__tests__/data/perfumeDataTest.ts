import '@testing-library/jest-dom';
import { perfumes, getPerfumeById, getPerfumesByCategory } from '../../data/perfumeData';
import { Perfume } from '../../types/perfume';

describe('향수 데이터 테스트', () => {
  test('모든 향수에 필요한 속성이 존재하는지 확인', () => {
    perfumes.forEach(perfume => {
      expect(perfume).toHaveProperty('id');
      expect(perfume).toHaveProperty('name');
      expect(perfume).toHaveProperty('mainScent');
      expect(perfume).toHaveProperty('subScent1');
      expect(perfume).toHaveProperty('subScent2');
      expect(perfume).toHaveProperty('characteristics');
      expect(perfume).toHaveProperty('category');
      expect(perfume).toHaveProperty('description');
      expect(perfume).toHaveProperty('recommendation');
    });
  });

  test('향수 특성 점수가 올바른 범위인지 확인', () => {
    perfumes.forEach(perfume => {
      const { characteristics } = perfume;
      expect(characteristics.citrus).toBeGreaterThanOrEqual(0);
      expect(characteristics.citrus).toBeLessThanOrEqual(10);
      
      expect(characteristics.floral).toBeGreaterThanOrEqual(0);
      expect(characteristics.floral).toBeLessThanOrEqual(10);
      
      expect(characteristics.woody).toBeGreaterThanOrEqual(0);
      expect(characteristics.woody).toBeLessThanOrEqual(10);
      
      expect(characteristics.musk).toBeGreaterThanOrEqual(0);
      expect(characteristics.musk).toBeLessThanOrEqual(10);
      
      expect(characteristics.fruity).toBeGreaterThanOrEqual(0);
      expect(characteristics.fruity).toBeLessThanOrEqual(10);
      
      expect(characteristics.spicy).toBeGreaterThanOrEqual(0);
      expect(characteristics.spicy).toBeLessThanOrEqual(10);
    });
  });

  test('getPerfumeById 함수가 올바르게 작동하는지 확인', () => {
    const id = perfumes[0].id;
    const perfume = getPerfumeById(id);
    expect(perfume).toBeDefined();
    expect(perfume?.id).toBe(id);
    
    const nonExistentPerfume = getPerfumeById('non-existent-id');
    expect(nonExistentPerfume).toBeUndefined();
  });

  test('getPerfumesByCategory 함수가 올바르게 작동하는지 확인', () => {
    // 기존 카테고리 중 하나를 선택
    const category = perfumes[0].category;
    const perfumesByCategory = getPerfumesByCategory(category);
    
    expect(perfumesByCategory.length).toBeGreaterThan(0);
    perfumesByCategory.forEach(perfume => {
      expect(perfume.category).toBe(category);
    });
    
    // 존재하지 않는 카테고리의 경우 빈 배열 반환
    const nonExistentCategory = 'non-existent-category';
    const emptyResult = getPerfumesByCategory(nonExistentCategory as any);
    expect(emptyResult).toEqual([]);
  });

  test('전체 향수 데이터의 개수 확인', () => {
    expect(perfumes.length).toBe(30);
  });
}); 