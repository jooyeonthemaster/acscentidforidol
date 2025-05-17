import '@testing-library/jest-dom';
import perfumePersonas from '../../data/perfumePersonas';
import { PerfumePersona } from '../../types/perfume';

describe('향수 페르소나 테스트', () => {
  // 향수 페르소나 데이터 구조 확인
  const { personas, traitDescriptions, categoryDescriptions } = perfumePersonas;

  test('모든 향수 페르소나에 필요한 속성이 존재하는지 확인', () => {
    personas.forEach(persona => {
      expect(persona).toHaveProperty('id');
      expect(persona).toHaveProperty('name');
      expect(persona).toHaveProperty('description');
      expect(persona).toHaveProperty('traits');
      expect(persona).toHaveProperty('categories');
      expect(persona).toHaveProperty('keywords');
      expect(persona).toHaveProperty('imageAssociations');
      expect(persona).toHaveProperty('primaryColor');
      expect(persona).toHaveProperty('secondaryColor');
      expect(persona).toHaveProperty('matchingColorPalette');
    });
  });

  test('특성 점수가 올바른 범위인지 확인', () => {
    personas.forEach(persona => {
      const { traits } = persona;
      
      expect(traits.sexy).toBeGreaterThanOrEqual(1);
      expect(traits.sexy).toBeLessThanOrEqual(10);
      
      expect(traits.cute).toBeGreaterThanOrEqual(1);
      expect(traits.cute).toBeLessThanOrEqual(10);
      
      expect(traits.charisma).toBeGreaterThanOrEqual(1);
      expect(traits.charisma).toBeLessThanOrEqual(10);
      
      expect(traits.darkness).toBeGreaterThanOrEqual(1);
      expect(traits.darkness).toBeLessThanOrEqual(10);
      
      expect(traits.freshness).toBeGreaterThanOrEqual(1);
      expect(traits.freshness).toBeLessThanOrEqual(10);
      
      expect(traits.elegance).toBeGreaterThanOrEqual(1);
      expect(traits.elegance).toBeLessThanOrEqual(10);
      
      expect(traits.freedom).toBeGreaterThanOrEqual(1);
      expect(traits.freedom).toBeLessThanOrEqual(10);
      
      expect(traits.luxury).toBeGreaterThanOrEqual(1);
      expect(traits.luxury).toBeLessThanOrEqual(10);
      
      expect(traits.purity).toBeGreaterThanOrEqual(1);
      expect(traits.purity).toBeLessThanOrEqual(10);
      
      expect(traits.uniqueness).toBeGreaterThanOrEqual(1);
      expect(traits.uniqueness).toBeLessThanOrEqual(10);
    });
  });

  test('카테고리 점수가 올바른 범위인지 확인', () => {
    personas.forEach(persona => {
      const { categories } = persona;
      
      expect(categories.citrus).toBeGreaterThanOrEqual(1);
      expect(categories.citrus).toBeLessThanOrEqual(10);
      
      expect(categories.floral).toBeGreaterThanOrEqual(1);
      expect(categories.floral).toBeLessThanOrEqual(10);
      
      expect(categories.woody).toBeGreaterThanOrEqual(1);
      expect(categories.woody).toBeLessThanOrEqual(10);
      
      expect(categories.musky).toBeGreaterThanOrEqual(1);
      expect(categories.musky).toBeLessThanOrEqual(10);
      
      expect(categories.fruity).toBeGreaterThanOrEqual(1);
      expect(categories.fruity).toBeLessThanOrEqual(10);
      
      expect(categories.spicy).toBeGreaterThanOrEqual(0);
      expect(categories.spicy).toBeLessThanOrEqual(10);
    });
  });

  test('키워드와 이미지 연관성이 존재하는지 확인', () => {
    personas.forEach(persona => {
      expect(persona.keywords.length).toBeGreaterThan(0);
      expect(persona.imageAssociations.length).toBeGreaterThan(0);
    });
  });

  test('색상 정보가 올바른 형식인지 확인', () => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    personas.forEach(persona => {
      expect(hexColorRegex.test(persona.primaryColor)).toBeTruthy();
      expect(hexColorRegex.test(persona.secondaryColor)).toBeTruthy();
      
      persona.matchingColorPalette.forEach(color => {
        expect(hexColorRegex.test(color)).toBeTruthy();
      });
    });
  });

  test('특성 설명이 모든 특성에 대해 존재하는지 확인', () => {
    expect(traitDescriptions).toHaveProperty('sexy');
    expect(traitDescriptions).toHaveProperty('cute');
    expect(traitDescriptions).toHaveProperty('charisma');
    expect(traitDescriptions).toHaveProperty('darkness');
    expect(traitDescriptions).toHaveProperty('freshness');
    expect(traitDescriptions).toHaveProperty('elegance');
    expect(traitDescriptions).toHaveProperty('freedom');
    expect(traitDescriptions).toHaveProperty('luxury');
    expect(traitDescriptions).toHaveProperty('purity');
    expect(traitDescriptions).toHaveProperty('uniqueness');
  });

  test('카테고리 설명이 모든 카테고리에 대해 존재하는지 확인', () => {
    expect(categoryDescriptions).toHaveProperty('citrus');
    expect(categoryDescriptions).toHaveProperty('floral');
    expect(categoryDescriptions).toHaveProperty('woody');
    expect(categoryDescriptions).toHaveProperty('musky');
    expect(categoryDescriptions).toHaveProperty('fruity');
    expect(categoryDescriptions).toHaveProperty('spicy');
  });

  test('모든 페르소나가 고유한 ID를 가지고 있는지 확인', () => {
    const ids = personas.map(persona => persona.id);
    const uniqueIds = Array.from(new Set(ids));
    // IDs.length와 uniqueIds.length가 모두 30이어야 함
    expect(ids.length).toBe(30); // 전체 ID 개수
    expect(uniqueIds.length).toBe(30); // 고유 ID 개수
  });

  test('30개의 향수 페르소나가 존재하는지 확인', () => {
    expect(personas.length).toBe(30);
  });
}); 