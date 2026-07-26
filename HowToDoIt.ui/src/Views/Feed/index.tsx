import React, { useEffect, useMemo, useRef } from 'react';
import { useSequences, useSequence } from '../../data/sequenceData';
import SequenceCard from '../../Components/SequenceCard';
import type { WorkSequence } from '../../Types';

const INITIAL = '<b>HowToDoIt</b> turns procedures into visual, step-by-step image workflows.';
const NARRATION = '<b>Your sequence</b> tells the story better than you could. Complicated tasks collapse down to 5&ndash;10 images.';

const DOMAIN_BLURBS: Record<string, string> = {
  'Coffee Shop': 'Opening, display, and bar procedures for a specialty café.',
  'Retail Store': 'Garment care, floor inventory, and checkout for a menswear boutique.',
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Quarter-arc dashed guide arrow (points left toward the image via CSS scaleX).
const Arrow = () => (
  <svg className="slide__arrow" viewBox="0 0 58 52" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 46 C 6 23.9 23.9 6 46 6" strokeDasharray="2 11" />
    <path d="M40 0 L48 6 L40 12" />
  </svg>
);

export default function Feed() {
  const { data: sequences = [] } = useSequences();
  const rootRef = useRef<HTMLDivElement>(null);
  const narrRef = useRef<HTMLParagraphElement>(null);

  // Group sequences into domains (stable by id), domains ordered by first id.
  const domains = useMemo(() => {
    const map = new Map<string, WorkSequence[]>();
    [...sequences].sort((a, b) => a.id - b.id).forEach((s) => {
      const d = s.domain || 'Other';
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(s);
    });
    return Array.from(map.entries()).map(([name, seqs]) => ({ name, sequences: seqs }));
  }, [sequences]);

  // Featured sequence for the hero scrollytelling = first sequence of first domain.
  const featuredId = domains[0]?.sequences[0]?.id ?? 0;
  const { data: featured } = useSequence(featuredId, featuredId > 0);
  const featuredSteps = useMemo(
    () => [...(featured?.steps ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [featured],
  );

  // ── Scroll wiring: narration swap, horizontal step push, invite fades,
  //    scroll-spy nav, and abortable ("scroll wins") nav jumps. ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { root.classList.add('reduce-motion'); return undefined; }

    const scene = root.querySelector<HTMLElement>('#sec-overview');
    const slides = Array.from(root.querySelectorAll<HTMLElement>('.slide'));
    const dscenes = Array.from(root.querySelectorAll<HTMLElement>('.dscene'));
    const N = slides.length;
    let lastNarr: string | null = null;
    let ticking = false;

    const update = () => {
      ticking = false;
      if (scene && N > 0) {
        const total = scene.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-scene.getBoundingClientRect().top / total, 0), 1) : 0;
        const text = p < 0.04 ? INITIAL : NARRATION;
        if (text !== lastNarr) { if (narrRef.current) narrRef.current.innerHTML = text; lastNarr = text; }
        // Map scroll → active step with a DWELL: each step holds centered for
        // the first part of its slot, then eases across to the next.
        const start = 0.06; const end = 0.97;
        const region = Math.min(Math.max((p - start) / (end - start), 0), 1);
        let af = 0;
        if (N > 1) {
          const seg = region * (N - 1);
          const t = Math.min(Math.floor(seg), N - 2);
          const x = seg - t;
          const hold = 0.55; // fraction of each step's slot spent holding
          let f = 0;
          if (x > hold) {
            const y = (x - hold) / (1 - hold);
            f = y < 0.5 ? 2 * y * y : 1 - ((-2 * y + 2) ** 2) / 2;
          }
          af = t + f;
        }
        // Reversed: new step enters from the RIGHT, old exits LEFT.
        slides.forEach((sl, i) => { sl.style.transform = `translateX(${(i - af) * 100}%)`; });
      }
      dscenes.forEach((sc) => {
        const inv = sc.querySelector<HTMLElement>('.domain-invite');
        if (!inv) return;
        const total = sc.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-sc.getBoundingClientRect().top / total, 0), 1) : 0;
        inv.style.opacity = String(Math.min(Math.max((p - 0.06) / 0.22, 0), 1));
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

    // Scroll-spy: highlight the active nav link.
    const links = new Map<string, HTMLElement>();
    root.querySelectorAll<HTMLElement>('.splash-nav a').forEach((a) => links.set(a.dataset.target || '', a));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          root.querySelectorAll('.splash-nav a').forEach((a) => a.classList.remove('is-active'));
          const id = e.target.id.replace('sec-', '');
          links.get(id)?.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    root.querySelectorAll<HTMLElement>('.splash-scene, .dscene').forEach((el) => spy.observe(el));

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
  }, [domains, featuredSteps]);

  const sceneHeight = featuredSteps.length ? `${(featuredSteps.length - 1) * 82 + 120}vh` : '72vh';

  return (
    <div className="splash" ref={rootRef}>
      <div className="splash__shell">
        <nav className="splash-nav" aria-label="Sections">
          <h4>Browse</h4>
          <a data-target="overview" className="is-active">Overview</a>
          {domains.map((d) => <a key={d.name} data-target={slug(d.name)}>{d.name}</a>)}
        </nav>

        <div className="splash__content">
          <section id="sec-overview" className="splash-scene" style={{ height: sceneHeight }}>
            <div className="splash-scene__pin">
              <div className="hero-narr">
                <h1>Your Sequence</h1>
                <p ref={narrRef} dangerouslySetInnerHTML={{ __html: INITIAL }} />
              </div>
              <div className="stage">
                {featuredSteps.map((st, i) => {
                  const cover = [...(st.images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
                  return (
                    <div className="slide" key={st.id}>
                      <div className="slide__media">
                        <div className="slide__frame">{cover && <img src={cover.imageUrl} alt={st.title ?? `Step ${i + 1}`} />}</div>
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
