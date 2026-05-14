import { ImageResponse } from 'next/og'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#1e40af',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 110,
            height: 136,
            background: 'white',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '0 18px',
            gap: 16,
          }}
        >
          <div style={{ width: 74, height: 10, background: '#1e40af', borderRadius: 5, opacity: 0.6 }} />
          <div style={{ width: 74, height: 10, background: '#1e40af', borderRadius: 5, opacity: 0.6 }} />
          <div style={{ width: 50, height: 10, background: '#1e40af', borderRadius: 5, opacity: 0.6 }} />
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
