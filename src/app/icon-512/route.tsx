import { ImageResponse } from 'next/og'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#1e40af',
          borderRadius: 108,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 294,
            height: 362,
            background: 'white',
            borderRadius: 36,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '0 48px',
            gap: 42,
          }}
        >
          <div style={{ width: 198, height: 26, background: '#1e40af', borderRadius: 13, opacity: 0.6 }} />
          <div style={{ width: 198, height: 26, background: '#1e40af', borderRadius: 13, opacity: 0.6 }} />
          <div style={{ width: 134, height: 26, background: '#1e40af', borderRadius: 13, opacity: 0.6 }} />
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
