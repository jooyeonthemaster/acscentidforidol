import { PerfumePersonaCollection } from '../types/perfume';

/**
 * 향수 페르소나 데이터
 */
const perfumePersonas: PerfumePersonaCollection = {
  personas: [
    {
      id: "BK-2201281",
      name: "블랙베리",
      description: "말은 짧게 행동은 강렬하게. 감정표현이 미니멀한 도시의 그림자. \"이게 향수냐고? 그냥 내 아우라야.\" 세상에 무관심한 듯 모든 걸 놓치지 않는 관찰자. 시크함이 DNA에 새겨진 존재.",
      traits: {
        sexy: 7,
        cute: 2,
        charisma: 8,
        darkness: 9,
        freshness: 3,
        elegance: 6,
        freedom: 5,
        luxury: 7,
        purity: 1,
        uniqueness: 8
      },
      categories: {
        citrus: 2,
        floral: 3,
        woody: 5,
        musky: 2,
        fruity: 7,
        spicy: 1
      },
      keywords: ["시크함", "도시적", "미니멀", "관찰자", "무관심"],
      imageAssociations: ["도시의 밤", "검은 가죽재킷", "어두운 선글라스"],
      primaryColor: "#1E1E24",
      secondaryColor: "#420039",
      matchingColorPalette: ["#1E1E24", "#420039", "#7A0045", "#A11D33", "#F75E25"]
    },
    {
      id: "MD-8602341",
      name: "만다린 오렌지",
      description: "도시 엘리트의 노력한 티 안 나게 완벽함. \"우연히 이렇게 된 것 같지만 모든 건 계산된 거야.\" 미니멀한 감각으로 최대의 효과를 내는 도시 여우. 세련됨을 숨쉬듯 자연스럽게 뿜어내는 존재.",
      traits: {
        sexy: 6,
        cute: 3,
        charisma: 7,
        darkness: 2,
        freshness: 8,
        elegance: 9,
        freedom: 4,
        luxury: 8,
        purity: 5,
        uniqueness: 6
      },
      categories: {
        citrus: 8,
        floral: 6,
        woody: 3,
        musky: 3,
        fruity: 7,
        spicy: 1
      },
      keywords: ["세련됨", "계산된", "미니멀", "도시 엘리트", "완벽함"],
      imageAssociations: ["모던 오피스", "화이트 셔츠", "베이지 슬랙스"],
      primaryColor: "#FF9F1C",
      secondaryColor: "#FAFAFA",
      matchingColorPalette: ["#FF9F1C", "#FAFAFA", "#E0E0E0", "#2A9D8F", "#264653"]
    },
    {
      id: "ST-3503281",
      name: "스트로베리",
      description: "애교가 직업이자 취미이자 특기인 인간 사탕. \"오빠 뿌잉뿌잉~\"이 입에서 자연스럽게 나오는 생명체. 귀여움의 한계를 모르고 사는 파스텔 요정. 걸을 때마다 반짝이가 폭발하는 인간 핑크빛.",
      traits: {
        sexy: 3,
        cute: 10,
        charisma: 5,
        darkness: 1,
        freshness: 7,
        elegance: 4,
        freedom: 6,
        luxury: 3,
        purity: 8,
        uniqueness: 6
      },
      categories: {
        citrus: 4,
        floral: 6,
        woody: 2,
        musky: 3,
        fruity: 8,
        spicy: 1
      },
      keywords: ["애교", "달콤함", "귀여움", "파스텔", "발랄함"],
      imageAssociations: ["핑크 드레스", "달콤한 디저트", "반짝이는 액세서리"],
      primaryColor: "#FF7E9D",
      secondaryColor: "#FFD8E6",
      matchingColorPalette: ["#FF7E9D", "#FFD8E6", "#FFECF1", "#FDA4BA", "#FF5C8D"]
    },
    {
      id: "BG-8704231",
      name: "베르가못",
      description: "\"품격있는 여유\"가 무슨 뜻인지 몸소 보여주는 지중해의 신사. 샴페인 잔 든 손짓에서부터 흘러나오는 우아함. 가끔 섞이는 프랑스어 악센트가 전혀 어색하지 않은 고급진 분위기의 결정체.",
      traits: {
        sexy: 8,
        cute: 1,
        charisma: 7,
        darkness: 2,
        freshness: 6,
        elegance: 10,
        freedom: 4,
        luxury: 9,
        purity: 3,
        uniqueness: 7
      },
      categories: {
        citrus: 8,
        floral: 7,
        woody: 3,
        musky: 4,
        fruity: 6,
        spicy: 1
      },
      keywords: ["우아함", "품격", "여유", "지중해", "세련됨"],
      imageAssociations: ["샴페인 글라스", "리넨 정장", "요트 위의 석양"],
      primaryColor: "#F3CA40",
      secondaryColor: "#344055",
      matchingColorPalette: ["#F3CA40", "#344055", "#F2A541", "#D98324", "#F7F7FF"]
    },
    {
      id: "BO-6305221",
      name: "비터 오렌지",
      description: "눈빛만으로 상대를 압도하는 카리스마 폭격기. \"회의실에 들어가면 공기가 바뀐다\"는 소리 듣는 인간 포스. 말 한마디가 칼보다 강력한 존재감. 거절할 수 없는 제안을 하는 마피아 보스 에너지.",
      traits: {
        sexy: 8,
        cute: 1, 
        charisma: 10,
        darkness: 7,
        freshness: 4,
        elegance: 7,
        freedom: 3,
        luxury: 8,
        purity: 2,
        uniqueness: 9
      },
      categories: {
        citrus: 7,
        floral: 3,
        woody: 6,
        musky: 3,
        fruity: 4,
        spicy: 8
      },
      keywords: ["카리스마", "강렬함", "압도적", "마피아 보스", "포스"],
      imageAssociations: ["회의실 중앙", "블랙 슈트", "날카로운 눈빛"],
      primaryColor: "#FF4000",
      secondaryColor: "#2F2F2F",
      matchingColorPalette: ["#FF4000", "#2F2F2F", "#A62F03", "#590202", "#0A0908"]
    },
    {
      id: "CR-3706221",
      name: "캐럿",
      description: "유기농 채소만 먹고, 화학 성분 전혀 없는 천연 비누만 쓰는 웰니스 오타쿠. \"이거 GMO에요?\"가 인사말인 건강의 전도사. 매일 아침 해 뜨기 전 명상하는 것이 일상. 걸을 때마다 자연의 기운이 따라다니는 맑은 영혼.",
      traits: {
        sexy: 2,
        cute: 5,
        charisma: 4,
        darkness: 1,
        freshness: 10,
        elegance: 3,
        freedom: 8,
        luxury: 2,
        purity: 9,
        uniqueness: 7
      },
      categories: {
        citrus: 4,
        floral: 7,
        woody: 2,
        musky: 4,
        fruity: 3,
        spicy: 2
      },
      keywords: ["자연주의", "웰니스", "맑은", "명상", "건강"],
      imageAssociations: ["오가닉 마켓", "요가 매트", "숲속 명상"],
      primaryColor: "#FFA62B",
      secondaryColor: "#78C091",
      matchingColorPalette: ["#FFA62B", "#78C091", "#BEE698", "#EFF7CF", "#16425B"]
    },
    {
      id: "RS-2807221",
      name: "로즈",
      description: "올드머니 여왕의 위엄과 품격. \"와인 리스트 좀 볼게요. 이건 2015년산이네요, 2014년은 없나요?\" 오페라 시즌권은 필수. 말투에서부터 느껴지는 3대째 물려받은 우아함. 고급 취향이 유전자에 각인된 존재.",
      traits: {
        sexy: 7,
        cute: 2,
        charisma: 8,
        darkness: 3,
        freshness: 4,
        elegance: 10,
        freedom: 3,
        luxury: 9,
        purity: 6,
        uniqueness: 7
      },
      categories: {
        citrus: 5,
        floral: 9,
        woody: 2,
        musky: 3,
        fruity: 4,
        spicy: 1
      },
      keywords: ["우아함", "고급", "클래식", "올드머니", "품격"],
      imageAssociations: ["오페라 하우스", "빈티지 와인", "진주 네크리스"],
      primaryColor: "#A8003D",
      secondaryColor: "#F0EAD6",
      matchingColorPalette: ["#A8003D", "#F0EAD6", "#D8B9C3", "#901E36", "#540D1F"]
    },
    {
      id: "TB-2808221",
      name: "튜베로즈",
      description: "순백의 화려함으로 모든 시선을 강탈하는 인간 다이아몬드. 파티의 중심에 서는 것이 운명인 존재. \"화려함은 내 본질이에요.\" 향기에 취한 남자들이 정신을 잃는 마법사. 순백의 카리스마.",
      traits: {
        sexy: 9,
        cute: 3,
        charisma: 9,
        darkness: 2,
        freshness: 5,
        elegance: 8,
        freedom: 4,
        luxury: 9,
        purity: 8,
        uniqueness: 8
      },
      categories: {
        citrus: 4,
        floral: 9,
        woody: 1,
        musky: 3,
        fruity: 5,
        spicy: 2
      },
      keywords: ["화려함", "카리스마", "매혹적", "순백", "강렬함"],
      imageAssociations: ["화이트 이브닝 드레스", "샴페인 타워", "다이아몬드 주얼리"],
      primaryColor: "#F5F5F5",
      secondaryColor: "#CCAD8F",
      matchingColorPalette: ["#F5F5F5", "#CCAD8F", "#E6D0C5", "#957D67", "#4A3928"]
    },
    {
      id: "OB-6809221",
      name: "오렌지 블라썸",
      description: "\"아, 이 향수? 파리 마레 지구의 작은 부티크에서 발견했어요.\" 프랑스 파리지엔의 세련된 분위기를 완벽 재현. 도시적인 세련미와 우아함을 동시에 뿜어내는 현대판 마리 앙투아네트.",
      traits: {
        sexy: 6,
        cute: 4,
        charisma: 7,
        darkness: 1,
        freshness: 8,
        elegance: 9,
        freedom: 5,
        luxury: 8,
        purity: 7,
        uniqueness: 6
      },
      categories: {
        citrus: 6,
        floral: 8,
        woody: 3,
        musky: 4,
        fruity: 5,
        spicy: 2
      },
      keywords: ["세련됨", "프렌치시크", "도시적", "우아함", "파리지엔"],
      imageAssociations: ["파리 카페", "실크 스카프", "샴페인 골드 패션"],
      primaryColor: "#F9A03F",
      secondaryColor: "#FFEFD5",
      matchingColorPalette: ["#F9A03F", "#FFEFD5", "#E8C39E", "#F2D2BD", "#FFECC7"]
    },
    {
      id: "TL-2810221",
      name: "튤립",
      description: "순수함이 직업인 청순 여신. 햇살 아래서만 활동하는 빛의 요정. \"웨딩촬영 아니에요?\"라는 질문을 일상에서 듣는 인간 필터. 걸을 때마다 꽃잎이 흩날리는 환상을 일으키는 매직.",
      traits: {
        sexy: 3,
        cute: 7,
        charisma: 5,
        darkness: 1,
        freshness: 8,
        elegance: 7,
        freedom: 5,
        luxury: 6,
        purity: 10,
        uniqueness: 5
      },
      categories: {
        citrus: 4,
        floral: 8,
        woody: 2,
        musky: 3,
        fruity: 4,
        spicy: 1
      },
      keywords: ["순수함", "청순", "빛나는", "깨끗함", "우아함"],
      imageAssociations: ["흰 원피스", "햇살 가득한 정원", "웨딩 부케"],
      primaryColor: "#FFC0CB",
      secondaryColor: "#FFFFFF",
      matchingColorPalette: ["#FFC0CB", "#FFFFFF", "#F3E5F5", "#F8BBD0", "#FCE4EC"]
    },
    {
      id: "LM-7211441",
      name: "라임",
      description: "\"난 일 안 해도 돈이 들어와\"라고 말해도 의심하지 않을 완벽한 여유로움. 칵테일 한 잔에 인생의 모든 걱정을 지운 휴양지의 정령. 발걸음마다 자유와 쿨함이 흘러넘치는 존재.",
      traits: {
        sexy: 6,
        cute: 3,
        charisma: 7,
        darkness: 1,
        freshness: 9,
        elegance: 6,
        freedom: 10,
        luxury: 7,
        purity: 5,
        uniqueness: 8
      },
      categories: {
        citrus: 7,
        floral: 2,
        woody: 4,
        musky: 2,
        fruity: 6,
        spicy: 4
      },
      keywords: ["여유로움", "쿨함", "자유", "휴양지", "청량감"],
      imageAssociations: ["해변 라운지", "모히토 칵테일", "리조트 선베드"],
      primaryColor: "#C4E17F",
      secondaryColor: "#21B6A8",
      matchingColorPalette: ["#C4E17F", "#21B6A8", "#79CEB8", "#40B7BF", "#06D6A0"]
    },
    {
      id: "LV-2812221",
      name: "은방울꽃",
      description: "말할 때 목소리가 작아서 \"뭐라고요?\"를 세 번 이상 듣는 섬세한 영혼. 걸을 때 발소리가 나지 않고 움직임 자체가 예술인 공중부양형 인간. 갤러리에 녹아들어 그 자체가 작품이 되는 생명체.",
      traits: {
        sexy: 4,
        cute: 6,
        charisma: 3,
        darkness: 2,
        freshness: 7,
        elegance: 8,
        freedom: 4,
        luxury: 5,
        purity: 9,
        uniqueness: 7
      },
      categories: {
        citrus: 2,
        floral: 8,
        woody: 5,
        musky: 6,
        fruity: 6,
        spicy: 1
      },
      keywords: ["섬세함", "조용함", "우아함", "예술적", "청초함"],
      imageAssociations: ["미술관", "포셀린 티컵", "흰 실크 스카프"],
      primaryColor: "#F0F8FF",
      secondaryColor: "#E6E6FA",
      matchingColorPalette: ["#F0F8FF", "#E6E6FA", "#FFF0F5", "#D8BFD8", "#CCCCFF"]
    },
    {
      id: "YJ-8213431",
      name: "유자",
      description: "매일 아침 조깅하고 프로틴 쉐이크 마시는 건강 전도사. 운동 안 하면 금단현상 일으키는 인간 활력소. \"오늘 만보 채웠어?\" 물어보는 친구. K-뷰티의 살아있는 광고판. 에너지 드링크보다 강력한 생기 발산체.",
      traits: {
        sexy: 5,
        cute: 6,
        charisma: 6,
        darkness: 1,
        freshness: 10,
        elegance: 4,
        freedom: 7,
        luxury: 5,
        purity: 8,
        uniqueness: 7
      },
      categories: {
        citrus: 8,
        floral: 2,
        woody: 3,
        musky: 6,
        fruity: 4,
        spicy: 3
      },
      keywords: ["활기참", "건강", "에너지", "생기", "청량함"],
      imageAssociations: ["조깅복", "프로틴 쉐이크", "스마트워치"],
      primaryColor: "#F9DB24",
      secondaryColor: "#7ECE6E",
      matchingColorPalette: ["#F9DB24", "#7ECE6E", "#B5DB92", "#FFE15A", "#A9CDE8"]
    },
    {
      id: "MT-8614231",
      name: "민트",
      description: "파일이 색깔별, 날짜별로 정리된 완벽주의자의 표본. 청량감이 삶의 모토인 인간 상쾌함. \"어, 이거 1mm 틀어졌네\"를 발견하는 초능력자. 모든 것이 제자리에 있어야 숨쉴 수 있는 정리정돈의 신.",
      traits: {
        sexy: 3,
        cute: 4,
        charisma: 6,
        darkness: 1,
        freshness: 10,
        elegance: 7,
        freedom: 3,
        luxury: 6,
        purity: 9,
        uniqueness: 6
      },
      categories: {
        citrus: 8,
        floral: 1,
        woody: 6,
        musky: 3,
        fruity: 4,
        spicy: 7
      },
      keywords: ["완벽주의", "청량함", "깔끔함", "정리정돈", "상쾌함"],
      imageAssociations: ["미니멀 인테리어", "정돈된 책상", "화이트 시트"],
      primaryColor: "#ABDEE6",
      secondaryColor: "#FFFFFF",
      matchingColorPalette: ["#ABDEE6", "#FFFFFF", "#CBAACB", "#FFFFB5", "#FFCCB6"]
    },
    {
      id: "PT-8415331",
      name: "페티그레인",
      description: "\"이번 주말에 발리 가요\"가 인사말인 리조트 셀럽. 휴양지에서 태어나 휴양지에서만 살 수 있는 여행의 정령. 인생이 영원한 바캉스인 부러움의 대상. #휴양지스타그램 창시자.",
      traits: {
        sexy: 7,
        cute: 4,
        charisma: 8,
        darkness: 1,
        freshness: 9,
        elegance: 8,
        freedom: 10,
        luxury: 9,
        purity: 6,
        uniqueness: 7
      },
      categories: {
        citrus: 8,
        floral: 7,
        woody: 2,
        musky: 4,
        fruity: 3,
        spicy: 3
      },
      keywords: ["휴양지", "여행", "셀럽", "자유로움", "여유"],
      imageAssociations: ["인피니티 풀", "리조트 테라스", "선셋 칵테일"],
      primaryColor: "#82B1FF",
      secondaryColor: "#FFD180",
      matchingColorPalette: ["#82B1FF", "#FFD180", "#80D8FF", "#FFAB40", "#B388FF"]
    },
    {
      id: "SD-2216141",
      name: "샌달우드",
      description: "대화할 때 눈을 똑바로 쳐다보며 영혼을 꿰뚫는 깊이의 소유자. 싱글몰트 위스키와 시가의 아우라가 자연스레 풍기는 시간의 신사. \"인생이란...\" 한마디에 모두가 귀 기울이는 중후한 매력.",
      traits: {
        sexy: 8,
        cute: 1,
        charisma: 9,
        darkness: 6,
        freshness: 2,
        elegance: 8,
        freedom: 4,
        luxury: 9,
        purity: 3,
        uniqueness: 7
      },
      categories: {
        citrus: 1,
        floral: 1,
        woody: 9,
        musky: 3,
        fruity: 1,
        spicy: 8
      },
      keywords: ["중후함", "깊이감", "신사적", "지적", "고급스러움"],
      imageAssociations: ["위스키 글라스", "가죽 안락의자", "클래식 시계"],
      primaryColor: "#5D4037",
      secondaryColor: "#D7CCC8",
      matchingColorPalette: ["#5D4037", "#D7CCC8", "#795548", "#BCAAA4", "#3E2723"]
    },
    {
      id: "LP-6317181",
      name: "레몬페퍼",
      description: "재즈바에서 칵테일 마시며 시 쓰는 게 취미인 예술가 영혼. \"난 남들과 달라\"를 입버릇처럼 말하지만 실제로 남다른 유일무이한 존재. 규칙과 틀에 갇히는 순간 사라지는 자유의 화신.",
      traits: {
        sexy: 7,
        cute: 2,
        charisma: 6,
        darkness: 5,
        freshness: 8,
        elegance: 5,
        freedom: 9,
        luxury: 6,
        purity: 3,
        uniqueness: 10
      },
      categories: {
        citrus: 6,
        floral: 1,
        woody: 7,
        musky: 3,
        fruity: 1,
        spicy: 8
      },
      keywords: ["예술적", "자유로움", "독특함", "창의적", "비주류"],
      imageAssociations: ["재즈바", "빈티지 노트북", "예술가의 아틀리에"],
      primaryColor: "#FFEB3B",
      secondaryColor: "#212121",
      matchingColorPalette: ["#FFEB3B", "#212121", "#FDD835", "#424242", "#F57F17"]
    },
    {
      id: "PP-3218181",
      name: "핑크페퍼",
      description: "\"나 요즘 바빠\"가 10년째 인사말인 도시의 워커홀릭. 24시간이 모자라 타임머신 찾는 바쁨의 화신. 완벽한 타임매니저먼트의 달인. 도시의 리듬과 함께 숨쉬는 현대인의 표본.",
      traits: {
        sexy: 6,
        cute: 3,
        charisma: 8,
        darkness: 3,
        freshness: 6,
        elegance: 7,
        freedom: 4,
        luxury: 8,
        purity: 2,
        uniqueness: 7
      },
      categories: {
        citrus: 1,
        floral: 1,
        woody: 7,
        musky: 3,
        fruity: 1,
        spicy: 8
      },
      keywords: ["바쁨", "워커홀릭", "도시적", "효율적", "현대적"],
      imageAssociations: ["스마트폰", "오피스 빌딩", "디지털 플래너"],
      primaryColor: "#FF80AB",
      secondaryColor: "#424242",
      matchingColorPalette: ["#FF80AB", "#424242", "#F48FB1", "#616161", "#C2185B"]
    },
    {
      id: "SS-8219241",
      name: "바다소금",
      description: "맨발로 모래 밟는 것이 인생 최고의 행복인 자유영혼. 평생 서핑하며 살기 위해 직장 그만둘 계획 중인 바다의 아이. 물 없이는 살 수 없는 인어공주 DNA 보유자. 자유가 몸에 각인된 영혼.",
      traits: {
        sexy: 6,
        cute: 3,
        charisma: 6,
        darkness: 1,
        freshness: 10,
        elegance: 5,
        freedom: 10,
        luxury: 4,
        purity: 8,
        uniqueness: 7
      },
      categories: {
        citrus: 8,
        floral: 3,
        woody: 5,
        musky: 2,
        fruity: 4,
        spicy: 1
      },
      keywords: ["자유로움", "바다", "청량함", "자연스러움", "모험"],
      imageAssociations: ["해변", "서핑보드", "맨발의 모래"],
      primaryColor: "#00B4D8",
      secondaryColor: "#E9F5F9",
      matchingColorPalette: ["#00B4D8", "#E9F5F9", "#90E0EF", "#CAF0F8", "#03045E"]
    },
    {
      id: "TM-2320461",
      name: "타임",
      description: "도시와 숲 사이의 균형을 찾은 미스터리한 존재. 주말마다 캠핑가서 직접 불 피우는 것이 취미지만, 최신 테크 가제트도 놓치지 않는 아날로그와 디지털의 완벽한 조화. 두 세계를 오가는 차원의 여행자.",
      traits: {
        sexy: 6,
        cute: 2,
        charisma: 7,
        darkness: 5,
        freshness: 7,
        elegance: 6,
        freedom: 8,
        luxury: 5,
        purity: 4,
        uniqueness: 9
      },
      categories: {
        citrus: 1,
        floral: 1,
        woody: 8,
        musky: 1,
        fruity: 1,
        spicy: 7
      },
      keywords: ["균형", "미스터리", "아날로그", "자연", "도시"],
      imageAssociations: ["캠프파이어", "숲속의 노트북", "모던 아웃도어 룩"],
      primaryColor: "#3A5A40",
      secondaryColor: "#DAD7CD",
      matchingColorPalette: ["#3A5A40", "#DAD7CD", "#588157", "#A3B18A", "#344E41"]
    },
    {
      id: "MS-2621712",
      name: "머스크",
      description: "\"이 와인은 너무 영하네요\"라고 자연스럽게 말할 수 있는 문화적 깊이의 소유자. 오페라 1층 중앙석의 단골손님. 우아함이 직업이자 소명인 현대판 귀족. 파리지앵의 품격을 몸소 체현한 존재.",
      traits: {
        sexy: 9,
        cute: 1,
        charisma: 8,
        darkness: 4,
        freshness: 3,
        elegance: 10,
        freedom: 4,
        luxury: 10,
        purity: 5,
        uniqueness: 7
      },
      categories: {
        citrus: 2,
        floral: 3,
        woody: 4,
        musky: 7,
        fruity: 1,
        spicy: 4
      },
      keywords: ["우아함", "품격", "고급", "파리지앵", "문화적"],
      imageAssociations: ["오페라 하우스", "빈티지 와인", "고급 다이닝"],
      primaryColor: "#9C7A5B",
      secondaryColor: "#EADFD3",
      matchingColorPalette: ["#9C7A5B", "#EADFD3", "#BFA98A", "#D8C9BA", "#6D5C47"]
    },
    {
      id: "WR-2622131",
      name: "화이트로즈",
      description: "순백의 아우라로 모든 공간을 정화하는 청순의 여신. 빛이 그녀를 따라다니는 듯한 환상을 불러일으키는 맑은 영혼. \"당신은 마치 천사 같아요\"라는 말을 일상적으로 듣는 순수의 화신.",
      traits: {
        sexy: 5,
        cute: 6,
        charisma: 6,
        darkness: 1,
        freshness: 7,
        elegance: 9,
        freedom: 4,
        luxury: 8,
        purity: 10,
        uniqueness: 6
      },
      categories: {
        citrus: 2,
        floral: 6,
        woody: 2,
        musky: 8,
        fruity: 2,
        spicy: 2
      },
      keywords: ["순백", "청순", "정화", "천사", "빛나는"],
      imageAssociations: ["하얀 드레스", "창가의 아침 햇살", "천사 날개"],
      primaryColor: "#FFFFFF",
      secondaryColor: "#F1F0EA",
      matchingColorPalette: ["#FFFFFF", "#F1F0EA", "#FBFAFA", "#E8E8E4", "#D0CFC8"]
    },
    {
      id: "SW-2623121",
      name: "스웨이드",
      description: "\"이건 내가 파리에서 발견한 작은 브랜드예요\"가 인사말인 도시의 문화 엘리트. 미술관과 부티크를 집보다 자주 가는 세련된 감각의 소유자. 스타일이 DNA에 새겨진 타고난 스타일 오타쿠.",
      traits: {
        sexy: 7,
        cute: 2,
        charisma: 6,
        darkness: 3,
        freshness: 4,
        elegance: 8,
        freedom: 5,
        luxury: 8,
        purity: 3,
        uniqueness: 7
      },
      categories: {
        citrus: 2,
        floral: 6,
        woody: 8,
        musky: 7,
        fruity: 1,
        spicy: 4
      },
      keywords: ["세련됨", "문화적", "스타일", "도시적", "부티크"],
      imageAssociations: ["미술관", "디자이너 부티크", "스웨이드 재킷"],
      primaryColor: "#A9927D",
      secondaryColor: "#F2F4F3",
      matchingColorPalette: ["#A9927D", "#F2F4F3", "#5E503F", "#49111C", "#0A0908"]
    },
    {
      id: "IM-4324311",
      name: "이탈리안만다린",
      description: "\"향수요? 저 향수 안 뿌려요, 이게 제 체취예요\"라고 말해도 믿을 것 같은 타고난 페로몬의 소유자. 존재 자체가 매혹적인 자연의 선물. 그녀가 지나간 자리에 모두가 뒤돌아보는 마법의 주인공.",
      traits: {
        sexy: 9,
        cute: 5,
        charisma: 8,
        darkness: 2,
        freshness: 6,
        elegance: 7,
        freedom: 6,
        luxury: 6,
        purity: 5,
        uniqueness: 8
      },
      categories: {
        citrus: 7,
        floral: 3,
        woody: 5,
        musky: 8,
        fruity: 5,
        spicy: 1
      },
      keywords: ["매혹적", "페로몬", "자연스러움", "센슈얼", "타고난"],
      imageAssociations: ["이탈리안 써머 드레스", "햇살 맞은 피부", "모닝 커피"],
      primaryColor: "#FF9A62",
      secondaryColor: "#FFF3E4",
      matchingColorPalette: ["#FF9A62", "#FFF3E4", "#FFC297", "#FFDFBF", "#FFB77D"]
    },
    {
      id: "LV-2225161",
      name: "라벤더",
      description: "위스키바에서 싱글몰트 한 잔 마시며 재즈 감상하는 모습이 가장 자연스러운 지적 매력의 대가. 말투에서부터 짙게 배어나오는 중후한 매력. 깊은 대화를 나눌 수 있는 영혼의 탐험가.",
      traits: {
        sexy: 6,
        cute: 2,
        charisma: 7,
        darkness: 4,
        freshness: 6,
        elegance: 8,
        freedom: 5,
        luxury: 7,
        purity: 4,
        uniqueness: 6
      },
      categories: {
        citrus: 3,
        floral: 3,
        woody: 7,
        musky: 8,
        fruity: 1,
        spicy: 7
      },
      keywords: ["지적", "중후함", "깊이있는", "재즈", "위스키"],
      imageAssociations: ["재즈 바", "싱글몰트 글라스", "고전 문학책"],
      primaryColor: "#8B80F9",
      secondaryColor: "#43281C",
      matchingColorPalette: ["#8B80F9", "#43281C", "#7A6EE5", "#333D79", "#543864"]
    },
    {
      id: "IC-3126171",
      name: "이탈리안사이프러스",
      description: "선글라스를 밤에도 벗지 않고, 항상 바 카운터 구석자리에 앉아 사람 구경하는 미스터리의 화신. 밤의 제왕이라 불리는 어둠의 카리스마. 모두의 궁금증을 자아내는 수수께끼 같은 존재.",
      traits: {
        sexy: 8,
        cute: 1,
        charisma: 9,
        darkness: 9,
        freshness: 4,
        elegance: 7,
        freedom: 5,
        luxury: 6,
        purity: 2,
        uniqueness: 10
      },
      categories: {
        citrus: 2,
        floral: 1,
        woody: 8,
        musky: 6,
        fruity: 4,
        spicy: 7
      },
      keywords: ["미스터리", "어둠", "카리스마", "수수께끼", "밤"],
      imageAssociations: ["바 카운터", "밤의 선글라스", "블랙 코트"],
      primaryColor: "#1C2321",
      secondaryColor: "#7D98A1",
      matchingColorPalette: ["#1C2321", "#7D98A1", "#5E6572", "#2C3532", "#A9B4C2"]
    },
    {
      id: "SW-1227171",
      name: "스모키 블렌드 우드",
      description: "VIP 라운지의 단골손님. 시가 피우며 싱글몰트 마시는 모습이 가장 자연스러운 품격의 대명사. \"내 명함 받아\"가 가장 섹시하게 들리는 타고난 사업가. 깊은 성공의 향기가 배어나는 아우라.",
      traits: {
        sexy: 8,
        cute: 1,
        charisma: 9,
        darkness: 7,
        freshness: 2,
        elegance: 8,
        freedom: 4,
        luxury: 10,
        purity: 3,
        uniqueness: 7
      },
      categories: {
        citrus: 1,
        floral: 3,
        woody: 9,
        musky: 7,
        fruity: 4,
        spicy: 7
      },
      keywords: ["품격", "성공", "VIP", "깊이", "사업가"],
      imageAssociations: ["시가 라운지", "명품 핸드백", "고급 자동차"],
      primaryColor: "#4A4238",
      secondaryColor: "#C69F6A",
      matchingColorPalette: ["#4A4238", "#C69F6A", "#704500", "#886A34", "#2F2A27"]
    },
    {
      id: "LD-2128524",
      name: "레더",
      description: "미슐랭 레스토랑 예약만 10개 대기 중인 미식의 신. \"이 빈티지가 특별한 이유는...\"이란 말이 일상인 컬렉터의 혼. 현대 미술관에 녹아들 것 같은 감각적 존재감. 세련된 취향의 표본.",
      traits: {
        sexy: 7,
        cute: 1,
        charisma: 8,
        darkness: 5,
        freshness: 3,
        elegance: 9,
        freedom: 4,
        luxury: 10,
        purity: 2,
        uniqueness: 8
      },
      categories: {
        citrus: 2,
        floral: 1,
        woody: 6,
        musky: 7,
        fruity: 5,
        spicy: 8
      },
      keywords: ["미식가", "컬렉터", "고급취향", "세련됨", "감각적"],
      imageAssociations: ["미슐랭 레스토랑", "빈티지 와인 셀러", "현대미술"],
      primaryColor: "#6B3D2E",
      secondaryColor: "#BCAA99",
      matchingColorPalette: ["#6B3D2E", "#BCAA99", "#855141", "#A77B62", "#3F2A21"]
    },
    {
      id: "VL-2129241",
      name: "바이올렛",
      description: "패션위크 프론트로에 앉아야 직성이 풀리는 트렌드의 여왕. \"그거 유행 지났어요\"라는 말을 제일 먼저 할 수 있는 패션의 미래 예언자. 아방가르드의 혼이 깃든 예술적 영혼의 소유자.",
      traits: {
        sexy: 7,
        cute: 3,
        charisma: 8,
        darkness: 4,
        freshness: 5,
        elegance: 7,
        freedom: 6,
        luxury: 8,
        purity: 4,
        uniqueness: 10
      },
      categories: {
        citrus: 2,
        floral: 6,
        woody: 7,
        musky: 6,
        fruity: 4,
        spicy: 2
      },
      keywords: ["트렌드", "아방가르드", "패션", "예술적", "선구자"],
      imageAssociations: ["패션위크", "아방가르드 의상", "현대 미술 갤러리"],
      primaryColor: "#9370DB",
      secondaryColor: "#F6F0F9",
      matchingColorPalette: ["#9370DB", "#F6F0F9", "#B591E0", "#D7BFDC", "#6A4C93"]
    },
    {
      id: "FG-3430721",
      name: "무화과",
      description: "\"이 와인은 15년산인데...\"로 대화 시작하는 것이 특기인 인생 승리자. 여유로움이 몸에 베인 품격의 상징. 호텔 브런치와 와인 시음회의 VIP 멤버. 모든 완벽한 순간에 자연스레 어울리는 존재.",
      traits: {
        sexy: 7,
        cute: 2,
        charisma: 7,
        darkness: 3,
        freshness: 6,
        elegance: 9,
        freedom: 5,
        luxury: 10,
        purity: 4,
        uniqueness: 6
      },
      categories: {
        citrus: 3,
        floral: 5,
        woody: 6,
        musky: 7,
        fruity: 6,
        spicy: 3
      },
      keywords: ["여유", "품격", "승리자", "와인", "고급"],
      imageAssociations: ["와인 테이스팅", "호텔 브런치", "지중해 테라스"],
      primaryColor: "#7E5546",
      secondaryColor: "#FCF1D5",
      matchingColorPalette: ["#7E5546", "#FCF1D5", "#B98B73", "#D9B5A0", "#5D4037"]
    }
  ],
  
  traitDescriptions: {
    sexy: "관능적이고 매혹적인 에너지",
    cute: "애교스럽고 사랑스러운 매력",
    charisma: "강한 존재감과 영향력",
    darkness: "신비롭고 깊은 어둠의 매력",
    freshness: "상쾌하고 맑은 에너지",
    elegance: "고상하고 품격 있는 분위기",
    freedom: "구속되지 않는 자유분방한 영혼",
    luxury: "고급스럽고 풍요로운 아우라",
    purity: "깨끗하고 맑은 순백의 이미지",
    uniqueness: "남다르고 개성 강한 정도"
  },
  
  categoryDescriptions: {
    citrus: "상쾌하고 활기찬 시트러스 향",
    floral: "우아하고 여성스러운, 꽃의 향기",
    woody: "깊고 따뜻한 나무 향",
    musky: "포근하고 관능적인 머스크 향",
    fruity: "달콤하고 즙이 많은 과일 향",
    spicy: "자극적이고 강렬한 스파이시 향"
  }
};

export default perfumePersonas;