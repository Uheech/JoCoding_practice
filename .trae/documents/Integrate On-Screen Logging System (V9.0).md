1. **Vite 빌드 설정 강화 (캐시 파괴)**:

   * `vite.config.ts`를 수정하여 빌드된 결과물 파일명에 항상 새로운 해시(Hash)가 붙도록 강제합니다. 이는 브라우저가 옛날 파일을 캐시에서 꺼내 쓰는 것을 원천적으로 막습니다.
2. **index.tsx 파일 최상단 검증 (V9.0)**:

   * 파일의 import 문 바로 아래에 `alert('V9.0 JavaScript Execution Start!');`와 `console.log('CRITICAL: SCRIPT STARTED');`를 추가합니다.

   * 프로그램 로직과 상관없이 파일이 읽히기만 하면 즉시 반응하도록 설계합니다.

   * 모델 이름 `gemini-2.5-flash-native-audio-preview-12-2025`는 절대 보존합니다.
3. **배포 및 브라우저 강제 동기화**:

   * GitHub 푸시 후 배포가 완료되면, 사용자에게 팝업창(alert) 확인을 요청합니다.

   * 만약 팝업이 안 뜬다면, 이는 Vercel 배포 자체가 꼬인 것이므로 Vercel 대시보드에서 배포 캐시를 삭제하고 다시 빌드하는 절차를 안내합니다.

