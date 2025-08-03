/**
 * Firebase 성능 모니터링 및 비교 도구
 * Realtime DB vs Firestore 성능 측정
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      realtime: {},
      firestore: {}
    };
    this.isRecording = false;
  }

  startRecording(testName) {
    this.currentTest = testName;
    this.startTime = performance.now();
    this.isRecording = true;
    
    console.log(`🔬 성능 측정 시작: ${testName}`);
  }

  stopRecording(source = 'unknown', metadata = {}) {
    if (!this.isRecording) return;
    
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    if (!this.metrics[source]) {
      this.metrics[source] = {};
    }
    
    if (!this.metrics[source][this.currentTest]) {
      this.metrics[source][this.currentTest] = [];
    }
    
    this.metrics[source][this.currentTest].push({
      duration,
      timestamp: new Date().toISOString(),
      ...metadata
    });
    
    console.log(`⏱️  ${source} ${this.currentTest}: ${Math.round(duration)}ms`);
    
    this.isRecording = false;
    return duration;
  }

  async measureApiCall(apiUrl, options = {}, source = 'unknown') {
    const testName = `API_${apiUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    this.startRecording(testName);
    
    try {
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      
      const duration = this.stopRecording(source, {
        success: response.ok,
        status: response.status,
        dataSize: JSON.stringify(data).length,
        itemCount: Array.isArray(data.sessions) ? data.sessions.length : 1
      });
      
      return { data, duration, success: response.ok };
    } catch (error) {
      this.stopRecording(source, {
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }

  async comparePerformance(testConfig) {
    console.log('🔥 성능 비교 테스트 시작');
    console.log('설정:', testConfig);
    
    const results = {};
    
    for (const [testName, test] of Object.entries(testConfig.tests)) {
      console.log(`\n📊 테스트: ${testName}`);
      results[testName] = {};
      
      // Realtime DB 테스트
      if (test.realtime) {
        try {
          console.log('  🔍 Realtime DB 측정...');
          const realtimeResult = await this.measureApiCall(
            test.realtime.url,
            test.realtime.options || {},
            'realtime'
          );
          results[testName].realtime = realtimeResult;
        } catch (error) {
          console.error('  ❌ Realtime DB 오류:', error.message);
          results[testName].realtime = { error: error.message };
        }
      }
      
      // Firestore 테스트
      if (test.firestore) {
        try {
          console.log('  🔥 Firestore 측정...');
          const firestoreResult = await this.measureApiCall(
            test.firestore.url,
            test.firestore.options || {},
            'firestore'
          );
          results[testName].firestore = firestoreResult;
        } catch (error) {
          console.error('  ❌ Firestore 오류:', error.message);
          results[testName].firestore = { error: error.message };
        }
      }
      
      // 대기 시간
      if (testConfig.delayBetweenTests) {
        await new Promise(resolve => setTimeout(resolve, testConfig.delayBetweenTests));
      }
    }
    
    this.generateReport(results);
    return results;
  }

  generateReport(results) {
    console.log('\n📈 성능 비교 리포트');
    console.log('='.repeat(80));
    
    for (const [testName, testResults] of Object.entries(results)) {
      console.log(`\n🧪 ${testName}`);
      
      const realtime = testResults.realtime;
      const firestore = testResults.firestore;
      
      if (realtime && firestore && !realtime.error && !firestore.error) {
        const realtimeDuration = realtime.duration;
        const firestoreDuration = firestore.duration;
        const improvement = ((realtimeDuration - firestoreDuration) / realtimeDuration * 100);
        
        console.log(`  Realtime DB: ${Math.round(realtimeDuration)}ms`);
        console.log(`  Firestore:   ${Math.round(firestoreDuration)}ms`);
        console.log(`  개선:        ${improvement > 0 ? '+' : ''}${Math.round(improvement)}%`);
        
        if (realtime.dataSize && firestore.dataSize) {
          const sizeReduction = ((realtime.dataSize - firestore.dataSize) / realtime.dataSize * 100);
          console.log(`  데이터 크기: ${Math.round(sizeReduction)}% 감소`);
        }
        
        if (realtime.itemCount && firestore.itemCount) {
          console.log(`  아이템 수:   ${realtime.itemCount} vs ${firestore.itemCount}`);
        }
      } else {
        if (realtime?.error) console.log(`  Realtime DB: 오류 - ${realtime.error}`);
        if (firestore?.error) console.log(`  Firestore: 오류 - ${firestore.error}`);
      }
    }
    
    this.generateSummary();
  }

  generateSummary() {
    console.log('\n📊 전체 요약');
    console.log('-'.repeat(50));
    
    const realtimeMetrics = this.getAverageMetrics('realtime');
    const firestoreMetrics = this.getAverageMetrics('firestore');
    
    if (realtimeMetrics.avgDuration && firestoreMetrics.avgDuration) {
      const overallImprovement = ((realtimeMetrics.avgDuration - firestoreMetrics.avgDuration) / realtimeMetrics.avgDuration * 100);
      
      console.log(`평균 응답 시간:`);
      console.log(`  Realtime DB: ${Math.round(realtimeMetrics.avgDuration)}ms`);
      console.log(`  Firestore:   ${Math.round(firestoreMetrics.avgDuration)}ms`);
      console.log(`  전체 개선:   ${overallImprovement > 0 ? '+' : ''}${Math.round(overallImprovement)}%`);
    }
    
    console.log(`\n성공률:`);
    console.log(`  Realtime DB: ${Math.round(realtimeMetrics.successRate)}%`);
    console.log(`  Firestore:   ${Math.round(firestoreMetrics.successRate)}%`);
  }

  getAverageMetrics(source) {
    const sourceMetrics = this.metrics[source];
    const allDurations = [];
    let successCount = 0;
    let totalCount = 0;
    
    for (const testName of Object.keys(sourceMetrics)) {
      const testMetrics = sourceMetrics[testName];
      
      for (const metric of testMetrics) {
        allDurations.push(metric.duration);
        totalCount++;
        
        if (metric.success !== false) {
          successCount++;
        }
      }
    }
    
    return {
      avgDuration: allDurations.length > 0 ? allDurations.reduce((a, b) => a + b, 0) / allDurations.length : 0,
      successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
      totalTests: totalCount
    };
  }

  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        realtime: this.getAverageMetrics('realtime'),
        firestore: this.getAverageMetrics('firestore')
      }
    };
  }

  async saveReport(filename) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const reportData = this.exportMetrics();
      const reportPath = path.join(__dirname, `../reports/${filename}`);
      
      // 리포트 디렉토리 생성
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      
      // 리포트 저장
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
      
      console.log(`📄 성능 리포트 저장: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ 리포트 저장 오류:', error);
      throw error;
    }
  }
}

// 사전 정의된 테스트 시나리오
const testScenarios = {
  adminDashboard: {
    delayBetweenTests: 2000, // 2초 대기
    tests: {
      'Page1_Size10': {
        realtime: {
          url: '/api/admin?page=1&pageSize=10',
          options: { method: 'GET' }
        },
        firestore: {
          url: '/api/admin-firestore?page=1&pageSize=10',
          options: { method: 'GET' }
        }
      },
      'Page1_Size20': {
        realtime: {
          url: '/api/admin?page=1&pageSize=20',
          options: { method: 'GET' }
        },
        firestore: {
          url: '/api/admin-firestore?page=1&pageSize=20',
          options: { method: 'GET' }
        }
      },
      'Page2_Size10': {
        realtime: {
          url: '/api/admin?page=2&pageSize=10',
          options: { method: 'GET' }
        },
        firestore: {
          url: '/api/admin-firestore?page=2&pageSize=10',
          options: { method: 'GET' }
        }
      },
      'StatusFilter_Completed': {
        realtime: {
          url: '/api/admin?page=1&pageSize=10',
          options: { method: 'GET' }
        },
        firestore: {
          url: '/api/admin-firestore?page=1&pageSize=10&status=confirmed',
          options: { method: 'GET' }
        }
      }
    }
  }
};

// 자동 성능 테스트 실행 함수
const runPerformanceTest = async (scenarioName = 'adminDashboard') => {
  const monitor = new PerformanceMonitor();
  const scenario = testScenarios[scenarioName];
  
  if (!scenario) {
    throw new Error(`시나리오를 찾을 수 없습니다: ${scenarioName}`);
  }
  
  const results = await monitor.comparePerformance(scenario);
  
  // 리포트 저장
  const reportFilename = `performance-${scenarioName}-${Date.now()}.json`;
  await monitor.saveReport(reportFilename);
  
  return { results, monitor };
};

module.exports = {
  PerformanceMonitor,
  testScenarios,
  runPerformanceTest
};