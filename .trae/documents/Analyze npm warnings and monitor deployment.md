1. **api/token.ts 로직 보강**: Google API 응답을 처리할 때 `response.json()` 대신 `response.text()`를 먼저 사용하도록 수정합니다. 이를 통해 Google이 보내는 상세 에러 메시지(HTML 에러 페이지 포함)를 캡처합니다.
2. **에러 메시지 상세화**: Google에서 에러가 발생한 경우, 단순히 500 에러를 던지는 것이 아니라 Google의 응답 본문을 포함하여 프론트엔드로 전달하도록 수정합니다.
3. **GitHub 푸시 및 배포**: 수정된 서버 로직을 GitHub에 푸시하여 Vercel 배포를 트리거합니다.
4. **최종 원인 파악**: 배포 후 사이트에서 "Unexpected end of JSON" 대신 표시되는 구체적인 에러 내용(예: API 키 유효성 문제 등)을 확인하여 최종 조치합니다.
