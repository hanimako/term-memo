import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('google_access_token')?.value;
    const refreshToken = request.cookies.get('google_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    // アクセストークンが有効かチェック
    const checkResponse = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (checkResponse.ok) {
      return NextResponse.json({ accessToken });
    }

    // アクセストークンが無効で、リフレッシュトークンがある場合
    if (refreshToken) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json();
        const newAccessToken = tokenData.access_token;

        // 新しいアクセストークンをクッキーに保存
        const response = NextResponse.json({ accessToken: newAccessToken });
        response.cookies.set('google_access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600, // 1時間
        });

        return response;
      }
    }

    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
  } catch (error) {
    console.error('Token retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
