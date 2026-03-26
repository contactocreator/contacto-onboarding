import { useState } from 'react'
import './index.css'

import ScreenOnboard   from './screens/ScreenOnboard'
import ScreenAnalyzing from './screens/ScreenAnalyzing'
import ScreenProfile   from './screens/ScreenProfile'
import ScreenPick      from './screens/ScreenPick'
import ScreenDone      from './screens/ScreenDone'
import ScreenGenerate  from './screens/ScreenGenerate'

export default function App() {
  const [screen, setScreen]             = useState('onboard')
  const [profile, setProfile]           = useState(null)
  const [images, setImages]             = useState([])
  const [allImages, setAllImages]       = useState([])
  const [postsScanned, setPostsScanned] = useState(0)
  const [analyzingMsg, setAnalyzingMsg] = useState('')

  const goTo = (s) => setScreen(s)

  const sharedProps = {
    goTo, profile, setProfile,
    images, setImages,
    allImages, setAllImages,
    postsScanned, setPostsScanned,
    setAnalyzingMsg,
  }

  return (
    <div style={{
      width: 390,
      background: '#FFFFFF',
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 40px 100px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.1)',
      border: '2px solid #000000',
      marginTop: 28,
    }}>
      <StatusBar dark={screen === 'analyzing'} />
      {screen === 'onboard'   && <ScreenOnboard   {...sharedProps} />}
      {screen === 'analyzing' && <ScreenAnalyzing msg={analyzingMsg} />}
      {screen === 'profile'   && <ScreenProfile   {...sharedProps} />}
      {screen === 'pick'      && <ScreenPick      {...sharedProps} />}
      {screen === 'done'      && <ScreenDone      {...sharedProps} />}
      {screen === 'generate'  && <ScreenGenerate  {...sharedProps} />}
    </div>
  )
}

function StatusBar({ dark }) {
  const [time] = useState(() => {
    const d = new Date()
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  })
  const fg = dark ? '#FFFFFF' : '#000000'
  const bg = dark ? '#000000' : '#FFFFFF'
  return (
    <div style={{
      height: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      background: bg,
    }}>
      <span style={{ color: fg, fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>{time}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0"    y="5" width="3" height="7"  rx="1" fill={fg} opacity="0.3"/>
          <rect x="4.5"  y="3" width="3" height="9"  rx="1" fill={fg} opacity="0.5"/>
          <rect x="9"    y="1" width="3" height="11" rx="1" fill={fg} opacity="0.7"/>
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill={fg}/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={fg} strokeOpacity="0.3"/>
          <rect x="2"   y="2"   width="17" height="8"  rx="2"   fill={fg}/>
          <path d="M23 4v4c1-.4 1.5-1 1.5-2s-.5-1.6-1.5-2z" fill={fg} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  )
}
