import { perfumes } from '@/app/data/perfumeData';
import { SpecificScent, PerfumeCategory } from '@/app/types/perfume';
import { determineCategory } from '../constants/categories';
import perfumePersonas from '@/app/data/perfumePersonas';

// 향료 이름으로 ID를 찾는 함수
export const findScentIdByName = (name: string): string | undefined => {
  const persona = perfumePersonas.personas.find(p => p.name === name);
  return persona?.id;
};

// ID로 향료 이름을 찾는 함수
export const findScentNameById = (id: string): string | undefined => {
  const persona = perfumePersonas.personas.find(p => p.id === id);
  return persona?.name;
};

// 향료 코드나 이름을 ID 형식으로 변환하는 함수
export const formatScentCode = (nameOrId: string): string => {
  // ID 패턴 체크 (XX-YYYYYYY 형식)
  if (nameOrId && /^[A-Z]{2}-\d+$/.test(nameOrId)) {
    return nameOrId; // 이미 ID 형식이면 그대로 반환
  }
  
  // 이름으로 ID 찾기
  const id = findScentIdByName(nameOrId);
  return id || nameOrId || 'UNKNOWN-ID';
};

// 향료 코드나 이름을 표시용 형식으로 변환 (이름 + ID)
export const formatScentDisplay = (nameOrId: string): string => {
  let id = nameOrId;
  let name = nameOrId;
  
  // ID 형식인 경우
  if (nameOrId && /^[A-Z]{2}-\d+$/.test(nameOrId)) {
    id = nameOrId;
    name = findScentNameById(id) || id;
  } 
  // 이름인 경우
  else {
    name = nameOrId;
    id = findScentIdByName(name) || 'UNKNOWN-ID';
  }
  
  return `${name} (${id})`;
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