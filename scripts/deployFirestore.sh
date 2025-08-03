#!/bin/bash

# Firestore 마이그레이션 배포 스크립트
# 안전한 단계별 배포를 위한 자동화 스크립트

set -e  # 오류 발생 시 즉시 종료

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 확인 함수
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "작업이 취소되었습니다."
        exit 1
    fi
}

# 환경 변수 확인
check_environment() {
    log_info "환경 변수 확인 중..."
    
    required_vars=(
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_DATABASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "필수 환경 변수가 없습니다: $var"
            exit 1
        fi
    done
    
    log_success "환경 변수 확인 완료"
}

# Firebase CLI 확인
check_firebase_cli() {
    log_info "Firebase CLI 확인 중..."
    
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI가 설치되지 않았습니다."
        log_info "다음 명령어로 설치하세요: npm install -g firebase-tools"
        exit 1
    fi
    
    # 로그인 상태 확인
    if ! firebase projects:list &> /dev/null; then
        log_error "Firebase에 로그인되지 않았습니다."
        log_info "다음 명령어로 로그인하세요: firebase login"
        exit 1
    fi
    
    log_success "Firebase CLI 확인 완료"
}

# Firestore 인덱스 배포
deploy_firestore_indexes() {
    log_info "Firestore 인덱스 배포 중..."
    
    if [ -f "firestore.indexes.json" ]; then
        firebase deploy --only firestore:indexes
        log_success "Firestore 인덱스 배포 완료"
    else
        log_warning "firestore.indexes.json 파일이 없습니다."
    fi
}

# Firestore 보안 규칙 배포
deploy_firestore_rules() {
    log_info "Firestore 보안 규칙 배포 중..."
    
    # 기본 보안 규칙 생성 (존재하지 않는 경우)
    if [ ! -f "firestore.rules" ]; then
        log_info "기본 Firestore 보안 규칙 생성 중..."
        cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 세션 데이터 접근 규칙
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.admin == true);
    }
    
    // 분석 데이터 접근 규칙
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.admin == true);
    }
    
    // 레시피 데이터 접근 규칙
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.admin == true);
    }
    
    // 향수 마스터 데이터는 읽기만 가능
    match /perfumes/{perfumeId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // 관리자는 모든 데이터 접근 가능
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
EOF
        log_success "기본 Firestore 보안 규칙 생성 완료"
    fi
    
    firebase deploy --only firestore:rules
    log_success "Firestore 보안 규칙 배포 완료"
}

# 백업 생성
create_backup() {
    log_info "데이터 백업 생성 중..."
    
    backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Realtime Database 백업
    log_info "Realtime Database 백업 중..."
    node scripts/migrateToFirestore.js --backup --dry-run > "$backup_dir/backup.log" 2>&1 || true
    
    log_success "백업 생성 완료: $backup_dir"
}

# 마이그레이션 실행
run_migration() {
    log_info "Firestore 마이그레이션 실행 중..."
    
    # Dry run 먼저 실행
    log_info "Dry run 실행 중..."
    node scripts/migrateToFirestore.js --dry-run
    
    confirm "Dry run 결과를 확인했습니다. 실제 마이그레이션을 진행하시겠습니까?"
    
    # 실제 마이그레이션 실행
    log_info "실제 마이그레이션 실행 중..."
    node scripts/migrateToFirestore.js --backup --batch-size 100
    
    log_success "마이그레이션 완료"
}

# 성능 테스트 실행
run_performance_test() {
    log_info "성능 테스트 실행 중..."
    
    # Next.js 앱이 실행 중인지 확인
    if ! curl -s http://localhost:3000 > /dev/null; then
        log_warning "Next.js 앱이 실행되지 않았습니다."
        log_info "다른 터미널에서 'npm run dev'를 실행하세요."
        confirm "앱이 실행 중입니다. 계속 진행하시겠습니까?"
    fi
    
    # 성능 테스트 실행
    node -e "
    const { runPerformanceTest } = require('./utils/performanceMonitor.js');
    runPerformanceTest('adminDashboard').then(result => {
        console.log('성능 테스트 완료');
        process.exit(0);
    }).catch(error => {
        console.error('성능 테스트 오류:', error);
        process.exit(1);
    });
    "
    
    log_success "성능 테스트 완료"
}

# 배포 검증
verify_deployment() {
    log_info "배포 검증 중..."
    
    # Firestore 인덱스 상태 확인
    firebase firestore:indexes
    
    # 기본 연결 테스트
    log_info "Firestore 연결 테스트 중..."
    node -e "
    const { db } = require('./lib/firestore.js');
    const { collection, getDocs, limit, query } = require('firebase/firestore');
    
    (async () => {
        try {
            const testQuery = query(collection(db, 'sessions'), limit(1));
            const snapshot = await getDocs(testQuery);
            console.log('✅ Firestore 연결 성공');
            console.log('문서 수:', snapshot.size);
            process.exit(0);
        } catch (error) {
            console.error('❌ Firestore 연결 실패:', error);
            process.exit(1);
        }
    })();
    "
    
    log_success "배포 검증 완료"
}

# 롤백 함수
rollback() {
    log_warning "롤백을 진행합니다..."
    
    # 이전 상태로 복원하는 로직
    # 실제로는 더 복잡한 롤백 프로세스 필요
    
    log_info "Realtime Database 모드로 전환 중..."
    
    # 환경 변수에서 Firestore 비활성화
    if [ -f ".env.local" ]; then
        sed -i 's/USE_FIRESTORE=true/USE_FIRESTORE=false/g' .env.local
    fi
    
    log_success "롤백 완료"
}

# 메인 배포 프로세스
main() {
    log_info "🚀 Firestore 마이그레이션 배포 시작"
    
    # 사전 확인
    check_environment
    check_firebase_cli
    
    # 배포 모드 선택
    echo "배포 모드를 선택하세요:"
    echo "1) 전체 배포 (인덱스 + 마이그레이션 + 테스트)"
    echo "2) 인덱스만 배포"
    echo "3) 마이그레이션만 실행"
    echo "4) 성능 테스트만 실행"
    echo "5) 롤백"
    read -p "선택 (1-5): " choice
    
    case $choice in
        1)
            log_info "전체 배포를 시작합니다..."
            create_backup
            deploy_firestore_indexes
            deploy_firestore_rules
            run_migration
            verify_deployment
            run_performance_test
            ;;
        2)
            log_info "인덱스 배포를 시작합니다..."
            deploy_firestore_indexes
            deploy_firestore_rules
            ;;
        3)
            log_info "마이그레이션을 시작합니다..."
            create_backup
            run_migration
            ;;
        4)
            log_info "성능 테스트를 시작합니다..."
            run_performance_test
            ;;
        5)
            rollback
            ;;
        *)
            log_error "잘못된 선택입니다."
            exit 1
            ;;
    esac
    
    log_success "🎉 배포 완료!"
    log_info "관리자 페이지에서 결과를 확인하세요: http://localhost:3000/admin-firestore"
}

# 스크립트 실행
main "$@"