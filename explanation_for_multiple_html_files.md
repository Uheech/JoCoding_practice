
Cloudflare Pages (또는 다른 정적 웹사이트 호스팅 서비스)에 여러 HTML 파일을 배포할 때 `index.html`만 보이는 것은 정상적인 동작이며, 웹 서버의 기본 작동 방식 때문입니다.

**원인:**

웹사이트의 루트 주소(예: `https://your-site.pages.dev/`)에 접속하면, 웹 서버는 어떤 파일을 먼저 보여줘야 할지 결정해야 합니다. 이때 웹 서버는 약속된 규칙에 따라 **기본 파일(default file)**을 찾아서 보여주는데, 이 기본 파일의 이름이 바로 `index.html`입니다.

따라서, `index.html`과 다른 HTML 파일(예: `partnership_inquiry_form.html`)을 함께 배포하면, 루트 주소에서는 항상 `index.html`이 보이게 됩니다.

**해결 방법: 다른 HTML 파일에 접근하기**

다른 HTML 파일에 접근하려면, 주소창에 해당 파일의 이름을 직접 입력해주면 됩니다.

예를 들어, 당신의 Cloudflare Pages 주소가 `https://my-awesome-project.pages.dev` 라면,

-   `https://my-awesome-project.pages.dev` -> `index.html` 파일이 보입니다.
-   `https://my-awesome-project.pages.dev/partnership_inquiry_form.html` -> `partnership_inquiry_form.html` 파일이 보입니다.

**만약 다른 파일을 기본 페이지로 설정하고 싶다면:**

만약 `partnership_inquiry_form.html`을 기본 페이지로 사용하고 싶다면, 두 가지 방법이 있습니다.

1.  **파일 이름 변경:** `partnership_inquiry_form.html` 파일의 이름을 `index.html`로 변경하고, 기존 `index.html` 파일의 이름은 다른 것으로 변경하거나 삭제한 후 배포합니다.
2.  **링크 추가:** 현재 `index.html` 파일에 `partnership_inquiry_form.html`로 이동하는 링크를 추가할 수 있습니다. 예를 들어, `index.html`의 `<body>` 안에 다음과 같은 코드를 추가할 수 있습니다.

    ```html
    <a href="/partnership_inquiry_form.html">제휴 문의하기</a>
    ```

이렇게 하면, 메인 페이지에서 "제휴 문의하기" 링크를 클릭하여 다른 페이지로 쉽게 이동할 수 있습니다.
