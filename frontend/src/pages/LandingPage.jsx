import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Zap, MessageCircle, Search,
  Shield, Award, Users, CheckCircle,
  GraduationCap, BookOpen, Star, ChevronRight,
  TrendingUp, Code, Layers, Globe,
} from 'lucide-react';
import './LandingPage.css';

/* ─── Navbar ─────────────────────────────────────────────── */
function LandingNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
      <span className="lp-nav-brand">Dev<span>Swap</span></span>
      <ul className="lp-nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#testimonials">Stories</a></li>
        <li>
          <button className="lp-nav-login" onClick={() => navigate('/login')}>Login</button>
        </li>
        <li>
          <button className="lp-nav-cta" onClick={() => navigate('/register')}>Get Started Free</button>
        </li>
      </ul>
    </nav>
  );
}

/* ─── Live Match Preview (hero visual) ──────────────────── */
function HeroVisual() {
  const matches = [
    { init: 'SR', name: 'Sara Reeves',   teach: 'React',  learn: 'Python',     score: 98 },
    { init: 'DK', name: 'Dev Kumar',     teach: 'Python', learn: 'React',      score: 96 },
    { init: 'MJ', name: 'Maria Jones',   teach: 'Figma',  learn: 'TypeScript', score: 91 },
  ];

  return (
    <div className="lp-hero-visual">
      {/* App window chrome */}
      <div className="lp-app-window">
        <div className="lp-app-titlebar">
          <div className="lp-titlebar-dots">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
          </div>
          <div className="lp-titlebar-label">DevSwap — Matches</div>
        </div>

        {/* Window body */}
        <div className="lp-app-body">
          {/* Mini sidebar */}
          <div className="lp-app-sidebar">
            <div className="lp-app-logo-mini">DS</div>
            {['🏠','👥','💬','⚙️'].map((ic, i) => (
              <div key={i} className={`lp-app-sidebar-item${i === 1 ? ' active' : ''}`}>{ic}</div>
            ))}
          </div>

          {/* Content pane */}
          <div className="lp-app-pane">
            <div className="lp-app-pane-header">
              <div>
                <div className="lp-app-pane-title">Your Matches</div>
                <div className="lp-app-pane-sub">3 perfect matches found</div>
              </div>
              <div className="lp-app-filter-btn">Filter</div>
            </div>

            <div className="lp-app-match-list">
              {matches.map((m, i) => (
                <div key={i} className="lp-app-match-row">
                  <div className="lp-app-match-avatar">{m.init}</div>
                  <div className="lp-app-match-info">
                    <div className="lp-app-match-name">{m.name}</div>
                    <div className="lp-app-match-tags">
                      <span className="lp-tag teach">Teaches {m.teach}</span>
                      <span className="lp-tag learn">Learns {m.learn}</span>
                    </div>
                  </div>
                  <div className="lp-app-match-score">
                    <div className="lp-score-ring" style={{ '--pct': m.score }}>
                      <span>{m.score}%</span>
                    </div>
                  </div>
                  <button className="lp-app-connect-btn">Connect</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="lp-float-notif">
        <div className="lp-float-notif-icon"><CheckCircle size={14} /></div>
        <div>
          <div className="lp-float-notif-title">New match found!</div>
          <div className="lp-float-notif-sub">Dev Kumar · 96% compatibility</div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="lp-float-badge">
        <Star size={12} fill="#f97316" color="#f97316" />
        <span>4.9 · 2,400+ devs</span>
      </div>
    </div>
  );
}

/* ─── Feature Card ──────────────────────────────────────── */
function FeatureCard({ Icon, title, desc, tag }) {
  return (
    <div className="lp-feat-card">
      <div className="lp-feat-icon-wrap">
        <Icon size={20} />
      </div>
      {tag && <div className="lp-feat-tag">{tag}</div>}
      <h3 className="lp-feat-title">{title}</h3>
      <p className="lp-feat-desc">{desc}</p>
    </div>
  );
}

/* ─── Testimonial Card ──────────────────────────────────── */
function TestimonialCard({ init, name, role, text, rating }) {
  return (
    <div className="lp-testi-card">
      <div className="lp-testi-stars">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={13} fill="#f97316" color="#f97316" />
        ))}
      </div>
      <p className="lp-testi-text">"{text}"</p>
      <div className="lp-testi-author">
        <div className="lp-testi-avatar">{init}</div>
        <div>
          <div className="lp-testi-name">{name}</div>
          <div className="lp-testi-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step ──────────────────────────────────────────────── */
function Step({ num, Icon, title, desc }) {
  return (
    <div className="lp-step">
      <div className="lp-step-num">{num}</div>
      <div className="lp-step-icon-wrap"><Icon size={18} /></div>
      <div>
        <div className="lp-step-title">{title}</div>
        <p className="lp-step-desc">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { Icon: Zap,         title: 'Smart Skill Matching',  tag: 'AI-Powered', desc: 'Our algorithm pairs you with developers who teach what you want to learn — and need what you can teach.' },
    { Icon: MessageCircle, title: 'Real-Time Chat',      tag: 'Live',       desc: 'Instant messaging with file sharing, emoji reactions, and read receipts built right in.' },
    { Icon: GraduationCap,title: 'Teach & Learn',       tag: 'Peer-to-Peer',desc: 'Structured 1-on-1 skill exchanges. No lectures. Learn from someone who mastered it recently.' },
    { Icon: Search,       title: 'Browse & Discover',    tag: null,         desc: 'Explore by skill, tech stack, or goal. Reach out to anyone in one click — no gatekeeping.' },
    { Icon: Award,        title: 'Skill Badges',         tag: 'Verified',   desc: 'Earn community-verified badges as you teach and learn. Show the world what you know.' },
    { Icon: Shield,       title: 'Private & Secure',     tag: null,         desc: 'Shown only to matched users. No spam, no cold outreach — just meaningful knowledge exchange.' },
  ];

  const testimonials = [
    { init: 'AR', name: 'Alex Rivera',   role: 'Frontend Dev → Full Stack',  rating: 5, text: 'I learned Python from a developer I taught React to. In 3 weeks I was writing APIs. This changed how I upskill completely.' },
    { init: 'KS', name: 'Keiko Suzuki',  role: 'UI Designer → React Dev',    rating: 5, text: 'As a designer learning code, I was scared. My DevSwap match was patient, structured, and genuinely cared about my growth.' },
    { init: 'MJ', name: 'Marcus James',  role: 'Backend Dev → DevOps',       rating: 5, text: 'I traded Node.js knowledge for Kubernetes sessions. Saved me $800 in courses and learned 3× faster.' },
  ];

  const skills = ['React', 'Python', 'UI/UX', 'TypeScript', 'Node.js', 'Figma', 'DevOps', 'GraphQL', 'Next.js', 'Docker', 'AWS', 'Rust'];

  return (
    <div className="lp-root">
      <LandingNav />

      {/* ════ HERO ════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          {/* Left copy */}
          <div className="lp-hero-copy">
            <div className="lp-hero-badge">
              <Zap size={12} fill="#f97316" color="#f97316" />
              Skill Exchange Platform · Free Forever
            </div>

            <h1 className="lp-hero-headline">
              Learn From Devs.<br />
              Teach What You <span className="lp-headline-accent">Know.</span>
            </h1>

            <p className="lp-hero-sub">
              DevSwap matches you with developers who teach what you want to learn —
              and want to learn what you teach. No money. No courses. Just people.
            </p>

            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={() => navigate('/register')}>
                Start Swapping Free <ArrowRight size={15} />
              </button>
              <button className="lp-btn-ghost" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                See How It Works
              </button>
            </div>

            {/* Trust strip */}
            <div className="lp-trust-row">
              <div className="lp-trust-avatars">
                {['AR','KS','MJ','PC','DK'].map(i => <span key={i}>{i}</span>)}
              </div>
              <p className="lp-trust-text">
                <strong>2,400+</strong> developers already swapping skills
              </p>
            </div>
          </div>

          {/* Right visual */}
          <HeroVisual />
        </div>
      </section>

      {/* ════ SKILLS TICKER ═══════════════════════════════ */}
      <div className="lp-ticker-wrap">
        <div className="lp-ticker-label">Skills traded on DevSwap</div>
        <div className="lp-ticker">
          <div className="lp-ticker-track">
            {[...skills, ...skills].map((s, i) => (
              <span key={i} className="lp-ticker-item">
                <Code size={12} /> {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ════ STATS ═══════════════════════════════════════ */}
      <div className="lp-stats-bar">
        {[
          { num: '2,400+', label: 'Active Developers',  Icon: Users },
          { num: '140+',   label: 'Skills Available',   Icon: Layers },
          { num: '8,900+', label: 'Sessions Completed', Icon: TrendingUp },
          { num: '98%',    label: 'Satisfaction Rate',  Icon: Star },
        ].map(s => (
          <div key={s.label} className="lp-stat-item">
            <div className="lp-stat-icon"><s.Icon size={18} /></div>
            <div className="lp-stat-num">{s.num}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ════ FEATURES ════════════════════════════════════ */}
      <section id="features" className="lp-features">
        <div className="lp-section-header">
          <div className="lp-section-tag">Features</div>
          <h2 className="lp-section-headline">
            Everything You Need to<br />Grow as a Developer
          </h2>
          <p className="lp-section-sub">
            Built specifically for developers who want to grow without paying for stale courses.
          </p>
        </div>
        <div className="lp-features-grid">
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ════ HOW IT WORKS ════════════════════════════════ */}
      <section id="how-it-works" className="lp-how">
        <div className="lp-how-inner">

          {/* Steps */}
          <div className="lp-how-steps">
            <div className="lp-section-tag">How It Works</div>
            <h2 className="lp-section-headline">
              Start Learning in<br />Three Simple Steps
            </h2>
            <p className="lp-section-sub">No setup fees. No subscriptions. Sign up and start trading knowledge today.</p>

            <div className="lp-steps-list">
              <Step num="01" Icon={Users}         title="Build Your Profile"
                desc="List what you can teach and what you want to learn. Add your bio, tech stack and goals." />
              <Step num="02" Icon={Zap}           title="Get Matched Instantly"
                desc="Our engine surfaces developers with complementary skills on your dashboard in seconds." />
              <Step num="03" Icon={MessageCircle} title="Connect & Start Learning"
                desc="Message your match, book a session, and start your skill exchange. Earn badges as you go." />
            </div>
          </div>

          {/* Visual: match flow card */}
          <div className="lp-how-visual">
            <div className="lp-match-flow-card">
              <div className="lp-match-flow-header">
                <div className="lp-match-flow-title">Live Match Found</div>
                <div className="lp-match-flow-badge">98% Synergy</div>
              </div>

              <div className="lp-match-pair">
                <div className="lp-match-person">
                  <div className="lp-match-person-avatar a">SR</div>
                  <div className="lp-match-person-name">Sara Reeves</div>
                  <div className="lp-match-person-chips">
                    <span className="mchip teach">Teaches React</span>
                    <span className="mchip learn">Learns Python</span>
                  </div>
                </div>

                <div className="lp-match-swap-icon">
                  <ArrowRight size={16} />
                </div>

                <div className="lp-match-person">
                  <div className="lp-match-person-avatar b">DK</div>
                  <div className="lp-match-person-name">Dev Kumar</div>
                  <div className="lp-match-person-chips">
                    <span className="mchip teach">Teaches Python</span>
                    <span className="mchip learn">Learns React</span>
                  </div>
                </div>
              </div>

              <div className="lp-match-bar-wrap">
                <div className="lp-match-bar-label">Compatibility Score</div>
                <div className="lp-match-bar-track">
                  <div className="lp-match-bar-fill" style={{ width: '98%' }} />
                </div>
                <div className="lp-match-bar-pct">98%</div>
              </div>

              <button className="lp-match-connect-btn">
                <MessageCircle size={14} /> Start Session
              </button>
            </div>

            {/* mini stats below the card */}
            <div className="lp-how-mini-stats">
              {[
                { num: '< 2 min', label: 'Average match time' },
                { num: '94%',     label: 'Start within 24h' },
              ].map(s => (
                <div key={s.label} className="lp-how-mini-stat">
                  <div className="lp-how-mini-num">{s.num}</div>
                  <div className="lp-how-mini-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════════════════════════════════ */}
      <section id="testimonials" className="lp-testi">
        <div className="lp-section-header">
          <div className="lp-section-tag">Success Stories</div>
          <h2 className="lp-section-headline">
            Real Developers,<br />Real Growth
          </h2>
          <p className="lp-section-sub">
            Don't take our word for it — here's what the community says.
          </p>
        </div>
        <div className="lp-testi-grid">
          {testimonials.map(t => <TestimonialCard key={t.name} {...t} />)}
        </div>
      </section>

      {/* ════ CTA BANNER ══════════════════════════════════ */}
      <section className="lp-cta-banner">
        <div className="lp-cta-inner">
          <div className="lp-cta-tag">Free, Always</div>
          <h2 className="lp-cta-headline">
            Ready to Accelerate<br />Your Learning?
          </h2>
          <p className="lp-cta-sub">
            Join 2,400+ developers already growing together through skill exchange.
            No credit card. No subscriptions. Just knowledge.
          </p>
          <div className="lp-cta-actions">
            <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={16} />
            </button>
            <button className="lp-btn-ghost-dark" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          <div className="lp-cta-features">
            {['No credit card', 'Cancel anytime', '2,400+ active devs'].map(f => (
              <span key={f} className="lp-cta-feat">
                <CheckCircle size={13} /> {f}
              </span>
            ))}
          </div>
        </div>
        {/* Decorative rings */}
        <div className="lp-cta-ring lp-cta-ring-1" />
        <div className="lp-cta-ring lp-cta-ring-2" />
      </section>

      {/* ════ FOOTER ══════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand-col">
            <div className="lp-footer-brand">Dev<span>Swap</span></div>
            <p className="lp-footer-tagline">
              Empowering developers through peer-to-peer knowledge exchange. Free, always.
            </p>
            <div className="lp-footer-social">
              {['Twitter', 'GitHub', 'LinkedIn'].map(s => (
                <span key={s} className="lp-footer-social-btn">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="lp-footer-col-title">Product</div>
            <ul className="lp-footer-col-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#testimonials">Stories</a></li>
            </ul>
          </div>

          <div>
            <div className="lp-footer-col-title">Company</div>
            <ul className="lp-footer-col-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          <div>
            <div className="lp-footer-col-title">Legal</div>
            <ul className="lp-footer-col-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} DevSwap. All rights reserved.</span>
          <span>Built with ❤️ for the developer community</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
