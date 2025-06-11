'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translatePage as translateDOM, observeAndTranslate } from '@/app/utils/realtimeTranslator';

// 번역 딕셔너리 타입
export interface TranslationDictionary {
  [key: string]: string;
}

// Context 타입
interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  isTranslating: boolean;
  translatedTexts: TranslationDictionary;
  translatePage: () => Promise<void>;
}

// 기본 한국어 텍스트 딕셔너리
const DEFAULT_TEXTS: TranslationDictionary = {
  // 헤더/네비게이션
  'service.title': 'AC\'SCENT IDENTITY',
  'service.subtitle': '뿌리는 덕질',
  'service.description': '언제 어디서든 최애를 떠올릴 수 있도록 향으로 뿌리는 덕질, 뿌덕뿌덕~ 💕',
  
  // 랜딩페이지
  'landing.target.title': '이런 덕후들에게 추천해요!',
  'landing.target.1': '덕질할 때마다 나만의 향을 뿌리고 싶은 분',
  'landing.target.2': '최애의 매력을 향으로 표현하고 싶은 분',
  'landing.target.3': '최애와 나를 연결하는 시그니처 향이 필요한 분',
  
  'landing.howto.title': '덕질 향수 뿌리는 방법',
  'landing.howto.step1': '최애 정보와 나의 덕질 스타일 입력하기',
  'landing.howto.step2': '최애 사진으로 뿌덕 추천 받기',
  'landing.howto.step3': '나만의 커스텀으로 뿌덕 레시피 완성하기',
  
  'landing.cta': '덕질 향수 뿌리러 가기',
  
  // 아이돌 정보 입력 페이지 (IdolInfoForm)
  'info.title': '최애 기본 정보',
  'info.subtitle': '최애에 대한 정보를 입력해주세요',
  'info.password.label': '비밀번호 (4자리)',
  'info.password.placeholder': '4자리 숫자를 입력하세요',
  'info.name.label': '최애 이름',
  'info.name.placeholder': '예: 지수, 정국, 윈터...',
  'info.gender.label': '성별',
  'info.gender.placeholder': '성별을 선택해주세요',
  'info.gender.male': '남성',
  'info.gender.female': '여성',
  'info.style.title': '최애의 스타일',
  'info.style.subtitle': '최애가 어떤 스타일인지 선택해주세요 (복수 선택 가능)',
  'info.personality.title': '최애의 성격',
  'info.personality.subtitle': '최애가 어떤 성격인지 선택해주세요 (복수 선택 가능)',
  'info.charm.title': '최애의 매력 포인트',
  'info.charm.subtitle': '최애의 매력 포인트를 자유롭게 작성해주세요.',
  'info.charm.placeholder': '예: 눈웃음이 예쁘고, 춤을 잘 추며, 팬들을 항상 생각하는 다정한 모습이 매력적이에요.',
  'info.image.title': '최애 이미지',
  'info.image.subtitle': '최애의 이미지를 업로드해주세요. 향수 추천에 활용됩니다.',
  
  // 스타일 옵션
  'style.cute': '귀여운',
  'style.sexy': '섹시한',
  'style.chic': '시크한',
  'style.elegant': '우아한',
  'style.energetic': '활발한',
  'style.fresh': '청량한',
  'style.retro': '레트로',
  'style.casual': '캐주얼',
  
  // 성격 옵션
  'personality.bright': '밝은',
  'personality.calm': '차분한',
  'personality.funny': '유머러스한',
  'personality.shy': '수줍은',
  'personality.confident': '자신감 있는',
  'personality.thoughtful': '사려 깊은',
  'personality.passionate': '열정적인',
  'personality.caring': '다정한',
  
  // 분석 단계
  'analysis.stage.uploading': '이미지 전송 중...',
  'analysis.stage.analyzing': '이미지 분석 중...',
  'analysis.stage.processing': '특성 추출 중...',
  'analysis.stage.matching': '향수 매칭 중...',
  'analysis.stage.complete': '분석 완료!',
  
  // 결과 페이지 (ResultPage)
  'result.title': '내 최애의 향은 어떨까? 궁금궁금 스멜~',
  'result.intro': '내 최애의 향은 어떨까? 궁금궁금 스멜~',
  'result.loading': '분석 결과를 로딩 중입니다...',
  'result.tab.analysis': '분석 결과',
  'result.tab.perfume': '향수 추천',
  'result.traits.title': '특성 분석',
  'result.scent.title': '향의 특성',
  'result.keywords.title': '키워드 분석',
  'result.season': '추천 계절',
  'result.time': '추천 시간',
  'result.occasion': '추천 상황',
  'result.perfume.matching': '매칭률',
  'result.perfume.description': '향수 설명',
  'result.restart': '다시 시작하기',
  'result.feedback': '피드백 보내기',
  
  // 결과 페이지 상세
  'result.loading.title': '잠깐만요!',
  'result.loading.message': '최애의 향기를 찾는 중이에요',
  'result.error.title': '앗, 문제가 생겼어요!',
  'result.error.restart': '다시 시작하기',
  'result.analysis.title': '분석 결과',
  'result.analysis.traits': '이미지 특성 점수',
  'result.analysis.scent': '향 특성',
  'result.analysis.keywords': '매칭 키워드',
  'result.analysis.personal.color': '퍼스널 컬러',
  'result.perfume.title': '추천 향수',
  'result.perfume.match.score': '매칭 점수',
  'result.perfume.season.title': '추천 계절',
  'result.perfume.time.title': '추천 시간',
  'result.perfume.occasion.title': '추천 상황',
  'result.twitter.name': '트위터 풍 닉네임',
  'result.character.mood': '캐릭터 분위기',
  'result.analysis.mood': '이미지 분위기',
  'result.analysis.aiThought': 'AI의 생각',
  'result.analysis.core': '향수 매칭의 핵심',
  'result.analysis.style': '스타일 분석',
  'result.analysis.styleExplanation': '패션 스타일 해석',
  'result.analysis.styleDescription': '세계적인 디자이너급',
  'result.analysis.expression': '표현과 연출',
  'result.analysis.expressionDescription': '케이트 모스도 울고 갈',
  'result.analysis.concept': '스타일 콘셉트',
  'result.analysis.conceptDescription': '패션위크 런웨이급',
  'result.analysis.auraAndTone': '아우라 & 톤앤매너',
  'result.analysis.aura': '아우라',
  'result.analysis.toneAndManner': '톤앤매너',
  'result.analysis.matchingKeywords': '매칭 키워드',
  'result.analysis.keywordsDescription': '특성을 나타내는 단어들',
  'result.analysis.personalColor': '컬러 타입',
  'result.analysis.personalColorDescription': '이미지 컬러 분석',
  'result.analysis.personalColorRecommendation': '컬러 매칭 코디 추천',
  'result.analysis.personalColorRecommendationDescription': '이 톤에 맞는 컬러 추천',
  
  // 향수 관련 상세
  'result.perfume.customPerfume': '맞춤 향수',
  'result.perfume.notes': '향 노트 피라미드',
  'result.perfume.topNote': 'TOP',
  'result.perfume.middleNote': 'MID',
  'result.perfume.baseNote': 'BASE',
  'result.perfume.topNoteDefault': 'Top Note',
  'result.perfume.middleNoteDefault': 'Middle Note',
  'result.perfume.baseNoteDefault': 'Base Note',
  'result.perfume.topNoteDescription': '첫 15-20분간 지속되는 첫인상의 향',
  'result.perfume.middleNoteDescription': '3-4시간 지속되는 향수의 심장부',
  'result.perfume.baseNoteDescription': '5-6시간 이상 지속되는 잔향',
  'result.perfume.aromaTimeline': '향 발현 타임라인',
  'result.perfume.topNoteDuration': '15-20분',
  'result.perfume.middleNoteDuration': '3-4시간',
  'result.perfume.baseNoteDuration': '5-6시간+',
  'result.perfume.perfumeProfile': '향수 특성 프로필',
  'result.perfume.mainSeries': '주요 계열',
  'result.perfume.perfumeStory': '향수 매칭 스토리',
  'result.perfume.expertEvaluation': '향수 전문가의 평가',
  'result.perfume.usageRecommendation': '향수 사용 추천',
  'result.perfume.recommendedSeason': '추천 계절',
  'result.perfume.recommendedTime': '추천 시간대',
  'result.perfume.usageGuide': '이렇게 사용해보세요!',
  'result.perfume.howToUse': '어떻게 사용할까요?',
  'result.perfume.hand': '손목, 귀 뒤',
  'result.perfume.pulseLocation': '맥박이 뛰는 곳',
  'result.perfume.wear': '옷에 뿌리기',
  'result.perfume.distance': '15cm 거리에서',
  'result.perfume.spray': '공기 중 분사',
  'result.perfume.aromaCloud': '향기 구름 속으로',
  'result.perfume.lasting': '향수 지속력',
  'result.perfume.lastingDuration': '4-5시간',
  'result.perfume.lastingDescription': '지속 시간',
  'result.perfume.lastingPlus': '8시간+',
  'result.perfume.noMatch': '매칭된 향수가 없습니다. 다시 시도해주세요.',
  
  // 피드백 페이지 (Feedback)
  'feedback.title': '피드백 보내기',
  'feedback.subtitle': '서비스 개선을 위해 소중한 의견을 들려주세요',
  'feedback.rating.title': '전체적인 만족도는 어떠셨나요?',
  'feedback.rating.excellent': '매우 만족',
  'feedback.rating.good': '만족',
  'feedback.rating.normal': '보통',
  'feedback.rating.bad': '불만족',
  'feedback.rating.terrible': '매우 불만족',
  'feedback.accuracy.title': '분석 결과의 정확도는 어떠셨나요?',
  'feedback.accuracy.perfect': '매우 정확',
  'feedback.accuracy.good': '대체로 정확',
  'feedback.accuracy.average': '보통',
  'feedback.accuracy.poor': '부정확',
  'feedback.accuracy.terrible': '매우 부정확',
  'feedback.feature.title': '가장 유용했던 기능은 무엇인가요?',
  'feedback.feature.trait.analysis': '특성 분석',
  'feedback.feature.perfume.recommendation': '향수 추천',
  'feedback.feature.visual.chart': '시각적 차트',
  'feedback.feature.personal.color': '퍼스널 컬러',
  'feedback.feature.keyword.cloud': '키워드 클라우드',
  'feedback.improvement.title': '개선이 필요한 부분이 있다면?',
  'feedback.improvement.placeholder': '자유롭게 의견을 남겨주세요...',
  'feedback.contact.title': '연락처 (선택사항)',
  'feedback.contact.placeholder': '결과 공유나 추가 문의를 위한 연락처',
  'feedback.submit': '피드백 제출',
  'feedback.submit.success': '소중한 피드백 감사합니다!',
  'feedback.submit.error': '피드백 제출에 실패했습니다.',
  
  // 최종 페이지 (Final)
  'final.title': '향기로운 여행이 끝났어요!',
  'final.subtitle': '최애의 향을 찾아드렸습니다',
  'final.result.title': '당신의 향기 프로필',
  'final.result.subtitle': '이번 분석으로 발견한 특별한 향기',
  'final.share.title': '결과 공유하기',
  'final.share.subtitle': '친구들과 함께 향기 여행을 떠나보세요',
  'final.share.twitter': '트위터에 공유',
  'final.share.kakao': '카카오톡 공유',
  'final.share.link': '링크 복사',
  'final.share.image': '이미지로 저장',
  'final.restart': '새로운 분석 시작',
  'final.service.title': '더 많은 향수 서비스',
  'final.service.subtitle': '개인 맞춤 향수 컨설팅',
  'final.thank.title': '이용해주셔서 감사합니다',
  'final.thank.subtitle': '앞으로도 더 정확한 분석으로 찾아뵙겠습니다',
  
  // 차트 관련
  'chart.trait.title': '특성 분석',
  'chart.trait.subtitle': '당신의 특성 점수',
  'chart.scent.title': '향 프로필',
  'chart.scent.subtitle': '어울리는 향의 특성',
  'chart.keyword.title': '키워드 클라우드',
  'chart.keyword.subtitle': '분석에서 추출된 키워드',
  
  // 향 카테고리
  'scent.citrus': '시트러스',
  'scent.floral': '플로럴',
  'scent.woody': '우디',
  'scent.musky': '머스키',
  'scent.fruity': '프루티',
  'scent.spicy': '스파이시',
  
  // 트위터 스타일 닉네임 패턴
  'twitter.pattern.1': '{keyword} 파 두목. 피도 눈물도 없다.',
  'twitter.pattern.2': '국제 {trait} 연맹 회장. 단호박 끝판왕.',
  'twitter.pattern.3': '{keyword} 계의 신. 눈빛만으로 제압 가능.',
  'twitter.pattern.4': '인간 {keyword}. 저세상 {trait}.',
  'twitter.pattern.5': '{trait} 마스터. 당신의 심장을 훔칠 예정.',
  'twitter.pattern.6': '{keyword1} {keyword2} 대마왕. 근접 금지구역.',
  'twitter.pattern.7': '전설의 {keyword} 사냥꾼. 오늘의 타겟은 바로 당신.',
  
  // 시간/계절/상황
  'season.all': '사계절',
  'season.spring_summer': '봄, 여름',
  'season.fall_winter': '가을, 겨울',
  'time.anytime': '언제든지',
  'time.morning_afternoon': '오전, 오후',
  'time.evening_night': '저녁, 밤',
  'occasion.default': '특별한 모임, 중요한 자리, 일상적인 향기 표현',
  'occasion.active': '활기찬 바캉스, 활동적인 데이트, 산뜻한 오피스 룩',
  'occasion.business': '중요한 비즈니스 미팅, 고급 레스토랑 디너, 특별한 이브닝 모임',
  'occasion.romantic': '로맨틱한 데이트, 웨딩 게스트, 우아한 갈라 디너',
  
  // 특성명 (한글)
  'trait.sexy': '섹시함',
  'trait.cute': '귀여움',
  'trait.charisma': '카리스마',
  'trait.darkness': '다크함',
  'trait.freshness': '청량함',
  'trait.elegance': '우아함',
  'trait.freedom': '자유로움',
  'trait.luxury': '럭셔리함',
  'trait.purity': '순수함',
  'trait.uniqueness': '독특함',
  
  // 향수 관련
  'perfume.recommendation': '향수 추천',
  'perfume.matching.rate': '매칭률',
  'perfume.analysis': '이미지 분석',
  'perfume.personal.color': '퍼스널 컬러',
  'perfume.description': '향수 설명',
  
  // 추가 번역 키 (영어 텍스트 번역용)
  'result.analysisResult': '분석된 이미지',
  'result.analysisResultAlt': '분석 결과',
  'result.cuteCharacterAlt': '귀여운 캐릭터',
  'result.sadCharacterAlt': '슬픈 캐릭터',
  'result.english': '🇺🇸 English',
  'result.acscent.identity': 'AC\'SCENT IDENTITY',
  'result.analyzed.images': '분석된 이미지',
  'result.human.otherworld': 'Human 고독. Otherworld 독특함.',
  'result.cute.character': '귀여운 캐릭터',
  'result.analysis.results': '분석 결과',
  'result.perfume.recommendation': '향수 추천',
  'result.fragrance.note.pyramid': '향 노트 피라미드',
  'result.first.impression': '첫 15-20분간 지속되는 첫인상의 향',
  'result.heart.perfume': '3-4시간 지속되는 향수의 심장부',
  'result.aftertaste.lasting': '5-6시간 이상 지속되는 잔향',
  'result.incense.manifestation': '향 발현 타임라인',
  'result.perfume.characteristic': '향수 특성 프로필',
  'result.main.series': '주요 계열',
  'result.perfume.matching.story': '향수 매칭 스토리',
  'result.perfume.expert.review': '향수 전문가의 평가',
  'result.image.perfume.matching': '이미지와 향수의 매칭 이유',
  'result.recommended.use': '향수 사용 추천',
  'result.recommended.season': '추천 계절',
  'result.recommended.time.zone': '추천 시간대',
  'result.try.using': '이렇게 사용해보세요!',
  'result.how.to.use': '어떻게 사용할까요?',
  'result.wrist.ears': '손목, 귀 뒤',
  'result.pulse.beats': '맥박이 뛰는 곳',
  'result.spray.clothes': '옷에 뿌리기',
  'result.distance.15cm': '15cm 거리에서',
  'result.spray.air': '공기 중 분사',
  'result.fragrant.cloud': '향기 구름 속으로',
  'result.perfume.lasting.power': '향수 지속력',
  'result.duration': '지속 시간',
  'result.send.feedback': '피드백 보내기',
  'result.start.over': '다시 시작하기',
  'perfume.mood': '분위기',
  'perfume.recommendation.reason': '추천 이유',
  'perfume.matching.analysis': '매칭 분석',
  'perfume.note.analysis': '노트 분석',
  'perfume.matching.points': '매칭 포인트',
  
  // 공통 UI
  'common.loading': '로딩 중...',
  'common.error': '오류가 발생했습니다',
  'common.retry': '다시 시도',
  'common.close': '닫기',
  'common.save': '저장',
  'common.cancel': '취소',
  'common.confirm': '확인',
  'common.next': '다음',
  'common.back': '이전',
  'common.complete': '완료',
  'common.home': '처음으로',
  
  // 폼 검증 메시지
  'validation.password.required': '비밀번호를 입력해주세요.',
  'validation.password.format': '비밀번호는 4자리 숫자만 입력 가능합니다.',
  'validation.name.required': '최애의 이름을 입력해주세요.',
  'validation.gender.required': '성별을 선택해주세요.',
  'validation.style.required': '최소 하나 이상의 스타일을 선택해주세요.',
  'validation.personality.required': '최소 하나 이상의 성격을 선택해주세요.',
  'validation.image.required': '이미지를 업로드해주세요.',
  'validation.image.size': '이미지 크기가 큽니다. 분석에 시간이 오래 걸릴 수 있습니다.',
  
  // 에러 메시지
  'error.analysis.failed': '분석에 실패했습니다. 다시 시도해주세요.',
  'error.image.load': '이미지 로드에 실패했습니다.',
  'error.file.read': '파일 읽기에 실패했습니다.',
  'error.canvas.context': '캔버스 컨텍스트를 생성할 수 없습니다.',
  'error.image.compression': '이미지 압축에 실패했습니다.',
  'error.result.not.found': '분석 결과를 찾을 수 없습니다. 다시 시도해주세요.',
  'error.result.format': '분석 결과 형식이 올바르지 않습니다. 다시 시도해주세요.',
  'error.result.missing.traits': '분석 결과에 특성(traits) 정보가 없습니다. 다시 시도해주세요.',
  'error.result.loading': '결과를 불러오는 중 오류가 발생했습니다.',
  
  // 언어 설정
  'language.selector': '언어 선택',
  'language.korean': '한국어',
  'language.english': 'English',
  'language.japanese': '日本語',
  'language.chinese': '中文',
  'language.spanish': 'Español',
  'language.french': 'Français',
  
  // 피드백 페이지 추가 키들
  'feedback.error.noPerfume': '추천된 향수 정보를 찾을 수 없습니다.',
  'feedback.error.perfumeInfo': '향수 정보를 불러올 수 없습니다. 다시 시도해주세요.',
  'feedback.backToResult': '결과 페이지로 돌아가기',
  'feedback.loading': '향수 정보를 불러오는 중...',
  'feedback.recipe': '레시피',
  'feedback.recipeActivated': '가 활성화되었습니다!',
  'feedback.recipeHistory': '이전 레시피 보기',
  'feedback.tip': '팁',
  'feedback.tipDescription': '이전에 생성된 레시피들을 다시 확인하고 비교할 수 있습니다. 마음에 들었던 이전 레시피가 있다면 다시 활성화해보세요!',
  'feedback.activeRecipe': '활성화된 레시피',
  'feedback.previousRecipe': '이전 레시피',
  'feedback.ingredientCount': '개 향료 조합',
  'feedback.step1.title': '향의 유지 비율 선택',
  'feedback.step2.title': '향 카테고리 선호도 설정',
  'feedback.step3.title': '특정 향료 추가',
  'feedback.subtitle': '당신만의 맞춤 향수',
  'feedback.retention.title': '기존 향의 유지 비율',
  'feedback.retention.question': '원래 향을 얼마나 유지하고 싶으신가요?',
  'feedback.retention.changeCompletely': '완전히 변경',
  'feedback.retention.keepCompletely': '완전히 유지',
  'feedback.customPerfume': '맞춤 향수',
  'feedback.step': '단계',
  'feedback.processing': '처리 중...',
  'feedback.next': '다음으로',
  'feedback.submit': '제출하기',
  'translating': '번역 중...',
  
  // 일반 에러 메시지
  'error.general': '오류 발생',
  
  // 추가 누락 키들
  'result.traitProfile': '특성 프로필',
  'result.personalColorType': '타입',
  
  // 향 계열명 번역
  'fragrance.citrus': '시트러스',
  'fragrance.floral': '플로럴',
  'fragrance.woody': '우디',
  'fragrance.musky': '머스크',
  'fragrance.fruity': '프루티',
  'fragrance.spicy': '스파이시',
  
  // 계절 번역
  'season.spring': '봄',
  'season.summer': '여름',
  'season.autumn': '가을',
  'season.winter': '겨울',
  
  // 시간대 번역
  'time.morning': '오전',
  'time.afternoon': '오후',
  'time.evening': '저녁',
  'time.night': '밤',
  
  // 향료 이름 번역
  'ingredient.thyme': '타임',
  'ingredient.geranium': '제라늄',
  'ingredient.elemi': '엘레미',
  'ingredient.bergamot': '베르가못',
  'ingredient.mandarin': '만다린',
  'ingredient.orange': '오렌지',
  'ingredient.lemon': '레몬',
  'ingredient.grapefruit': '그레이프프루트',
  'ingredient.rose': '장미',
  'ingredient.jasmine': '자스민',
  'ingredient.lily': '백합',
  'ingredient.lavender': '라벤더',
  'ingredient.sandalwood': '샌달우드',
  'ingredient.cedar': '시더',
  'ingredient.oak': '오크',
  'ingredient.pine': '소나무',
  'ingredient.musk': '머스크',
  'ingredient.amber': '앰버',
  'ingredient.vanilla': '바닐라',
  'ingredient.cinnamon': '계피',
  'ingredient.pepper': '후추',
  'ingredient.ginger': '생강',

  // 차트 관련
  'chart.aiBot': 'AI 주접봇',
  'chart.aiMessage.sexy': '어머머! 이런 섹시함은 불법이야!! 보는 사람 심장 떨어지겠네요! 🔥🔥',
  'chart.aiMessage.cute': '헐랭! 귀여움 폭격기 등장! 세상에 이런 큐티뽀짝이 또 있을까요?! 😍',
  'chart.aiMessage.charisma': '와우! 당신의 최애는 진짜 카리스마 폭발! 눈빛만으로 세상 정복가능해요! 👑',
  'chart.aiMessage.darkness': '오마이갓! 이 다크한 매력은 뭐죠? 심쿵사 당할 뻔했어요! 🖤',
  'chart.aiMessage.freshness': '우와아! 이 청량감은 실화냐?! 민트초코처럼 중독적이에요! 🌊',
  'chart.aiMessage.elegance': '어멋! 당신의 최애는 너무 골~~~져스!!!! 지져스! 당신 최애만큼 여왕이라는 단어에 어울릴 사람은 없네요! 👑',
  'chart.aiMessage.freedom': '헉! 이런 자유로움은 처음 봐요! 구속할 수 없는 영혼의 소유자네요! 🕊️',
  'chart.aiMessage.luxury': '엄마야! 럭셔리한 오라가 폭발해서 제 핸드폰이 명품으로 바뀔 뻔! 💎',
  'chart.aiMessage.purity': '에구머니! 이런 순수함은 국가에서 보호해야해요! 천사가 따로 없네요! 😇',
  'chart.aiMessage.uniqueness': '이런 독특함은 특허내야 해요! 진짜 세상에 하나밖에 없는 매력이에요! 🦄'
};

