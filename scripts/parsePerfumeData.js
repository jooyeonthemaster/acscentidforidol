/**
 * 이 스크립트는 엑셀 파일에서 향수 데이터를 파싱하여 TypeScript 파일로 변환합니다.
 * 
 * 사용법:
 * node scripts/parsePerfumeData.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 엑셀 파일 경로
const excelFilePath = path.join(__dirname, '../app/data/향료 데이터.xlsx');
// 출력 파일 경로
const outputFilePath = path.join(__dirname, '../app/data/perfumeData.ts');

// 엑셀 파일 읽기
function parsePerfumeExcel() {
  try {
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const perfumes = data.map((row) => {
      // 특성 점수
      const characteristics = {
        citrus: Number(row['시트러스']),
        floral: Number(row['플로럴']),
        woody: Number(row['우디']),
        musk: Number(row['머스크']),
        fruity: Number(row['프루티']),
        spicy: Number(row['스파이시'])
      };
      
      // 카테고리 결정 (특성 점수 중 가장 높은 점수를 가진 카테고리 선택)
      const entries = Object.entries(characteristics);
      const maxEntry = entries.reduce((max, current) => 
        current[1] > max[1] ? current : max, 
        ['citrus', 0]
      );
      const category = maxEntry[0];
      
      // 향수 객체 생성
      return {
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
    });
    
    return perfumes;
  } catch (error) {
    console.error('엑셀 파일을 읽는 중 오류가 발생했습니다:', error);
    return [];
  }
}

// TypeScript 파일 생성
function generatePerfumeDataFile(perfumes) {
  const fileContent = `// 자동 생성된 파일입니다. 수정하지 마세요.
import { Perfume } from '../types/perfume';

// 향수 데이터
export const perfumes: Perfume[] = ${JSON.stringify(perfumes, null, 2)};

// 향수 ID로 향수 찾기
export function getPerfumeById(id: string): Perfume | undefined {
  return perfumes.find(perfume => perfume.id === id);
}

// 카테고리별 향수 가져오기
export function getPerfumesByCategory(category: string): Perfume[] {
  return perfumes.filter(perfume => perfume.category === category);
}
`;

  try {
    fs.writeFileSync(outputFilePath, fileContent);
    console.log(`${perfumes.length}개의 향수 데이터가 ${outputFilePath}에 저장되었습니다.`);
  } catch (error) {
    console.error('파일 저장 중 오류가 발생했습니다:', error);
  }
}

// 스크립트 실행
const perfumes = parsePerfumeExcel();
if (perfumes.length > 0) {
  generatePerfumeDataFile(perfumes);
} else {
  console.log('변환할 향수 데이터가 없습니다.');
}