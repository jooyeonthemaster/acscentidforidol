import * as XLSX from 'xlsx';
import { Perfume, Scent, PerfumeCharacteristics, PerfumeCategory } from '../types/perfume';
import { determinePerfumeCategory } from './perfumeUtils';

/**
 * 엑셀 데이터에서 향수 정보를 파싱합니다.
 */
export function parsePerfumeExcel(filePath: string): Perfume[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data.map((row: any) => {
    // 특성 점수
    const characteristics: PerfumeCharacteristics = {
      citrus: Number(row['시트러스']),
      floral: Number(row['플로럴']),
      woody: Number(row['우디']),
      musk: Number(row['머스크']),
      fruity: Number(row['프루티']),
      spicy: Number(row['스파이시'])
    };
    
    // 카테고리 결정
    const category = determinePerfumeCategory(characteristics);
    
    // 향수 객체 생성
    const perfume: Perfume = {
      id: row['아이디'],
      name: row['메인 향'],
      mainScent: {
        name: row['메인 향'],
        description: row['메인 향 설명'] || ''
      },
      subScent1: {
        name: row['서브향 1'],
        description: row['서브향 1 설명'] || ''
      },
      subScent2: {
        name: row['서브향 2'],
        description: row['서브향 2 설명'] || ''
      },
      characteristics,
      category,
      description: row['향 묘사'] || '',
      recommendation: row['추천문구'] || ''
    };
    
    return perfume;
  });
}

/**
 * 파싱한 향수 데이터를 TypeScript 파일로 저장합니다.
 * 개발 환경에서만 사용합니다.
 */
export function generatePerfumeDataFile(perfumes: Perfume[], outputPath: string): void {
  // 실제 구현은 Node.js 환경에서 fs 모듈을 사용해야 합니다.
  // 여기서는 예시로만 제공합니다.
  console.log(`${perfumes.length}개의 향수 데이터를 ${outputPath}에 저장하였습니다.`);
}