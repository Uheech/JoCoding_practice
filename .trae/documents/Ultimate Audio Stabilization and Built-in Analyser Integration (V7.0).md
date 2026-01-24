1. **index.tsx 오디오 파이프라인 전면 개정 (V7.0)**:

   * `inputAudioContext.resume()` 및 `outputAudioContext.resume()`을 `await`로 처리하여 엔진 활성화를 보장합니다.

   * `this.volumeAnalyser`를 추가하여 브라우저 내장 `AnalyserNode`를 생성합니다.

   * 마이크 입력(`sourceNode`)을 `volumeAnalyser`에 연결하고, 여기서 실시간 볼륨 데이터를 추출합니다.

   * `requestAnimationFrame`을 사용하여 1초에 60번 볼륨 미터를 부드럽게 업데이트합니다.

   * `AudioWorklet` 코드를 더 안정적인 표준 규격(inputs, outputs, parameters 모두 포함)으로 수정합니다.
2. **UI 업데이트**:

   * 버전 태그를 `[V7.0 - ULTIMATE]`으로 변경합니다.

   * 볼륨 미터의 반응 속도와 민감도를 최적화합니다.
3. **배포 및 확인**:

   * GitHub 푸시 후 배포가 완료되면, 초록색 바가 사용자님의 목소리에 즉각적으로 반응하는지 확인합니다.

