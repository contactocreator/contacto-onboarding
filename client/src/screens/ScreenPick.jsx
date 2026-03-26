import { useState } from 'react'

export default function ScreenPick({ goTo, images, setImages, allImages, postsScanned }) {
  const [selected, setSelected] = useState(new Set(images.map(img => (typeof img === 'string' ? img : img.url || img))))

  function toggle(img) {
    const key = typeof img === 'string' ? img : img.url || img
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        if (next.size >= 6) return prev
        next.add(key)
      }
      return next
    })
  }

  function applySelection() {
    const picked = allImages.filter(img => {
      const key = typeof img === 'string' ? img : img.url || img
      return selected.has(key)
    })
    setImages(picked)
    goTo('profile')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh', background: '#FFFFFF' }}>

      {/* Header */}
      <div style={{
        padding: '14px 20px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFFFFF',
        borderBottom: '1px solid #F5F5F5',
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#000000', letterSpacing: -0.5 }}>사진 선택</div>
          <div style={{ fontSize: 12, color: '#6E6E6E', marginTop: 3 }}>
            {postsScanned > 0 ? `${postsScanned}개 게시물 스캔됨 · 최대 6장` : '최대 6장 선택'}
          </div>
        </div>
        <button
          onClick={() => goTo('profile')}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#FFFFFF',
            border: '2px solid #000000',
            color: '#000000',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700,
          }}
        >✕</button>
      </div>

      {/* Scrollable grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {allImages.map((img, i) => {
            const key   = typeof img === 'string' ? img : img.url || img
            const src   = typeof img === 'string' ? img : img.url || img
            const isSel = selected.has(key)
            return (
              <div
                key={i}
                onClick={() => toggle(img)}
                style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'pointer' }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    opacity: isSel ? 0.4 : 1,
                    transition: 'opacity 0.15s',
                  }}
                />
                {isSel && (
                  <div style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#000000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 900, color: '#FFFFFF',
                  }}>
                    ✓
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #F5F5F5',
        padding: '14px 20px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 13, color: '#6E6E6E', flex: 1 }}>
          <strong style={{ color: '#000000' }}>{selected.size}장</strong> 선택됨 (최대 6장)
        </div>
        <button
          onClick={applySelection}
          disabled={selected.size === 0}
          style={{
            padding: '12px 28px',
            background: '#000000',
            color: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: 9999,
            fontSize: 14,
            fontWeight: 800,
            cursor: selected.size === 0 ? 'default' : 'pointer',
            fontFamily: 'Noto Sans KR, sans-serif',
            opacity: selected.size === 0 ? 0.3 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          카드 적용
        </button>
      </div>
    </div>
  )
}
