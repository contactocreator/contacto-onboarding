import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config({ override: true });

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌  ANTHROPIC_API_KEY가 없습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

// ── HTML 텍스트 추출 ──
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);
}

// ── HTML에서 이미지 URL 추출 ──
function extractImages(html, baseUrl) {
  const imgs = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    let src = m[1];
    if (src.startsWith('//')) src = 'https:' + src;
    else if (src.startsWith('/')) {
      try { src = new URL(src, baseUrl).href; } catch { continue; }
    }
    if (
      src.startsWith('http') &&
      !src.match(/icon|logo|favicon|avatar|sprite|pixel|tracking|analytics/i)
    ) {
      imgs.push(src);
    }
  }
  return [...new Set(imgs)].slice(0, 12);
}

// ── Instagram URL 감지 ──
function isInstagramUrl(url) {
  return /instagram\.com/.test(url);
}

// ── OG 메타 태그 추출 ──
function extractOgMeta(html) {
  const metas = {};
  const decode = s => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  for (const m of html.matchAll(/<meta\s[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']*?)["']/gi))
    metas[m[1]] = decode(m[2]);
  for (const m of html.matchAll(/<meta\s[^>]*content=["']([^"']*?)["'][^>]*property=["']og:([^"']+)["']/gi))
    if (!metas[m[2]]) metas[m[2]] = decode(m[1]);
  return metas;
}

// ── Claude 응답에서 JSON 파싱 ──
function parseJson(text) {
  const raw = text.trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('JSON not found');
  return JSON.parse(raw.slice(start, end + 1));
}

