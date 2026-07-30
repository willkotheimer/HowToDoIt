import React, { useEffect, useMemo, useRef } from 'react';
import { useSequences, useSequence } from '../../data/sequenceData';
import SequenceCard from '../../Components/SequenceCard';
import CountdownLeader from '../../Components/CountdownLeader';
import { slug, sceneHeight, groupSequencesByDomain } from '../../Helpers/feedHelper';
import { sortBySortOrder, firstBySortOrder } from '../../Helpers/sequenceHelper';

const DOMAIN_BLURBS: Record<string, string> = {
  'Coffee Shop': 'Opening, display, and bar procedures for a specialty café.',
  'Retail Store': 'Garment care, floor inventory, and checkout for a menswear boutique.',
  'Online Store': 'Pack & ship, product listing, and returns for an e-commerce shop.',
};

// A hero "step" — either a real WorkStep or a static walkthrough frame.
type HeroStep = {
  id: string | number;
  title?: string;
  description?: string;
  images?: { id: string | number; imageUrl: string; sortOrder?: number }[];
};

// "How it works" onboarding — its own scrollytelling scene. Frames are real app
// screenshots captured by e2e/screenshots.spec.ts (Playwright).
const walkImg = (n: number) => [{ id: `hw${n}`, imageUrl: `/seed/howto-${n}.jpg`, sortOrder: 0 }];
const WALKTHROUGH: HeroStep[] = [
  { id: 'w1', title: 'Sign in', description: 'Sign in to unlock the create tools — only allowed writers can add or edit sequences.' },
  { id: 'w2', title: 'Create a domain & category', description: 'Name the sequence, then group it by domain and category.', images: walkImg(2) },
  { id: 'w3', title: 'Upload your images', description: 'Drag in a photo for each step — they’re resized automatically before upload.', images: walkImg(3) },
  { id: 'w4', title: 'Order your photos', description: 'Arrange the images into the exact order of the task.', images: walkImg(4) },
  { id: 'w5', title: 'Add descriptions', description: 'Write a short caption for each step so anyone can follow along.', images: walkImg(5) },
];

// "How it works" narration — one bold action phrase per walkthrough step. The
// four phrases map to steps 2–5 (Create/Upload/Order/Describe); the scroll
// handler bolds the phrase for the currently-centred slide (see buildHowtoNarration).
const HOWTO_LEAD = 'No manual to write — ';
const HOWTO_PHRASES = ['capture the steps', 'upload the images', 'order them', 'add descriptions'];
const HOWTO_TAIL = ' for each.';
const buildHowtoNarration = (active: number) => {
  const parts = HOWTO_PHRASES.map((ph, i) => (i === active ? `<b>${ph}</b>` : ph));
  return `${HOWTO_LEAD}${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}${HOWTO_TAIL}`;
};

// Quarter-arc dashed guide arrow (points left toward the image via CSS scaleX).
const Arrow = () => (
  <svg className="slide__arrow" viewBox="0 0 58 52" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 46 C 6 23.9 23.9 6 46 6" strokeDasharray="2 11" />
    <path d="M40 0 L48 6 L40 12" />
  </svg>
);

type Scene = {
  id: string;
  h1: string;
  steps: HeroStep[];
  // 'phrases' → intro line, then one bold action phrase per centred slide (with
  // the progress track). 'words' → the whole line karaokes word-by-word as you
  // scroll, the brand word staying lit.
  mode: 'phrases' | 'words';
  initial?: string;   // phrases: intro line before scrolling
  narration?: string; // phrases: initial (non-scrolling) narration fallback
  text?: string;      // words: the full line to walk through
};

