1. **index.tsx 비서 설정 및 상태 강화**:
   - `initSession` 설정에 `systemInstruction`을 추가하여 한국어로 답변하도록 지시합니다.
   - `onmessage` 수신 시 `this.updateStatus('🎙️ Speaking...')`를 추가하여 응답 중임을 표시합니다.
   - `AudioWorkletNode`로부터 메시지를 받을 때마다 `this.updateStatus('🔴 Hearing...')`를 호출하여 음성 캡처 중임을 알립니다.
   - `startRecording` 시 `outputAudioContext.resume()`을 호출하여 스피커 잠금을 확실히 해제합니다.
2. **디버깅 로그 보강**:
   - Gemini로부터 오디오 데이터가 도착할 때마다 콘솔에 `Audio data received (length: ...)` 로그를 남겨 데이터 수신 여부를 확인 가능하게 합니다.
3. **배포 및 최종 확인**:
   - GitHub 푸시 후 Vercel 배포를 확인합니다.
   - 사용자가 말을 할 때 하단 문구가 `Hearing...`으로 변하는지, 그리고 답변 시 `Speaking...`으로 변하는지 최종 확인합니다.
