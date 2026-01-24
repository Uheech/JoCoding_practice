import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // CORS 설정 (내 도메인만 허용)
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*'); // 개발 단계에서는 * 사용, 배포 시 특정 도메인으로 제한 권장
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  console.log('--- API Token Request Diagnostic ---');
  console.log('Method:', request.method);
  console.log('API_KEY exists:', !!API_KEY);
  if (API_KEY) {
    console.log('API_KEY (masked):', `${API_KEY.slice(0, 4)}...${API_KEY.slice(-4)}`);
  }

  if (!API_KEY) {
    return response.status(500).json({ 
      error: 'GEMINI_API_KEY가 설정되지 않았습니다. Vercel 프로젝트 설정에서 환경 변수를 확인해주세요.' 
    });
  }

  try {
    const targetUrl = `https://generativelanguage.googleapis.com/v1alpha/authTokens:create?key=${API_KEY}`;
    console.log('Target URL:', targetUrl.replace(API_KEY, 'REDACTED'));

    // Google Gemini API에 Ephemeral Token 요청
    const googleResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          uses: 1, // 1회 세션용
        },
      }),
    });

    const responseText = await googleResponse.text();
    console.log('Google API Status:', googleResponse.status);
    console.log('Google API Raw Response:', responseText);

    if (!googleResponse.ok) {
      return response.status(googleResponse.status).json({ 
        error: `Google API error (${googleResponse.status})`,
        details: responseText
      });
    }

    try {
      const data = JSON.parse(responseText);
      // authTokens:create 엔드포인트는 'name' 필드에 토큰 값을 반환합니다.
      const token = data.name;
      
      if (!token) {
        console.error('Token field (name) missing in response:', data);
        return response.status(500).json({
          error: 'Google 응답에서 토큰 필드(name)를 찾을 수 없습니다.',
          details: responseText
        });
      }

      console.log('Successfully fetched ephemeral token.');
      return response.status(200).json({ token });
    } catch (parseError) {
      console.error('JSON Parse Error:', responseText);
      return response.status(500).json({ 
        error: 'Google API가 올바른 JSON 형식을 반환하지 않았습니다.',
        details: responseText
      });
    }
  } catch (error: any) {
    console.error('Token fetch error:', error);
    return response.status(500).json({ 
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message 
    });
  }
}
