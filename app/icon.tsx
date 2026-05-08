import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0e0f0c',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#9fe870',
            borderRadius: '5px',
            width: '22px',
            height: '22px',
          }}
        >
          <span
            style={{
              color: '#1a3a0a',
              fontSize: '14px',
              fontWeight: 900,
              fontFamily: 'sans-serif',
              lineHeight: 1,
            }}
          >
            M
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
