export default function ScreenAnalyzing({ msg }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 20,
      padding: '40px 24px',
      minHeight: 600,
      background: '#000000',
    }}>
      {/* Spinner */}
      <div style={{
        width: 48,
        height: 48,
        border: '2.5px solid rgba(255,255,255,0.1)',
        borderTopColor: '#2EA7E0',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      {/* Text */}
      <div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: -0.5,
        }}>
          프로필 생성 중
        </div>
        <div style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.7,
          marginTop: 6,
          whiteSpace: 'pre-line',
        }}>
          {msg || 'AI가 포트폴리오를 읽고\nContacto 카드를 만들고 있어요'}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#2EA7E0',
              animation: `dp 1.4s ease-in-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
