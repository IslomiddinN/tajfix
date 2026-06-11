import { ImageResponse } from 'next/og';

// Динамическая Open Graph картинка для превью ссылок в соцсетях/мессенджерах.
export const runtime = 'edge';
export const alt = 'TajFix — Ремонт техники и магазин электроники в Душанбе';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #0F172A 100%)',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ fontSize: 100, fontWeight: 800, letterSpacing: '-2px' }}>TajFix</div>
        <div style={{ fontSize: 44, marginTop: 24, opacity: 0.95 }}>
          Ремонт техники и магазин электроники
        </div>
        <div style={{ fontSize: 36, marginTop: 16, opacity: 0.8 }}>
          Душанбе · Вызов мастера · Оплата при получении
        </div>
      </div>
    ),
    { ...size }
  );
}
