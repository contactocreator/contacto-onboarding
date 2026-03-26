---
name: design-apply
description: 디자인 요구사항을 받아 Contacto 디자인 시스템 토큰을 기반으로 컴포넌트 스타일을 구현합니다
triggers:
  - "/design-apply"
  - "디자인 적용"
  - "토큰 적용"
  - "스타일 적용"
---

# Design Apply — 디자인 요구사항 → 코드 구현

디자인 요구사항(Figma 스펙, 텍스트 설명, 스크린샷 등)을 받아 Contacto 디자인 토큰 기반으로 스타일을 적용합니다.

## 설치 방법

이 파일을 프로젝트 루트의 `.claude/skills/design-apply/SKILL.md`에 복사하세요.

```
your-project/
└── .claude/
    └── skills/
        └── design-apply/
            └── SKILL.md    ← 이 파일
```

## 사전 준비: 토큰 파일 위치 탐색

스킬 실행 시 먼저 프로젝트에서 디자인 토큰 파일을 찾아야 합니다. 아래 패턴으로 탐색합니다:

```
**/design-tokens/styles.*
**/design-tokens/**
**/tokens/**
**/theme/**
**/constants/colors.*
tailwind.config.*
```

찾은 경로를 기반으로 import 문을 구성합니다.

또한 기존 컴포넌트 3~5개를 읽어 프로젝트의 스타일링 방식(인라인 style / NativeWind className / CSS-in-JS / Tailwind 등)을 파악합니다.

---

## Contacto 브랜드 아이덴티티

Contacto는 **크리에이터 매칭 플랫폼**입니다.

### 비주얼 성격
- **클린 & 모던**: 화이트 배경 기본, 높은 대비의 블랙 보더(2px)
- **플레이풀한 인터랙션**: 컬러풀한 필터 배지, 카드 스와이프 애니메이션
- **프로페셔널하면서 친근함**: 핑크 세컨더리로 따뜻한 느낌, 선명한 액센트로 활기

### 컬러 사용 패턴
- **Primary Blue (`#2EA7E0`)**: 모든 인터랙티브 요소 — 버튼, 링크, 포커스 보더, 배지
- **Secondary Pink (`#F5DFDB`)**: 활성 탭 상태, 채팅 헤더 배경, 세컨더리 버튼
- **Accent Green (`#BAEF62`)**: 하이라이트, 튜토리얼 강조
- **Black (`#000000`)**: 홈/피드 배경 (몰입형), 탭바 배경, 텍스트
- **White (`#FFFFFF`)**: 대부분 화면의 기본 배경

### 타이포그래피 사용 패턴
- **FKRaster (디스플레이)**: 탭 타이틀, 배지, 채팅 타이틀, 버튼 — 레트로/아트 감성
- **ABCDiatype (본문)**: 일반 텍스트, 설명, 입력값 — 깔끔한 산세리프
- **Pretendard (한국어)**: 한국어 텍스트 전용 폴백
- **Letter Spacing**: 디스플레이 폰트에 5% 자간 (`letterSpacing: fontSize * 0.05`)

### 핵심 UI 패턴
- **카드 스택**: 홈 화면은 Tinder 스타일 카드 스와이프 (포트폴리오 탐색)
- **2px 블랙 보더**: 메시지 버블, 배지, 인풋 필드에 굵은 검은 테두리
- **컬러 필터 배지**: 카테고리 구분 — 빨강/핑크/파랑/초록/노랑 5색
- **햅틱 피드백**: 스와이프 시 expo-haptics 사용
- **원형 아바타**: 32px(작은), 68px(채팅 리스트) 크기, 폴백으로 이니셜 표시

### 화면별 테마
| 화면 | 배경 | 텍스트 |
|------|------|--------|
| 홈/피드 | Black (몰입형) | White |
| 채팅 리스트 | White | Black |
| 채팅방 헤더 | Pink (`#F5DFDB`) | Black |
| 프로필/설정 | White | Black |
| 온보딩 | White | Black |
| 탭바 | Black | Gray → Pink (활성) |
| 모달 오버레이 | `rgba(0,0,0,0.5)` | White |

### 주요 컴포넌트 스타일 레퍼런스

**메시지 버블**
- 내 메시지: `backgroundColor: colors.primary` (파랑)
- 상대 메시지: `backgroundColor: colors.warning` (노랑)
- 공통: `borderWidth: 2, borderColor: black`, maxWidth 60%, padding 11px/7px

**배지 (Badge)**
- dot / count 두 가지 variant
- 기본 색상: primary blue, 크기: sm(6-16px) / md(8-20px) / lg(10-24px)
- 디스플레이 볼드 폰트 + 5% letter-spacing

**알림 모달 (AlertModal)**
- 콘텐츠 배경: `#E8E8ED`, 버튼 높이: 48px
- 구분선: `#C6C6CC` hairline
- 파란 텍스트(확인) / 빨간 텍스트(삭제)

**탭바**
- 높이: 120px, 배경: black
- 아이콘: 비활성 gray → 활성 pink (secondary)
- 커스텀 SVG 아이콘 5개 (Home, Chat, Projects, Notifications, Likes)

