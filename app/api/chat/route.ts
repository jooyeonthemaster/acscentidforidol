import { NextRequest, NextResponse } from 'next/server';
import { askGemini } from '../../utils/gemini';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: '메시지가 필요합니다.' }, { status: 400 });
    }
    
    const response = await askGemini(message, history);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}