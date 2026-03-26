import { useState } from 'react'

export default function ScreenGenerate({ goTo, profile }) {
  const [target,  setTarget]  = useState('')
  const [tone,    setTone]    = useState('formal')
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(false)

  const tones = [
    { key: 'formal',  label: '정중하게' },
    { key: 'casual',  label: '친근하게' },
    { key: 'short',   label: '짧게' },
  ]

  async function generate() {
    if (!target.trim()) return
    setMsg('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: { name: target, type: '갤러리/브랜드' },
          tone,
          artistInfo: profile,
        }),
      })
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n'); buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try { setMsg(prev => prev + JSON.parse(data)) } catch { /* ignore */ }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function copyMsg() {
    if (!msg) return
    try { await navigator.clipboard.writeText(msg) } catch { /* ignore */ }
  }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    color: '#6E6E6E',
    marginBottom: 6,
    textTransform: 'uppercase',
  }

  const inputStyle = {
    width: '100%',
    background: '#FFFFFF',
    border: '2px solid #000000',
    borderRadius: 14,
    padding: '13px 14px',
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Noto Sans KR, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <>
      {/* CT Topbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px 10px',
        position: 'sticky',
        top: 0,
        background: '#FFFFFF',
        borderBottom: '1px solid #F5F5F5',
        zIndex: 10,
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 4, color: '#000000' }}>CONTACTO</span>
        <button
          onClick={() => goTo('done')}
          style={{
            background: 'none', border: 'none', color: '#000000',
            fontSize: 18, cursor: 'pointer', fontWeight: 700, lineHeight: 1,
          }}
        >✕</button>
      </div>

      <div style={{ padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: 16, background: '#FFFFFF' }}>

        {/* Header text */}
        <div style={{ paddingTop: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 4,
            color: '#6E6E6E', textTransform: 'uppercase', marginBottom: 8,
          }}>컨택 메시지</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#000000', letterSpacing: -1, lineHeight: 1.2, marginBottom: 8 }}>
            협업 제안<br />메시지 만들기
          </div>
          <div style={{ fontSize: 14, color: '#6E6E6E', lineHeight: 1.7 }}>
            수신자 이름을 입력하고 원하는 어투를 선택하세요
          </div>
        </div>

        {/* Target input */}
        <div>
          <div style={labelStyle}>수신자</div>
          <input
            id="gen-target"
            style={inputStyle}
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="갤러리명 또는 브랜드명"
          />
        </div>

        {/* Tone chips */}
        <div>
          <div style={labelStyle}>어투</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tones.map(t => (
              <button
                key={t.key}
                onClick={() => setTone(t.key)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 9999,
                  border: tone === t.key ? '2px solid #2EA7E0' : '2px solid #000000',
                  background: tone === t.key ? '#2EA7E0' : '#FFFFFF',
                  color: tone === t.key ? '#FFFFFF' : '#000000',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Noto Sans KR, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading || !target.trim()}
          style={{
            padding: 17,
            background: '#000000',
            color: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: 9999,
            fontSize: 15,
            fontWeight: 800,
            cursor: loading || !target.trim() ? 'default' : 'pointer',
            fontFamily: 'Noto Sans KR, sans-serif',
            width: '100%',
            letterSpacing: -0.3,
            opacity: loading || !target.trim() ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? '생성 중…' : '메시지 생성하기'}
        </button>

        {/* Output area */}
        {(msg || loading) && (
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: 16,
            padding: '16px 18px',
            minHeight: 160,
            fontSize: 14,
            color: '#000000',
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
            position: 'relative',
          }}>
            {msg}
            {loading && (
              <span style={{
                display: 'inline-block',
                width: 2,
                height: '1em',
                background: '#2EA7E0',
                verticalAlign: 'text-bottom',
                animation: 'blink 1s step-end infinite',
                marginLeft: 1,
              }} />
            )}
          </div>
        )}

        {/* Copy + regenerate */}
        {msg && !loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={copyMsg}
              style={{
                flex: 1,
                padding: '13px 0',
                background: '#000000',
                color: '#FFFFFF',
                border: '2px solid #000000',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Noto Sans KR, sans-serif',
              }}
            >복사하기</button>
            <button
              onClick={generate}
              style={{
                flex: 1,
                padding: '13px 0',
                background: '#FFFFFF',
                color: '#000000',
                border: '2px solid #000000',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Noto Sans KR, sans-serif',
              }}
            >다시 생성</button>
          </div>
        )}
      </div>
    </>
  )
}
