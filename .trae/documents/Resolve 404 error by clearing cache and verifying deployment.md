1. **AudioWorklet 프로세서 생성**: 음성 데이터를 메인 스레드와 분리하여 처리할 `pcm-processor.ts` 파일을 새로 생성합니다.
2. **index.tsx 로직 업그레이드**:

   * `ScriptProcessorNode` 관련 코드(L275-292)를 모두 제거합니다.

   * `AudioContext.audioWorklet.addModule`을 통해 새로 만든 프로세서를 로드합니다.

   * `AudioWorkletNode`를 생성하여 음성 데이터를 실시간으로 Gemini 세션에 전송하도록 수정합니다.
3. **자원 해제 로직 수정**: `stopRecording` 함수에서 `AudioWorkletNode`를 안전하게 중단하고 연결을 해제하도록 업데이트합니다.
4. **배포 및 검증**: GitHub에 푸시하여 배포한 후, 브라우저 콘솔에서 경고가 사라졌는지와 음성 인식이 정상 작동하는지 확인합니다.