---

## 디자인 토큰 레퍼런스

### 컬러 토큰 (colors)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `colors.primary` | `#2EA7E0` | 브랜드 블루, 주요 액션 |
| `colors.secondary` | `#F5DFDB` | 핑크 배경, 활성 탭 |
| `colors.accent` | `#BAEF62` | 그린 액센트, 하이라이트 |
| `colors.textPrimary` | `#000000` | 기본 텍스트, 탭바 배경 |
| `colors.textSecondary` | `#6E6E6E` | 보조 텍스트 |
| `colors.textTertiary` | `#ADADAD` | 3차 텍스트, 시간 라벨 |
| `colors.textInverse` | `#FFFFFF` | 반전 텍스트 (어두운 배경 위) |
| `colors.textDisabled` | `#C8C8C8` | 비활성 텍스트 |
| `colors.bgDefault` | `#FFFFFF` | 기본 배경 |
| `colors.bgSurface` | `#F5F5F5` | 서피스 배경 |
| `colors.bgOverlay` | `rgba(0,0,0,0.5)` | 모달 오버레이 |
| `colors.bgInverse` | `#000000` | 반전 배경 (홈 피드) |
| `colors.error` | `#FE3843` | 에러/삭제 |
| `colors.warning` | `#FFDB1C` | 경고/상대 메시지 버블 |
| `colors.success` | `#17DB4E` | 성공/완료 |
| `colors.info` | `#2EA7E0` | 정보 |
| `colors.borderDefault` | `#DCDDDD` | 기본 테두리 |
| `colors.borderStrong` | `#ADADAD` | 강조 테두리 |
| `colors.borderFocus` | `#2EA7E0` | 포커스 테두리 |
| `colors.gray` | `#C8C8C8` | 회색 (placeholder 등) |
| `colors.filterRed` | `#FE3843` | 필터 빨강 |
| `colors.filterPink` | `#EF62C7` | 필터 핑크 |
| `colors.filterBlue` | `#1A76FF` | 필터 파랑 |
| `colors.filterGreen` | `#98FE68` | 필터 초록 |
| `colors.filterYellow` | `#FFDB1C` | 필터 노랑 |
| `colors.skeleton` | `#1A1A1A` | 스켈레톤 배경 |
| `colors.placeholder` | `#9CA3AF` | 입력 placeholder |
| `colors.separator` | `#1E1E1E` | 구분선 |

팔레트 직접 접근: `colors.palette.blue[50~900]`, `colors.palette.gray[100~900]`, `colors.palette.pink[50~900]` 등

### 폰트 토큰 (font)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `font.family.display.bold` | `FKRasterRoman-Compact` | 디스플레이 볼드 (탭 타이틀, 배지, 채팅 타이틀) |
| `font.family.display.regular` | `FKRasterRoman-Blended` | 디스플레이 레귤러 (버튼, 큰 텍스트) |
| `font.family.display.sharp` | `FKRasterRoman-Sharp` | 디스플레이 샤프 |
| `font.family.display.smooth` | `FKRasterRoman-Smooth` | 디스플레이 스무스 |
| `font.family.body.bold` | `ABCDiatype-Bold` | 본문 볼드 |
| `font.family.body.boldItalic` | `ABCDiatype-BoldItalic` | 본문 볼드 이탤릭 |
| `font.family.body.medium` | `ABCDiatype-Medium` | 본문 미디엄 |
| `font.family.body.regular` | `ABCDiatype-Regular` | 본문 레귤러 |
| `font.family.korean.bold` | `Pretendard-Bold` | 한국어 볼드 |
| `font.family.korean.regular` | `Pretendard-Regular` | 한국어 레귤러 |

| 사이즈 토큰 | 값 |
|------------|-----|
| `font.size.xs` | `12` |
| `font.size.sm` | `14` |
| `font.size.base` | `16` |
| `font.size.lg` | `18` |
| `font.size.xl` | `20` |
| `font.size["2xl"]` | `24` |
| `font.size["3xl"]` | `30` |
| `font.size["4xl"]` | `36` |
| `font.size["5xl"]` | `48` |

### 스페이싱 & 라운딩 (spacing, radius)

기본적으로 라운딩은 고려하지 않음

| 스페이싱 | 값 | 라운딩 | 값 |
|---------|-----|--------|-----|
| `spacing[1]` | `4` | `radius.none` | `0` |
| `spacing[2]` | `8` | `radius.sm` | `4` |
| `spacing[3]` | `12` | `radius.md` | `8` |
| `spacing[4]` | `16` | `radius.lg` | `12` |
| `spacing[5]` | `20` | `radius.xl` | `16` |
| `spacing[6]` | `24` | `radius["2xl"]` | `24` |
| `spacing[8]` | `32` | `radius.full` | `9999` |

### 그림자 (shadows)

| 토큰 | iOS | Android |
|------|-----|---------|
| `shadows.sm` | offset 0,1 / opacity 0.05 / radius 2 | elevation 1 |
| `shadows.md` | offset 0,2 / opacity 0.1 / radius 4 | elevation 3 |
| `shadows.lg` | offset 0,4 / opacity 0.15 / radius 8 | elevation 6 |
| `shadows.xl` | offset 0,8 / opacity 0.2 / radius 16 | elevation 12 |