export default function Feed() {
  const { data: sequences = [] } = useSequences();
  const rootRef = useRef<HTMLDivElement>(null);

  // Group sequences into domains (stable by id), domains ordered by first id.
  const domains = useMemo(() => groupSequencesByDomain(sequences), [sequences]);

  // Coffee-shop demo = first sequence of the first domain.
  const featuredId = domains[0]?.sequences[0]?.id ?? 0;
  const { data: featured } = useSequence(featuredId, featuredId > 0);
  const coffeeSteps: HeroStep[] = useMemo(
    () => sortBySortOrder(featured?.steps),
    [featured],
  );

  // Two independent scrollytelling scenes, played one after the other.
  const scenes: Scene[] = useMemo(() => [
    {
      id: 'howto', h1: 'How it works',
      mode: 'phrases',
      initial: '<b>Anyone</b> can build a sequence in five steps.',
      narration: buildHowtoNarration(0),
      steps: WALKTHROUGH,
    },
    {
      id: 'featured', h1: 'Your Sequence',
      mode: 'words',
      text: 'HowToDoIt turns procedures into visual, step-by-step image workflows. Your sequence tells the story better than you could. Complicated tasks collapse to 5–10 images.',
      steps: coffeeSteps,
    },
  ], [coffeeSteps]);

  // ── Scroll wiring: per-scene dwell push + narration swap, invite fades,
  //    scroll-spy nav, and abortable ("scroll wins") nav jumps. ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { root.classList.add('reduce-motion'); return undefined; }

    const sceneEls = Array.from(root.querySelectorAll<HTMLElement>('.splash-scene'));
    const sceneSlides = new Map(sceneEls.map((s) => [s, Array.from(s.querySelectorAll<HTMLElement>('.slide'))]));
    const dscenes = Array.from(root.querySelectorAll<HTMLElement>('.dscene'));
    let ticking = false;

    const update = () => {
      ticking = false;
      sceneEls.forEach((scene) => {
        const total = scene.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-scene.getBoundingClientRect().top / total, 0), 1) : 0;

        // Dwell push: each step holds centered, then eases to the next. `af` is
        // the active slide fraction (0 … N-1) used to drive the narration below.
        const slides = sceneSlides.get(scene) || [];
        const N = slides.length;
        let af = 0;
        if (N > 0) {
          const start = 0.06; const end = 0.97;
          const region = Math.min(Math.max((p - start) / (end - start), 0), 1);
          if (N > 1) {
            const seg = region * (N - 1);
            const t = Math.min(Math.floor(seg), N - 2);
            const x = seg - t;
            const hold = 0.55;
            let f = 0;
            if (x > hold) { const y = (x - hold) / (1 - hold); f = y < 0.5 ? 2 * y * y : 1 - ((-2 * y + 2) ** 2) / 2; }
            af = t + f;
          }
          slides.forEach((sl, i) => { sl.style.transform = `translateX(${(i - af) * 100}%)`; });
        }

        // Narration. 'words' scenes karaoke word-by-word; 'phrases' scenes show
        // an intro line, then bold the action phrase for the centred slide and
        // light the matching progress dot.
        const wordsEl = scene.querySelector<HTMLElement>('.hero-narr__words');
        if (wordsEl) {
          const words = wordsEl.children;
          const active = Math.min(Math.floor(p * words.length), words.length - 1);
          if (wordsEl.dataset.active !== String(active)) {
            for (let i = 0; i < words.length; i += 1) {
              words[i].classList.toggle('is-lit', i === 0 || i === active);
            }
            wordsEl.dataset.active = String(active);
          }
        } else {
          const narr = scene.querySelector<HTMLElement>('.hero-narr p');
          if (narr) {
            if (p < 0.04) {
              if (narr.dataset.shown !== 'initial') { narr.innerHTML = narr.dataset.initial || ''; narr.dataset.shown = 'initial'; }
            } else {
              const phrase = Math.min(Math.max(Math.round(af) - 1, 0), HOWTO_PHRASES.length - 1);
              const key = `d${phrase}`;
              if (narr.dataset.shown !== key) {
                narr.innerHTML = buildHowtoNarration(phrase);
                narr.dataset.shown = key;
                scene.querySelectorAll('.howto-track__dot').forEach((d, i) => d.classList.toggle('is-active', i === phrase));
              }
            }
          }
        }
      });

      dscenes.forEach((sc) => {
        const inv = sc.querySelector<HTMLElement>('.domain-invite');
        if (!inv) return;
        const total = sc.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-sc.getBoundingClientRect().top / total, 0), 1) : 0;
        inv.style.opacity = String(Math.min(Math.max((p - 0.06) / 0.22, 0), 1));
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

    // Scroll-spy: hero scenes highlight "Overview"; domain rows highlight themselves.
    const links = new Map<string, HTMLElement>();
    root.querySelectorAll<HTMLElement>('.splash-nav a').forEach((a) => links.set(a.dataset.target || '', a));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        root.querySelectorAll('.splash-nav a').forEach((a) => a.classList.remove('is-active'));
        const el = e.target as HTMLElement;
        const key = el.classList.contains('splash-scene') ? 'overview' : el.id.replace('sec-', '');
        links.get(key)?.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    [...sceneEls, ...dscenes].forEach((el) => spy.observe(el));

    // Abortable smooth scroll — user scroll wins.
    const smoothTo = (targetY: number) => {
      const startY = window.scrollY; const dist = targetY - startY; const dur = 600; let t0: number | null = null; let aborted = false;
      const onUser = () => { aborted = true; };
      window.addEventListener('wheel', onUser, { passive: true });
      window.addEventListener('touchmove', onUser, { passive: true });
      window.addEventListener('keydown', onUser);
      const cleanup = () => { window.removeEventListener('wheel', onUser); window.removeEventListener('touchmove', onUser); window.removeEventListener('keydown', onUser); };
      const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2);
      const tick = (ts: number) => {
        if (aborted) return cleanup();
        if (t0 === null) t0 = ts;
        const x = Math.min(1, (ts - t0) / dur);
        window.scrollTo(0, startY + dist * ease(x));
        return x < 1 ? requestAnimationFrame(tick) : cleanup();
      };
      requestAnimationFrame(tick);
    };
    const navClick = (ev: Event) => {
      const a = ev.currentTarget as HTMLElement;
      const el = root.querySelector<HTMLElement>(`#sec-${a.dataset.target}`);
      if (el) smoothTo(el.getBoundingClientRect().top + window.scrollY - 60);
    };
    const navLinks = Array.from(root.querySelectorAll<HTMLElement>('.splash-nav a'));
    navLinks.forEach((a) => a.addEventListener('click', navClick));

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      spy.disconnect();
      navLinks.forEach((a) => a.removeEventListener('click', navClick));
    };
  }, [domains, scenes]);

  return (
    <div className="splash" ref={rootRef}>
      <div className="splash__shell">
        <nav className="splash-nav" aria-label="Sections">
          <h4>Browse</h4>
          <a data-target="howto" className="is-active">Overview</a>
          {domains.map((d) => <a key={d.name} data-target={slug(d.name)}>{d.name}</a>)}
        </nav>

        <div className="splash__content">
          {scenes.map((scene) => (
            <section id={`sec-${scene.id}`} className="splash-scene" key={scene.id} style={{ height: sceneHeight(scene.steps.length) }}>
              <div className="splash-scene__pin">
                <div className="hero-narr">
                  <h1>{scene.h1}</h1>
                  {scene.mode === 'phrases' && (
                    <div className="howto-track" aria-hidden="true">
                      <span className="howto-track__line" />
                      <span className="howto-track__arrow" />
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className="howto-track__dot" style={{ left: `${12 + i * 25}%` }} />
                      ))}
                    </div>
                  )}
                  {scene.mode === 'words' ? (
                    <p className="hero-narr__words">
                      {scene.text!.split(' ').map((w, i) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <span key={i} className={i === 0 ? 'is-brand is-lit' : undefined}>{`${w} `}</span>
                      ))}
                    </p>
                  ) : (
                    <p
                      data-initial={scene.initial}
                      data-narration={scene.narration}
                      data-dynamic="1"
                      dangerouslySetInnerHTML={{ __html: scene.initial! }}
                    />
                  )}
                </div>
                <div className="stage">
                  {scene.steps.map((st, i) => {
                    const cover = firstBySortOrder(st.images);
                    return (
                      <div className="slide" key={st.id}>
                        <div className="slide__media">
                          <div className={`slide__frame${cover ? '' : ' is-empty'}`}>
                            {cover
                              ? <img src={cover.imageUrl} alt={st.title ?? `Step ${i + 1}`} />
                              : <CountdownLeader n={i + 1} />}
                          </div>
                          <div className="slide__stepnum">Step <b>{i + 1}</b></div>
                        </div>
                        <div className="slide__text">
                          <Arrow />
                          <h3 className="slide__title">{st.title || `Step ${i + 1}`}</h3>
                          {st.description && <p className="slide__desc">{st.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="scene-hint">Scroll to play ↓</div>
              </div>
            </section>
          ))}

          {domains.map((d) => (
            <section id={`sec-${slug(d.name)}`} className="dscene" key={d.name}>
              <div className="dscene__pin">
                <div>
                  <h2 className="domain-title">{d.name}</h2>
                  <p className="domain-blurb">{DOMAIN_BLURBS[d.name] ?? `${d.sequences.length} sequences`}</p>
                </div>
                <div className="domain-row">
                  {d.sequences.map((s) => <SequenceCard key={s.id} sequence={s} />)}
                </div>
                <p className="domain-invite">Click on any to see steps&hellip;</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
