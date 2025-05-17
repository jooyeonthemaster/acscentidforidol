import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Perfume } from '@/utils/perfume';

// 서버 사이드에서만 실행되므로 fs 모듈 사용 가능
export function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'perfumes.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const perfumes: Perfume[] = JSON.parse(fileContents);

    return NextResponse.json({ perfumes });
  } catch (error) {
    console.error('향수 데이터 API 오류:', error);
    return NextResponse.json(
      { error: '향수 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}