### 애니메이션 토큰

| Duration | 값 | Easing | 값 |
|----------|-----|--------|-----|
| `instant` | `0` | `linear` | 선형 |
| `fast` | `150` | `easeIn` | `cubic-bezier(0.4, 0, 1, 1)` |
| `normal` | `300` | `easeOut` | `cubic-bezier(0, 0, 0.2, 1)` |
| `slow` | `500` | `easeInOut` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `slower` | `700` | `spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |

### NativeWind Tailwind 클래스

색상: `bg-primary`, `text-primary`, `border-primary`, `bg-secondary`, `text-inverse`, `bg-filter_red`, `bg-filter_pink`, `bg-filter_blue`, `bg-filter_green`, `bg-filter_yellow`
폰트: `font-fk-raster-compact`, `font-fk-raster-blended`, `font-abcdiatype-bold`, `font-abcdiatype-medium`, `font-abcdiatype-regular`
트래킹: `tracking-5pct-xs` ~ `tracking-5pct-9xl` (5% letter-spacing)

---

## 실행 절차

### 1. 요구사항 분석

사용자 입력에서 다음을 파악:
- **대상**: 새 컴포넌트 생성 vs 기존 컴포넌트 수정
- **스타일 요소**: 색상, 타이포그래피, 레이아웃, 간격, 라운딩, 그림자
- **상태**: default, pressed, disabled, focus, error
- **플랫폼 차이**: iOS/Android/Web 분기 필요 여부

### 2. 토큰 매핑

요구사항의 각 스타일 값을 가장 적절한 디자인 토큰에 매핑:

```
요구사항: "파란색 버튼, 흰색 텍스트, 둥근 모서리"
→ backgroundColor: colors.primary
→ color: colors.textInverse
→ borderRadius: radius.full
→ fontFamily: font.family.display.regular
→ fontSize: font.size.base
```

hex 값이 주어진 경우 가장 가까운 토큰을 찾아 매핑:
- 정확히 일치하는 토큰 → 해당 토큰 사용
- 근사치만 있는 경우 → 가장 가까운 토큰 제안하고 사용자에게 확인
- 전혀 없는 경우 → `colors.palette` 직접 접근 또는 새 토큰 추가 제안

### 3. 구현

프로젝트의 기존 스타일링 패턴을 파악한 뒤 해당 방식으로 구현합니다.

**인라인 스타일 방식** (React Native style prop):
```tsx
<View style={{
  backgroundColor: colors.primary,
  padding: spacing[4],
  borderRadius: radius.lg,
}}>
  <Text style={{
    color: colors.textInverse,
    fontSize: font.size.base,
    fontFamily: font.family.display.regular,
    letterSpacing: font.size.base * 0.05,
  }}>
    Button Text
  </Text>
</View>
```

**NativeWind 클래스 방식** (className prop):
```tsx
<View className="bg-primary p-4 rounded-lg">
  <Text className="text-inverse text-base font-fk-raster-blended tracking-5pct-base">
    Button Text
  </Text>
</View>
```

**혼합 방식** (동적 값은 style, 정적 값은 className):
```tsx
<View
  className="p-4 rounded-lg"
  style={{ backgroundColor: isActive ? colors.primary : colors.gray }}
>
```

**Platform.select 패턴** (iOS/Android 분기):
```tsx
const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 3 },
})
```

**웹 (CSS-in-JS / Tailwind)**:
```tsx
// styled-components
const Button = styled.button`
  background-color: ${colors.primary};
  padding: ${spacing[3]}px ${spacing[5]}px;
  border-radius: ${radius.full}px;
`

// Tailwind
<button className="bg-primary text-white rounded-full px-5 py-3">
  Button Text
</button>
```

### 4. 검증

구현 후 반드시 확인:
1. 하드코딩된 hex 값이 없는지 검증 (`#`으로 시작하는 색상값 검색)
2. 하드코딩된 fontFamily 문자열이 없는지 검증
3. 앱 브랜드 패턴 일관성 확인 (보더 스타일, 폰트 선택, 색상 의미)

---

## 규칙

- **절대 hex 값을 하드코딩하지 않는다** — 반드시 디자인 토큰 사용
- **절대 fontFamily를 문자열로 직접 쓰지 않는다** — `font.family.*` 토큰 사용
- fontSize가 토큰에 정확히 일치하면 `font.size.*` 사용, 아니면 숫자 허용
- `"transparent"`, 계산된 값 (e.g., `avatarSize / 2`), SVG path 데이터는 토큰화하지 않음
- 기존 파일을 수정할 때는 파일의 기존 스타일 패턴(인라인 vs NativeWind)을 따름
- import 순서: React → React Native → 외부 라이브러리 → 디자인 토큰 → 내부 모듈
- 새 컴포넌트는 NativeWind 우선, 동적 스타일만 인라인으로 처리
- 디스플레이 폰트 사용 시 항상 5% letter-spacing 적용
- 인터랙티브 요소는 `activeOpacity: 0.7` 적용
