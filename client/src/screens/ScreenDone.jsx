export default function ScreenDone({ goTo, profile }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 16,
      padding: '40px 24px',
      minHeight: 600,
      background: '#FFFFFF',
      animation: 'fadeUp 0.35s ease',
    }}>

      {/* Check mark circle */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: '#000000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, marginBottom: 8, color: '#FFFFFF',
        border: '2px solid #000000',
      }}>
        ✓
      </div>

      {/* Title */}
      <div style={{ fontSize: 28, fontWeight: 900, color: '#000000', letterSpacing: -1 }}>
        프로필 등록 완료
      </div>

      {/* Sub */}
      <div style={{ fontSize: 14, color: '#6E6E6E', lineHeight: 1.7 }}>
        Contacto 프로필 카드가 생성됐어요.<br />협업 메시지를 바로 만들어볼 수 있어요.
      </div>

      {/* Profile badge */}
      {profile && (
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #000000',
          borderRadius: 14,
          padding: '14px 18px',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2EA7E0', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#000000', letterSpacing: -0.3 }}>
              {profile.name || '아티스트'}
            </div>
            <div style={{ fontSize: 12, color: '#6E6E6E', marginTop: 2 }}>
              {profile.medium || profile.category || ''}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
        <button
          onClick={() => goTo('generate')}
          style={{
            padding: 17,
            background: '#000000',
            color: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: 9999,
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'Noto Sans KR, sans-serif',
            width: '100%',
            letterSpacing: -0.3,
          }}
        >
          메시지 생성하기
        </button>
        <button
          onClick={() => goTo('onboard')}
          style={{
            padding: 17,
            background: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: 9999,
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'Noto Sans KR, sans-serif',
            width: '100%',
            letterSpacing: -0.3,
          }}
        >
          처음으로
        </button>
      </div>
    </div>
  )
}