// 영어 대체 텍스트 (번역 실패 시 사용)
function getEnglishFallback(): TranslationDictionary {
  return {
    // 헤더/네비게이션
    'service.title': 'AC\'SCENT IDENTITY',
    'service.subtitle': 'Spraying Fanship',
    'service.description': 'Spraying your favorite wherever you are so you can think of them anytime, with fragrance~ 💕',
    
    // 랜딩페이지
    'landing.target.title': 'Recommended for these fans!',
    'landing.target.1': 'Those who want to spray their own fragrance every time they fan',
    'landing.target.2': 'Those who want to express their bias\'s charm through fragrance',
    'landing.target.3': 'Those who need a signature scent that connects their bias and themselves',
    
    'landing.howto.title': 'How to spray fan perfume',
    'landing.howto.step1': 'Enter your bias information and your fandom style',
    'landing.howto.step2': 'Get fan perfume recommendations through bias photos',
    'landing.howto.step3': 'Complete your own custom fan perfume recipe',
    
    'landing.cta': 'Go spray fan perfume',
    
    // 결과 페이지 핵심 번역
    'result.analysis.mood': 'Image Mood',
    'result.analysis.aiThought': 'AI\'s Thoughts',
    'result.analysis.traits': 'Image Feature Score',
    'result.analysis.core': 'The Key to Fragrance Matching',
    'result.analysis.matchingKeywords': 'Matching Keywords',
    'result.analysis.keywordsDescription': 'Words that express characteristics',
    'result.analysis.personalColor': 'Color Type',
    'result.analysis.personalColorDescription': 'Image Color Analysis',
    'result.traitProfile': 'Characteristic Profile',
    'result.personalColorType': 'Type',
    'result.analysisResult': 'Analyzed Image',

    // 향 계열명 번역 (영어)
    'fragrance.citrus': 'Citrus',
    'fragrance.floral': 'Floral',
    'fragrance.woody': 'Woody',
    'fragrance.musky': 'Musky',
    'fragrance.fruity': 'Fruity',
    'fragrance.spicy': 'Spicy',
    
    // 계절 번역 (영어)
    'season.spring': 'Spring',
    'season.summer': 'Summer',
    'season.autumn': 'Autumn',
    'season.winter': 'Winter',
    
    // 시간대 번역 (영어)
    'time.morning': 'Morning',
    'time.afternoon': 'Afternoon',
    'time.evening': 'Evening',
    'time.night': 'Night',
    
    // 향료 이름 번역 (영어)
    'ingredient.thyme': 'Thyme',
    'ingredient.geranium': 'Geranium',
    'ingredient.elemi': 'Elemi',
    'ingredient.bergamot': 'Bergamot',
    'ingredient.mandarin': 'Mandarin',
    'ingredient.orange': 'Orange',
    'ingredient.lemon': 'Lemon',
    'ingredient.grapefruit': 'Grapefruit',
    'ingredient.rose': 'Rose',
    'ingredient.jasmine': 'Jasmine',
    'ingredient.lily': 'Lily',
    'ingredient.lavender': 'Lavender',
    'ingredient.sandalwood': 'Sandalwood',
    'ingredient.cedar': 'Cedar',
    'ingredient.oak': 'Oak',
    'ingredient.pine': 'Pine',
    'ingredient.musk': 'Musk',
    'ingredient.amber': 'Amber',
    'ingredient.vanilla': 'Vanilla',
    'ingredient.cinnamon': 'Cinnamon',
    'ingredient.pepper': 'Pepper',
    'ingredient.ginger': 'Ginger',

    // 차트 관련
    'chart.aiBot': 'AI Fanbot',
    'chart.aiMessage.sexy': 'OMG! This level of sexiness should be illegal!! My heart is about to drop! 🔥🔥',
    'chart.aiMessage.cute': 'Wow! The cuteness bomber has arrived! Could there be another cutie-patootie like this in the world?! 😍',
    'chart.aiMessage.charisma': 'Wow! Your bias has explosive charisma! They can conquer the world with just their gaze! 👑',
    'chart.aiMessage.darkness': 'OMG! What is this dark charm?! I almost had a heart attack! 🖤',
    'chart.aiMessage.freshness': 'Whoa! Is this freshness for real?! It\'s as addictive as mint chocolate! 🌊',
    'chart.aiMessage.elegance': 'Oh my! Your bias is so gorgeous!!!! Gorgeous! No one fits the word queen like your bias! 👑',
    'chart.aiMessage.freedom': 'Whoa! I\'ve never seen such freedom before! The owner of an uncontainable soul! 🕊️',
    'chart.aiMessage.luxury': 'Oh my! The luxurious aura exploded so much my phone almost turned into a luxury item! 💎',
    'chart.aiMessage.purity': 'Oh dear! This kind of purity should be protected by the state! There\'s no angel like this! 😇',
    'chart.aiMessage.uniqueness': 'This uniqueness should be patented! It\'s truly one-of-a-kind charm in the world! 🦄',
    
    // 다른 모든 키들도 영어로 추가 (기본값으로 한국어 키 사용)
    ...Object.fromEntries(
      Object.keys(DEFAULT_TEXTS).map(key => [
        key, 
        // 핵심 키들이 아닌 경우 기본 한국어 텍스트 사용 (Google 번역이 처리)
        DEFAULT_TEXTS[key]
      ])
    )
  };
}

