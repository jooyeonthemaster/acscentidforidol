import { perfumes } from '@/app/data/perfumeData';
import { SpecificScent, PerfumeCategory } from '@/app/types/perfume';
import { determineCategory } from '../constants/categories';
import perfumePersonas from '@/app/data/perfumePersonas';

// 향료 ID를 원래 형식 그대로 반환하는 함수
export const formatScentCode = (id: string): string => {
  // ID가 이미 형식에 맞는 경우 그대로 반환
  if (id && id.includes('-')) {
    return id;
  }
  
  // ID가 없거나 형식이 맞지 않는 경우
  return id || 'UNKNOWN-ID';
};

// perfumePersonas.ts에서 향료 데이터 추출
export const generateAvailableScents = (): SpecificScent[] => {
  const scentsMap = new Map();
  
  // perfumePersonas에서 향료 정보 추출
  perfumePersonas.personas.forEach(persona => {
    // 각 페르소나에 대해 ID와 이름 추출
    const id = persona.id;
    const name = persona.name;
    
    // 가장 높은 점수를 가진 카테고리 찾기
    let highestCategory: PerfumeCategory = 'woody';
    let highestScore = 0;
    
    Object.entries(persona.categories).forEach(([category, score]) => {
      if (score > highestScore) {
        highestScore = score as number;
        highestCategory = category as PerfumeCategory;
      }
    });
    
    // 향료 정보 맵에 추가
    if (!scentsMap.has(id)) {
      scentsMap.set(id, {
        id: id,
        name: name,
        category: highestCategory,
        description: persona.description.substring(0, 50) + '...' // 설명은 앞부분 일부만 사용
      });
    }
  });
  
  return Array.from(scentsMap.values());
};