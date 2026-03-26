import { useState } from 'react'

const FILTER_COLORS = [
  { bg: 'rgba(254,56,67,0.12)',   border: '#FE3843',   color: '#FE3843' },
  { bg: 'rgba(239,98,199,0.12)',  border: '#EF62C7',   color: '#EF62C7' },
  { bg: 'rgba(26,118,255,0.12)',  border: '#1A76FF',   color: '#1A76FF' },
  { bg: 'rgba(152,254,104,0.15)', border: '#98FE68',   color: '#2d8c00' },
  { bg: 'rgba(255,219,28,0.15)',  border: '#FFDB1C',   color: '#8a6d00' },
]

export default function ScreenProfile({ goTo, profile, setProfile, images, allImages, postsScanned }) {
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editMedium, setEditMedium] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editSeries, setEditSeries] = useState('')
  const [editKeywords, setEditKeywords] = useState('')

  if (!profile) return null

  const name     = profile.name || ''
  const medium   = profile.medium || profile.category || ''
  const bio      = profile.bio || profile.description || ''
  const series   = profile.series || profile.works || []
  const keywords = profile.keywords || profile.tags || []

  function openEdit() {
    setEditName(name)
    setEditMedium(medium)
    setEditBio(bio)
    setEditSeries(Array.isArray(series) ? series.join('\n') : series)
    setEditKeywords(Array.isArray(keywords) ? keywords.join(', ') : keywords)
    setEditOpen(true)
  }

  function saveEdit() {
    const updatedSeries   = editSeries.split('\n').map(s => s.trim()).filter(Boolean)
    const updatedKeywords = editKeywords.split(',').map(k => k.trim()).filter(Boolean)
    setProfile({ ...profile, name: editName, medium: editMedium, bio: editBio, series: updatedSeries, keywords: updatedKeywords })
    setEditOpen(false)
  }

  function registerProfile() {
    localStorage.setItem('contacto_profile', JSON.stringify(profile))
    goTo('done')
  }

  const hasImages = images && images.length > 0
  const imgSrcs   = hasImages ? images.slice(0, 3).map(img => (typeof img === 'string' ? img : img.url || img)) : []

  const inputStyle = {
    width: '100%',
    background: '#FFFFFF',
    border: '2px solid #000000',
    borderRadius: 10,
    padding: '11px 13px',
    color: '#000000',
    fontSize: 13,
    fontFamily: 'Noto Sans KR, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const textareaStyle = {
    ...inputStyle,
    resize: 'none',
    lineHeight: 1.6,
    minHeight: 68,
  }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    color: '#6E6E6E',
    marginBottom: 5,
    textTransform: 'uppercase',
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: '100vh', background: '#FFFFFF' }}>

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
        <button
          onClick={() => goTo('onboard')}
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#000000',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'serif',
            letterSpacing: -1,
            lineHeight: 1,
            padding: '2px 4px',
          }}
        >←</button>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 4, color: '#000000' }}>CONTACTO</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Image collage */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 2,
        background: '#F5F5F5',
      }}>
        {hasImages ? (
          <>
            <img src={imgSrcs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', gridRow: '1 / 3' }} />
            {imgSrcs[1]
              ? <img src={imgSrcs[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ background: '#EBEBEB' }} />
            }
            {imgSrcs[2]
              ? <img src={imgSrcs[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ background: '#E2E2E2' }} />
            }
          </>
        ) : (
          <>
            <div style={{
              gridRow: '1 / 3',
              background: '#F5F5F5',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: 20,
            }}>
              <div style={{ fontSize: 32, opacity: 0.35 }}>🎨</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#000000', textAlign: 'center', letterSpacing: -0.5 }}>{name}</div>
              <div style={{ fontSize: 12, color: '#6E6E6E', textAlign: 'center' }}>{medium}</div>
            </div>
            <div style={{ background: '#EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#6E6E6E', textAlign: 'center', padding: 8, lineHeight: 1.4 }}>포트폴리오<br />이미지</div>
            <div style={{ background: '#E2E2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#6E6E6E', textAlign: 'center', padding: 8, lineHeight: 1.4 }}>작품<br />사진</div>
          </>
        )}
      </div>

      {/* Posts scanned info */}
      {postsScanned > 0 && (
        <div style={{ padding: '8px 20px', background: '#F5F5F5', borderBottom: '1px solid #EBEBEB' }}>
          <span style={{ fontSize: 11, color: '#6E6E6E', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2EA7E0', display: 'inline-block', flexShrink: 0 }} />
            {postsScanned}개 게시물을 스캔해 프로필을 생성했어요
          </span>
        </div>
      )}

      {/* Artist info area */}
      <div style={{ padding: '20px 20px 0' }}>

        {/* Filter badges */}
        {keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {keywords.slice(0, 5).map((kw, i) => (
              <span key={i} style={{
                borderRadius: 9999,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.2,
                border: `2px solid ${FILTER_COLORS[i % 5].border}`,
                background: FILTER_COLORS[i % 5].bg,
                color: FILTER_COLORS[i % 5].color,
              }}>{kw}</span>
            ))}
          </div>
        )}

        {/* Name */}
        <div style={{ fontSize: 30, fontWeight: 900, color: '#000000', letterSpacing: -1, marginBottom: 4, lineHeight: 1.1 }}>
          {name || '—'}
        </div>

        {/* Medium */}
        <div style={{ fontSize: 14, color: '#6E6E6E', marginBottom: 12 }}>
          {medium || '—'}
        </div>

        {/* Bio */}
        {bio && (
          <div style={{ fontSize: 14, color: '#6E6E6E', lineHeight: 1.7, marginBottom: 16 }}>
            {bio}
          </div>
        )}

        {/* Series list */}
        {series.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {series.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#FFFFFF',
                border: '2px solid #000000',
                borderRadius: 12,
                padding: '12px 16px',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2EA7E0', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#000000' }}>
                  {typeof item === 'string' ? item : item.name || item.title || ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Edit toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button
            onClick={editOpen ? () => setEditOpen(false) : openEdit}
            style={{
              fontSize: 12,
              color: '#000000',
              background: '#FFFFFF',
              border: '2px solid #000000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 14px',
              borderRadius: 8,
              fontFamily: 'Noto Sans KR, sans-serif',
              fontWeight: 600,
            }}
          >
            ✏️ {editOpen ? '수정 닫기' : '내용 수정하기'}
          </button>
          {allImages && allImages.length > 0 && (
            <button
              onClick={() => goTo('pick')}
              style={{
                fontSize: 12,
                color: '#000000',
                background: '#FFFFFF',
                border: '2px solid #000000',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                borderRadius: 8,
                fontFamily: 'Noto Sans KR, sans-serif',
                fontWeight: 600,
              }}
            >
              🖼 사진 변경
            </button>
          )}
        </div>

        {/* Edit fields */}
        {editOpen && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 1, background: '#F0F0F0', margin: '16px 0' }} />
            {[
              { label: '이름', val: editName, set: setEditName, ph: '이름', ta: false },
              { label: '매체 / 분야', val: editMedium, set: setEditMedium, ph: '예) 세라믹 아티스트', ta: false },
              { label: '바이오', val: editBio, set: setEditBio, ph: '작가 소개', ta: true },
              { label: '시리즈 / 작품 (줄바꿈으로 구분)', val: editSeries, set: setEditSeries, ph: '시리즈명', ta: true },
              { label: '키워드 (쉼표로 구분)', val: editKeywords, set: setEditKeywords, ph: '예) 세라믹, 팝아트, 골드리프', ta: false },
            ].map(({ label, val, set, ph, ta }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={labelStyle}>{label}</div>
                {ta
                  ? <textarea style={textareaStyle} value={val} onChange={e => set(e.target.value)} placeholder={ph} rows={3} />
                  : <input style={inputStyle} value={val} onChange={e => set(e.target.value)} placeholder={ph} />
                }
              </div>
            ))}
            <button
              onClick={saveEdit}
              style={{
                width: '100%',
                padding: '13px 0',
                background: '#000000',
                color: '#FFFFFF',
                border: '2px solid #000000',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Noto Sans KR, sans-serif',
                marginTop: 4,
              }}
            >저장하기</button>
            <div style={{ height: 1, background: '#F0F0F0', margin: '16px 0' }} />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '16px 0 24px' }}>
          {/* Skip */}
          <button
            onClick={() => goTo('onboard')}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, cursor: 'pointer', color: '#000000',
            }}
          >✕</button>

          {/* Main register */}
          <button
            onClick={registerProfile}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#000000',
              border: '2px solid #000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, cursor: 'pointer', color: '#FFFFFF',
            }}
          >✓</button>

          {/* Chat / generate */}
          <button
            onClick={() => goTo('generate')}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, cursor: 'pointer', color: '#000000',
            }}
          >✉</button>
        </div>
      </div>
    </div>
  )
}