// API를 통한 번역 함수
async function translateTextViaAPI(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage, action: 'translate' })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();
    return result.translatedText || text;
  } catch (error) {
    console.error('번역 API 호출 오류:', error);
    return text; // 실패 시 원본 텍스트 반환
  }
}

// 다중 텍스트 번역 함수
async function translateMultipleViaAPI(texts: string[], targetLanguage: string): Promise<string[]> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLanguage, action: 'translate' })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();
    return result.translatedTexts || texts;
  } catch (error) {
    console.error('다중 번역 API 호출 오류:', error);
    return texts; // 실패 시 원본 텍스트 반환
  }
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [translatedTexts, setTranslatedTexts] = useState<TranslationDictionary>(DEFAULT_TEXTS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [observer, setObserver] = useState<MutationObserver | null>(null);

  // 언어 변경 시 번역 실행
  const setLanguage = async (lang: string) => {
    console.log(`언어 변경 요청: ${lang}`);
    
    // 이전 observer가 있으면 중지
    if (observer) {
      observer.disconnect();
      setObserver(null);
    }
    
    if (lang === 'ko') {
      // 한국어는 기본 텍스트 사용
      setCurrentLanguage(lang);
      setTranslatedTexts(DEFAULT_TEXTS);
      localStorage.setItem('selectedLanguage', lang);
      
      // DOM을 원본으로 복원
      await translateDOM('ko');
      console.log('한국어로 설정 완료');
      return;
    }

    setIsTranslating(true);
    console.log(`${lang} 언어로 번역 시작...`);
    
    try {
      // 먼저 정의된 키들을 번역 (UI 텍스트용)
      const cachedTranslations = localStorage.getItem(`translations_${lang}`);
      if (cachedTranslations) {
        try {
          const parsed = JSON.parse(cachedTranslations);
          setTranslatedTexts(parsed);
        } catch (error) {
          console.error('캐시된 번역 파싱 실패:', error);
        }
      } else {
        // 캐시가 없으면 키 기반 번역 실행
        const textsToTranslate = Object.values(DEFAULT_TEXTS);
        const translatedResults = await translateMultipleViaAPI(textsToTranslate, lang);
        
        if (translatedResults && translatedResults.length > 0) {
          const newTranslatedTexts: TranslationDictionary = {};
          const keys = Object.keys(DEFAULT_TEXTS);
          
          keys.forEach((key, index) => {
            newTranslatedTexts[key] = translatedResults[index] || DEFAULT_TEXTS[key];
          });
          
          setTranslatedTexts(newTranslatedTexts);
          localStorage.setItem(`translations_${lang}`, JSON.stringify(newTranslatedTexts));
        }
      }
      
      setCurrentLanguage(lang);
      localStorage.setItem('selectedLanguage', lang);
      
      // DOM 전체 번역 실행
      console.log('DOM 번역 시작...');
      await translateDOM(lang, (progress) => {
        console.log(`번역 진행률: ${progress.toFixed(1)}%`);
      });
      
      // 동적 콘텐츠를 위한 Observer 설정
      const newObserver = observeAndTranslate(lang);
      if (newObserver) {
        setObserver(newObserver);
      }
      
      console.log(`${lang} 번역 설정 완료`);
    } catch (error) {
      console.error('번역 실패:', error);
      // 번역 실패 시 기본 영어 대체 텍스트 사용
      if (lang === 'en') {
        const englishFallback = getEnglishFallback();
        setTranslatedTexts(englishFallback);
        setCurrentLanguage(lang);
        localStorage.setItem('selectedLanguage', lang);
        localStorage.setItem(`translations_${lang}`, JSON.stringify(englishFallback));
        console.log('영어 대체 텍스트를 사용합니다');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // 번역 함수
  const t = (key: string, fallback?: string): string => {
    return translatedTexts[key] || fallback || key;
  };

  // 전체 페이지 번역
  const translatePage = async () => {
    if (currentLanguage !== 'ko') {
      await setLanguage(currentLanguage);
    }
  };

  // 초기 언어 설정
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ko';
    const savedTranslations = localStorage.getItem(`translations_${savedLanguage}`);
    
    if (savedLanguage !== 'ko' && savedTranslations) {
      try {
        const parsed = JSON.parse(savedTranslations);
        setTranslatedTexts(parsed);
        setCurrentLanguage(savedLanguage);
        
        // DOM 번역도 실행
        translateDOM(savedLanguage).then(() => {
          const newObserver = observeAndTranslate(savedLanguage);
          if (newObserver) {
            setObserver(newObserver);
          }
        });
      } catch {
        setLanguage(savedLanguage);
      }
    } else {
      setCurrentLanguage(savedLanguage);
    }
    
    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      isTranslating,
      translatedTexts,
      translatePage
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}; 