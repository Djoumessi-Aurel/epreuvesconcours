import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: '#1e40af',
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Feuille de papier / épreuve */}
      <div
        style={{
          width: 18,
          height: 22,
          background: 'white',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 3px',
          gap: 3,
        }}
      >
        <div style={{ width: 12, height: 2, background: '#1e40af', borderRadius: 1, opacity: 0.55 }} />
        <div style={{ width: 12, height: 2, background: '#1e40af', borderRadius: 1, opacity: 0.55 }} />
        <div style={{ width: 8,  height: 2, background: '#1e40af', borderRadius: 1, opacity: 0.55 }} />
      </div>
    </div>,
    { ...size }
  )
}
