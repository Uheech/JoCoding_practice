1. **index.tsx 오디오 리샘플링 및 화면 로그 시스템 (V11.0)**:

   * `index.tsx` 최상단 알림을 `V11.0 Loaded!`로 변경합니다.

   * 마이크 입력 데이터를 구글 AI 권장 사양인 **16,000Hz Mono PCM**으로 강제 변환하여 전송하는 로직을 추가합니다. (기존에는 브라우저 샘플 레이트를 그대로 보내서 서버가 무시했을 가능성이 큼)

   * 화면 하단 로그창(`onScreenLogs`)에 `[Audio] Resampling to 16kHz...`, `[AI] Session Active` 등의 상세 상태를 표시합니다.

   * 모델명 `gemini-2.5-flash-native-audio-preview-12-2025`는 절대 유지합니다.
2. **utils.ts 인코딩 표준화**:

   * `createBlob` 함수에서 `mimeType`을 `audio/pcm;rate=16000`으로 고정하고 데이터 변환 로직을 최적화합니다.
3. **UI 및 시각적 피드백**:

   * 버전 태그를 `[V11.0 - VOICE ENGINE]`으로 업데이트합니다.

   * 화면 로그 창이 더 잘 보이도록 스타일을 보강합니다.
4. **배포 및 확인 가이드**:

   * 사용자에게 화면 하단 로그에 `16kHz Audio Sent` 문구가 뜨는지, 그리고 AI의 답변이 들리는지 확인을 요청합니다.

