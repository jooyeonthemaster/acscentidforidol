import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Perfume } from '@/utils/perfume';
import perfumePersonas from '@/app/data/perfumePersonas';

export function GET(request: NextRequest) {
  try {
    // URL에서 id 파라미터 추출
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log(`향수 API 요청: id=${id}`);

    if (!id) {
      return NextResponse.json(
        { error: '향수 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일에서 향수 데이터 불러오기
    try {
      // 1. 먼저 perfumePersonas에서 찾기
      const personaMatch = perfumePersonas.personas.find(p => p.id === id);
      
      if (personaMatch) {
        console.log(`perfumePersonas에서 향수 찾음: ${id}`);
        // persona 데이터를 Perfume 형식으로 변환하고, 원본 persona 객체도 포함
        const perfume: Perfume & { persona?: any } = {
          id: personaMatch.id,
          name: personaMatch.name,
          description: personaMatch.description || `${personaMatch.name} 향수입니다.`,
          mood: personaMatch.keywords?.join(', ') || '',
          personality: '개성있는 매력을 가진 사람에게 어울립니다.',
          // 원본 persona 객체 추가
          persona: personaMatch
        };
        
        console.log(`향수 정보 반환 (persona 포함): ${id}`);
        return NextResponse.json({ perfume });
      }
      
      // 2. 기존 perfumes.json에서 찾기
      const filePath = path.join(process.cwd(), 'data', 'perfumes.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const perfumes: Perfume[] = JSON.parse(fileContents);

      // ID로 향수 찾기
      const perfume = perfumes.find(p => p.id === id);

      if (!perfume) {
        console.log(`향수를 찾을 수 없음: ${id}`);
        
        // 3. 마지막으로 perfumePersonas 전체에서 부분 일치 검색 시도
        const partialMatch = perfumePersonas.personas.find(p => 
          p.id.includes(id) || id.includes(p.id.split('-')[0])
        );
        
        if (partialMatch) {
          console.log(`부분 일치 향수 찾음: ${partialMatch.id}`);
          const perfume: Perfume & { persona?: any } = {
            id: partialMatch.id,
            name: partialMatch.name,
            description: partialMatch.description || `${partialMatch.name} 향수입니다.`,
            mood: partialMatch.keywords?.join(', ') || '',
            personality: '개성있는 매력을 가진 사람에게 어울립니다.',
            persona: partialMatch
          };
          
          return NextResponse.json({ perfume });
        }
        
        return NextResponse.json(
          { error: '해당 ID의 향수를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      console.log(`perfumes.json에서 향수 찾음: ${id}`);
      return NextResponse.json({ perfume });
    } catch (readError) {
      console.error('향수 데이터 읽기 오류:', readError);
      
      // 기본 향수 데이터 생성
      const defaultPerfume: Perfume = {
        id: id,
        name: id.split('-')[0],
        description: '매력적인 향수입니다.',
        mood: '상큼한, 매력적인',
        personality: '개성 있는 사람에게 어울립니다.'
      };
      
      // 부분 일치로 찾아보기
      try {
        const partialMatch = perfumePersonas.personas.find(p => 
          p.id.includes(id.split('-')[0]) || id.includes(p.id.split('-')[0])
        );
        
        if (partialMatch) {
          console.log(`부분 일치 향수 찾음: ${partialMatch.id}`);
          return NextResponse.json({ 
            perfume: {
              ...defaultPerfume,
              id: partialMatch.id,
              name: partialMatch.name,
              description: partialMatch.description || defaultPerfume.description,
              mood: partialMatch.keywords?.join(', ') || defaultPerfume.mood,
              persona: partialMatch
            } 
          });
        }
      } catch (e) {
        console.warn('부분 일치 검색 오류:', e);
      }
      
      console.log(`기본 향수 데이터 생성: ${id}`);
      return NextResponse.json({ perfume: defaultPerfume });
    }
  } catch (error) {
    console.error('향수 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}