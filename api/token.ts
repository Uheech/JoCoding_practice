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

  if (!API_KEY) {
    return response.status(500).json({ 
      error: 'GEMINI_API_KEY가 설정되지 않았습니다. Vercel 프로젝트 설정에서 환경 변수를 확인해주세요.' 
    });
  }

  try {
    // Google Gemini API에 Ephemeral Token 요청
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1alpha/projects/-/locations/-/authtokens:create?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            uses: 1, // 1회 세션용
            // 30분 후 만료 (기본값)
          },
        }),
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      throw new Error(data.error?.message || 'Failed to fetch token');
    }

    // 클라이언트에게 토큰 전달
    return response.status(200).json({ token: data.name });
  } catch (error: any) {
    console.error('Token fetch error:', error);
    return response.status(500).json({ error: error.message });
  }
}
