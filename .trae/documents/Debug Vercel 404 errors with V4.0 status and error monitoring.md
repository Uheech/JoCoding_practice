1. **index.tsx 디버깅 강화 (V4.0)**:

   * UI 하단에 `[V4.0 - DEBUG MODE]` 표시를 추가합니다.

   * `window.addEventListener('error', ...)`와 `window.addEventListener('unhandledrejection', ...)`를 추가하여 발생하는 모든 에러(404 포함)의 URL을 화면에 빨간 글씨로 출력합니다.
2. **visual-3d.ts 리소스 경로 최적화**:

   * `piz_compressed.exr` 로드 경로를 `./piz_compressed.exr`에서 `/piz_compressed.exr`로 변경하여 Vercel 배포 시 경로 문제를 방지합니다.
3. **배포 및 확인 가이드**:

   * Vercel 배포 완료 후 `[V4.0]` 문구가 보이는지 확인하도록 안내합니다.

   * 만약 에러가 발생하면 화면에 표시된 구체적인 "실패 주소(URL)"를 알려달라고 요청합니다.