// ──────────────────────────────────────────
// API: URL 분석
// ──────────────────────────────────────────
app.post('/api/onboard/url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL이 필요합니다' });

  try {
    // ── Instagram 전용 처리 ──
    if (isInstagramUrl(url)) {
      // URL에서 username 추출
      const match = url.match(/instagram\.com\/([^/?#p][^/?#]*)/);
      const username = match?.[1]?.replace(/\/$/, '');
      if (!username) throw new Error('인스타그램 username을 찾을 수 없습니다');

      // Instagram 내부 API (퍼블릭 프로필)
      const igRes = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        {
          headers: {
            'x-ig-app-id': '936619743392459',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
            'Accept': '*/*',
            'Referer': 'https://www.instagram.com/',
          },
          signal: AbortSignal.timeout(12000),
        }
      );

      if (!igRes.ok) throw new Error(`Instagram 응답 오류 (${igRes.status}). 비공개 계정이거나 잠시 후 다시 시도해주세요.`);

      const igData = await igRes.json();
      const user = igData?.data?.user;
      if (!user) throw new Error('인스타그램 프로필을 불러올 수 없습니다. 공개 계정인지 확인해주세요.');

      const fullName  = user.full_name || username;
      const biography = user.biography || '';
      const category  = user.category_name || '';
      const userId    = user.id;

      const igHeaders = {
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': '*/*',
        'Referer': 'https://www.instagram.com/',
      };

      // 포스트 정규화 함수 (web_profile_info edge 형식 → 통일 형식)
      const normalizeEdge = e => ({
        url: e?.node?.display_url,
        likes: e?.node?.edge_liked_by?.count || 0,
        comments: e?.node?.edge_media_to_comment?.count || 0,
        caption: e?.node?.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      });

      // 포스트 정규화 함수 (i.instagram.com mobile API 형식)
      const normalizeMobileItem = item => ({
        url: item?.image_versions2?.candidates?.[0]?.url,
        likes: item?.like_count || 0,
        comments: item?.comment_count || 0,
        caption: item?.caption?.text || '',
      });

      // 첫 12개 (web_profile_info에서 이미 가져온 것)
      const firstEdges = user.edge_owner_to_timeline_media?.edges || [];
      let allPosts = firstEdges.map(normalizeEdge);

      // 추가 페이지: i.instagram.com 모바일 API (더 안정적)
      try {
        let maxId = null;
        let moreAvailable = firstEdges.length >= 12;
        let attempts = 0;

        // 첫 페이지도 모바일 API로 가져와서 데이터 보강 시도
        const mobileRes = await fetch(
          `https://i.instagram.com/api/v1/feed/user/${userId}/?count=12`,
          { headers: igHeaders, signal: AbortSignal.timeout(8000) }
        );
        if (mobileRes.ok) {
          const mobileData = await mobileRes.json();
          if (mobileData?.items?.length > 0) {
            // 모바일 API 성공 → 이걸 기준으로 교체
            allPosts = mobileData.items.map(normalizeMobileItem);
            maxId = mobileData.next_max_id;
            moreAvailable = mobileData.more_available;

            // 추가 페이지 수집 (최대 3페이지 추가 = ~48개)
            while (moreAvailable && maxId && allPosts.length < 50 && attempts < 3) {
              attempts++;
              const nextRes = await fetch(
                `https://i.instagram.com/api/v1/feed/user/${userId}/?count=12&max_id=${maxId}`,
                { headers: igHeaders, signal: AbortSignal.timeout(8000) }
              );
              if (!nextRes.ok) break;
              const nextData = await nextRes.json();
              if (!nextData?.items?.length) break;
              allPosts.push(...nextData.items.map(normalizeMobileItem));
              maxId = nextData.next_max_id;
              moreAvailable = nextData.more_available;
            }
          }
        }
      } catch {
        // 모바일 API 실패 → web_profile_info 첫 12개 유지
      }

      // 유효한 이미지 URL만 필터링
      allPosts = allPosts.filter(p => p.url);

      // 반응(좋아요+댓글) 높은 순 정렬
      allPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));

      // Claude용 캡션 (상위 3개)
      const captions = allPosts.slice(0, 3).map(p => p.caption).filter(Boolean).join('\n');

      // Claude로 프로필 추출
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `다음은 인스타그램 아티스트 프로필 정보입니다. 아티스트 프로필을 JSON으로 추출해주세요.

이름: ${fullName}
바이오: ${biography}
카테고리: ${category}
최근 포스트 캡션:
${captions}

다음 형식의 JSON만 반환하세요 (다른 텍스트 없이):
{
  "name": "아티스트 이름",
  "medium": "작업 매체/분야 (예: 세라믹, 회화, 사진 등)",
  "style": "작업 스타일/특징 (1-2문장)",
  "series": ["대표 시리즈 또는 작품명 1", "작품명 2"],
  "bio": "짧은 바이오 (2-3문장)",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`,
        }],
      });

      let profile;
      try { profile = parseJson(msg.content[0].text); }
      catch { profile = { name: fullName, medium: category, style: '', series: [], bio: biography, keywords: [] }; }

      // 전체 이미지 (프록시 경유) — 프론트에서 선택용
      const proxy = u => `/api/proxy-image?url=${encodeURIComponent(u)}`;
      const allImages = allPosts.map(p => proxy(p.url));
      // 기본 카드 이미지: 반응 상위 6개
      const images = allImages.slice(0, 6);

      return res.json({ profile, images, allImages, source: 'instagram', postsScanned: allPosts.length });
    }

    // ── 일반 웹사이트 처리 ──
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`페이지 로딩 실패 (${response.status})`);

    const html = await response.text();
    const text = stripHtml(html);
    const images = extractImages(html, url);

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `다음은 아티스트 웹사이트의 텍스트 내용입니다. 아티스트 프로필 정보를 JSON으로 추출해주세요.

웹사이트 내용:
${text}

다음 형식의 JSON만 반환하세요 (다른 텍스트 없이):
{
  "name": "아티스트 이름 (없으면 빈 문자열)",
  "medium": "작업 매체/분야 (예: 세라믹, 회화, 사진 등)",
  "style": "작업 스타일/특징 (1-2문장)",
  "series": ["대표 시리즈 또는 작품명 1", "작품명 2"],
  "bio": "짧은 바이오 (2-3문장)",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`,
      }],
    });

    let profile;
    try {
      profile = parseJson(msg.content[0].text);
    } catch {
      profile = { name: '', medium: '', style: '', series: [], bio: '', keywords: [] };
    }

    res.json({ profile, images });
  } catch (err) {
    console.error('URL 분석 오류:', err.message);
    res.status(500).json({ error: '웹페이지를 불러올 수 없습니다: ' + err.message });
  }
});

// ──────────────────────────────────────────
// API: 텍스트 직접 입력 분석 (Instagram 바이오 등)
// ──────────────────────────────────────────
app.post('/api/onboard/text', async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: '텍스트를 입력해주세요' });

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `다음은 아티스트가 직접 입력한 소개 텍스트입니다. 아티스트 프로필 정보를 JSON으로 추출해주세요.

입력 텍스트:
${text.slice(0, 3000)}

다음 형식의 JSON만 반환하세요 (다른 텍스트 없이):
{
  "name": "아티스트 이름 (없으면 빈 문자열)",
  "medium": "작업 매체/분야 (예: 세라믹, 회화, 사진 등)",
  "style": "작업 스타일/특징 (1-2문장)",
  "series": ["대표 시리즈 또는 작품명 1", "작품명 2"],
  "bio": "짧은 바이오 (2-3문장)",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`,
      }],
    });

    let profile;
    try { profile = parseJson(msg.content[0].text); }
    catch { profile = { name: '', medium: '', style: '', series: [], bio: text.slice(0, 200), keywords: [] }; }

    res.json({ profile, images: [] });
  } catch (err) {
    console.error('텍스트 분석 오류:', err.message);
    res.status(500).json({ error: '분석 중 오류: ' + err.message });
  }
});

// ──────────────────────────────────────────
// API: 이미지 프록시 (Instagram CDN CORS 우회)
// ──────────────────────────────────────────
app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).end();

  try {
    const parsed = new URL(url);
    const allowed = ['cdninstagram.com', 'instagram.com', 'fbcdn.net', 'fbsbx.com', 'scontent'];
    if (!allowed.some(d => parsed.hostname.includes(d))) return res.status(403).end();
  } catch { return res.status(400).end(); }

  try {
    const r = await fetch(url, {
      headers: { 'Referer': 'https://www.instagram.com/', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (err) {
    console.error('이미지 프록시 오류:', err.message);
    res.status(502).end();
  }
});

// ──────────────────────────────────────────
// API: PDF 분석
// ──────────────────────────────────────────
app.post('/api/onboard/pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF 파일이 필요합니다' });

  try {
    const base64 = req.file.buffer.toString('base64');

    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: `이 포트폴리오 PDF를 분석하여 아티스트 프로필 정보를 JSON으로 추출해주세요.

다음 형식의 JSON만 반환하세요 (다른 텍스트 없이):
{
  "name": "아티스트 이름 (없으면 빈 문자열)",
  "medium": "작업 매체/분야 (예: 세라믹, 회화, 사진 등)",
  "style": "작업 스타일/특징 (1-2문장)",
  "series": ["대표 시리즈 또는 작품명 1", "작품명 2"],
  "bio": "짧은 바이오 (2-3문장)",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "imageDescriptions": ["포트폴리오에서 보이는 작품 설명 1", "작품 설명 2", "작품 설명 3"]
}`,
          },
        ],
      }],
    });

    let profile;
    try {
      profile = parseJson(msg.content[0].text);
    } catch {
      profile = { name: '', medium: '', style: '', series: [], bio: '', keywords: [], imageDescriptions: [] };
    }

    res.json({ profile, images: [] });
  } catch (err) {
    console.error('PDF 분석 오류:', err.message);
    res.status(500).json({ error: 'PDF 분석 중 오류: ' + err.message });
  }
});

// ──────────────────────────────────────────
// API: 메시지 생성 (SSE 스트리밍)
// ──────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const { target, tone, artistInfo } = req.body;
  if (!target?.name || !tone) {
    return res.status(400).json({ error: 'target.name and tone are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const TONE_DESC = {
    formal: '정중하고 전문적인 비즈니스 어투. 격식체(합니다/습니다)를 사용하며 예의 바르게 작성.',
    casual: '친근하고 자연스러운 어투. 편한 존댓말(요체)로 부담 없이 접근하는 느낌.',
    short:  '간결하고 핵심만 담은 어투. 3~4문장 이내로 짧고 임팩트 있게 작성.',
  };

  const artist = artistInfo ?? { name: '아티스트', medium: '아트', style: '', series: [], bio: '' };

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 600,
      system: `당신은 아티스트의 비즈니스 제안 메시지 작성 전문가입니다.

아티스트 정보:
- 이름: ${artist.name}
- 매체/분야: ${artist.medium}
- 스타일: ${artist.style}
- 대표 작업: ${(artist.series || []).join(', ')}
- 바이오: ${artist.bio}

작성 규칙:
- 반드시 한국어로만 작성
- 이모지, 특수문자 사용 금지
- 상대방 이름이나 브랜드에 대한 구체적 언급 포함
- 자기 PR보다 상대방에 대한 공감·존중이 먼저
- 마지막에는 미팅이나 포트폴리오 공유 같은 가벼운 다음 단계 제안`,
      messages: [{
        role: 'user',
        content: `파트너 이름: ${target.name}
파트너 유형: ${target.type ?? '갤러리/브랜드'}
어투: ${TONE_DESC[tone] ?? TONE_DESC.formal}

인사 → 자기소개(간단) → 상대방 작업에 대한 진심 어린 언급 → 협업 아이디어 제안 → 마무리(다음 단계 제안) 구조로 자연스럽게 작성하세요.`,
      }],
    });

    for await (const event of stream) {
      if (res.writableEnded) break;
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify(event.delta.text)}\n\n`);
      }
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    console.error('Generate 오류:', err.message);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify('오류: ' + err.message)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// ── 서버 시작 ──
app.listen(PORT, () => {
  console.log('\n✅ Contacto 온보딩 서버 실행 중');
  console.log(`   → http://localhost:${PORT}\n`);
});
