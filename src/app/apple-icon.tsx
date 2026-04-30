import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: '#1e40af',
        borderRadius: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Feuille de papier / épreuve */}
      <div
        style={{
          width: 100,
          height: 124,
          background: 'white',
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 16px',
          gap: 14,
        }}
      >
        <div style={{ width: 68, height: 10, background: '#1e40af', borderRadius: 5, opacity: 0.55 }} />
        <div style={{ width: 68, height: 10, background: '#1e40af', borderRadius: 5, opacity: 0.55 }} />
        <div style={{ width: 46, height: 10, background: '#1e40af', borderRadius: 5, opacity: 0.55 }} />
      </div>
    </div>,
    { ...size }
  )
}
