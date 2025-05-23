// pages/test-firebase.js
import { saveImageAnalysis } from '../lib/firebaseApi';

function TestFirebasePage() {
  const handleSaveAnalysis = async () => {
    const userId = 'testUser123'; // 실제로는 로그인된 사용자 ID를 사용해야 합니다.
    const analysisResult = {
      imageUrl: 'http://example.com/image.jpg',
      mood: 'happy',
      elements: ['flower', 'sunshine'],
      apiResponse: { someData: 'data from analysis API' } // 실제 분석 API 응답
    };
    try {
      const analysisId = await saveImageAnalysis(userId, analysisResult);
      alert(`분석 결과가 Firebase에 저장되었습니다! ID: ${analysisId}`);
      console.log(`Analysis saved with ID: ${analysisId}`);
    } catch (error) {
      alert('Firebase 저장 중 오류 발생');
      console.error('Error saving to Firebase:', error);
    }
  };

  return (
    <div>
      <h1>Firebase 데이터 저장 테스트</h1>
      <button 
        onClick={handleSaveAnalysis} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        분석 결과 저장하기
      </button>
      <p>버튼을 누르면 testUser123 사용자로 샘플 분석 결과가 Firebase에 저장됩니다.</p>
    </div>
  );
}

export default TestFirebasePage; 