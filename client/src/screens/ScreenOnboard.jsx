import { useState, useRef } from 'react'

export default function ScreenOnboard({ goTo, setProfile, setImages, setAllImages, setPostsScanned, setAnalyzingMsg }) {
  const [tab, setTab] = useState('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [err, setErr] = useState('')
  const [isDrag, setIsDrag] = useState(false)
  const [urlFocused, setUrlFocused] = useState(false)
  const fileInputRef = useRef()

  const showIgHint = /instagram\.com/.test(url)

  async function handleSubmit() {
    setErr('')
    if (tab === 'url') {
      if (!url) { setErr('URL을 입력해주세요'); return }
      if (!url.startsWith('http')) { setErr('https://로 시작하는 URL을 입력하세요'); return }
      setAnalyzingMsg('웹페이지를 읽고 있어요\n잠시만 기다려주세요')
      goTo('analyzing')
      try {
        const res = await fetch('/api/onboard/url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || '분석 실패')
        setProfile(data.profile)
        setImages(data.images || [])
        setAllImages(data.allImages || data.images || [])
        setPostsScanned(data.postsScanned || 0)
        if ((data.allImages || []).length > 0) goTo('pick')
        else goTo('profile')
      } catch (e) { goTo('onboard'); setErr(e.message) }
    } else if (tab === 'pdf') {
      if (!pdfFile) { setErr('PDF 파일을 선택해주세요'); return }
      setAnalyzingMsg('PDF를 읽고 있어요\n잠시만 기다려주세요')
      goTo('analyzing')
      try {
        const fd = new FormData(); fd.append('pdf', pdfFile)
        const res = await fetch('/api/onboard/pdf', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || '분석 실패')
        setProfile(data.profile); setImages([]); setAllImages([])
        goTo('profile')
      } catch (e) { goTo('onboard'); setErr(e.message) }
    } else {
      if (!text.trim()) { setErr('소개 텍스트를 입력해주세요'); return }
      setAnalyzingMsg('텍스트를 분석하고 있어요\n잠시만 기다려주세요')
      goTo('analyzing')
      try {
        const res = await fetch('/api/onboard/text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || '분석 실패')
        setProfile(data.profile); setImages([]); setAllImages([])
        goTo('profile')
      } catch (e) { goTo('onboard'); setErr(e.message) }
    }
  }

  const canSubmit = tab === 'url' ? !!url : tab === 'pdf' ? !!pdfFile : !!text.trim()

  return (
    <div style={{ padding: '0 24px 36px', display: 'flex', flexDirection: 'column', background: '#FFFFFF', animation: 'fadeUp 0.3s ease' }}>

      {/* Eyebrow */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 4,
        color: '#6E6E6E',
        marginBottom: 16,
        marginTop: 8,
        textTransform: 'uppercase',
      }}>CONTACTO</div>

      {/* Headline */}
      <h1 style={{
        fontSize: 38,
        fontWeight: 900,
        color: '#000000',
        lineHeight: 1.12,
        marginBottom: 12,
        letterSpacing: -2,
      }}>
        포트폴리오를<br />
        <span style={{ color: '#2EA7E0' }}>Contacto</span><br />
        프로필로
      </h1>

      {/* Sub */}
      <p style={{ fontSize: 14, color: '#6E6E6E', lineHeight: 1.7, marginBottom: 28 }}>
        웹사이트나 PDF를 넣으면 AI가<br />Contacto 프로필 카드를 자동 생성합니다
      </p>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        background: '#F5F5F5',
        borderRadius: 14,
        padding: 4,
        marginBottom: 16,
        gap: 3,
      }}>
        {['url', 'pdf', 'text'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '11px 8px',
              border: tab === t ? '2px solid #000000' : '2px solid transparent',
              background: tab === t ? '#F5DFDB' : 'transparent',
              color: tab === t ? '#000000' : '#6E6E6E',
              fontSize: 12,
              fontWeight: tab === t ? 800 : 600,
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'Noto Sans KR, sans-serif',
              transition: 'all 0.18s',
            }}
          >
            {t === 'url' ? '웹사이트 URL' : t === 'pdf' ? 'PDF 업로드' : '텍스트 입력'}
          </button>
        ))}
      </div>

      {/* URL tab */}
      {tab === 'url' && (
        <>
          <div style={{
            background: '#FFFFFF',
            border: urlFocused ? '2px solid #2EA7E0' : '2px solid #000000',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'border-color 0.15s',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, opacity: 0.5 }}>🔗</span>
            <input
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#000000',
                fontSize: 14,
                fontFamily: 'Noto Sans KR, sans-serif',
              }}
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onFocus={() => setUrlFocused(true)}
              onBlur={() => setUrlFocused(false)}
              placeholder="https://yourportfolio.com 또는 instagram.com/…"
            />
          </div>

          {showIgHint && (
            <div style={{
              marginTop: 10,
              padding: '12px 14px',
              background: '#F5F5F5',
              borderRadius: 12,
              border: '2px solid #2EA7E0',
              fontSize: 12,
              lineHeight: 1.6,
            }}>
              📷 <strong style={{ color: '#2EA7E0' }}>인스타그램 감지</strong> — 프로필과 최근 게시물을 자동으로 분석합니다.<br />
              <span style={{ color: '#6E6E6E' }}>공개 계정만 지원됩니다.</span>
            </div>
          )}
        </>
      )}

      {/* PDF tab */}
      {tab === 'pdf' && (
        <div
          style={{
            border: isDrag ? '2px dashed #2EA7E0' : '2px dashed #000000',
            borderRadius: 16,
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDrag ? 'rgba(46,167,224,0.04)' : '#FFFFFF',
            transition: 'all 0.2s',
          }}
          onClick={() => fileInputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setIsDrag(true) }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={e => {
            e.preventDefault(); setIsDrag(false)
            const f = e.dataTransfer.files[0]
            if (f?.type === 'application/pdf') setPdfFile(f)
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 15,
            background: '#F5F5F5',
            border: '2px solid #000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 22,
          }}>📄</div>
          <p style={{ fontSize: 13, color: '#6E6E6E', lineHeight: 1.7 }}>
            PDF를 드래그하거나<br />탭해서 파일 선택
          </p>
          {pdfFile && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#2EA7E0', fontWeight: 700 }}>
              {pdfFile.name}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={e => e.target.files[0] && setPdfFile(e.target.files[0])} />
        </div>
      )}

      {/* Text tab */}
      {tab === 'text' && (
        <textarea
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: 14,
            padding: '13px 14px',
            color: '#000000',
            fontSize: 13,
            fontFamily: 'Noto Sans KR, sans-serif',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.6,
            minHeight: 140,
          }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={'인스타그램 바이오, 작가 소개, 포트폴리오 설명 등을 자유롭게 붙여넣어주세요.\n\n예)\n세라믹 아티스트 김준석\nLUCA 시리즈 — 광택 유약과 골드리프를 결합한 팝아트 오브제\n국내외 아트페어 참가 / 갤러리 협업'}
        />
      )}

      {/* Error */}
      {err && (
        <div style={{
          background: 'rgba(254,56,67,0.08)',
          border: '2px solid #FE3843',
          borderRadius: 12,
          padding: '12px 14px',
          color: '#FE3843',
          fontSize: 13,
          marginTop: 14,
          lineHeight: 1.5,
        }}>
          {err}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 24 }} />

      {/* CTA */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: 24,
          padding: 17,
          background: '#000000',
          color: '#FFFFFF',
          border: '2px solid #000000',
          borderRadius: 9999,
          fontSize: 15,
          fontWeight: 800,
          cursor: canSubmit ? 'pointer' : 'default',
          fontFamily: 'Noto Sans KR, sans-serif',
          width: '100%',
          letterSpacing: -0.3,
          opacity: canSubmit ? 1 : 0.3,
          transition: 'opacity 0.15s',
        }}
      >
        프로필 생성하기
      </button>
    </div>
  )
}
