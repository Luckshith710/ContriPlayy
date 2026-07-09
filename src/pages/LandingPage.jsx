import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    // Initialize immediately
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    
    // ScrollSpy for Active Navigation
    const sections = document.querySelectorAll('section[id]');
    const scrollSpyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If intersecting significantly, set it as active
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    );
    sections.forEach((sec) => scrollSpyObserver.observe(sec));

    return () => {
      observer.disconnect();
      scrollSpyObserver.disconnect();
    };
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    { icon: '🧮', title: 'Auto-Math', desc: 'No more complex manual math or spreadsheet errors. We handle the splits, even when friends pay different amounts or drop out late.' },
    { icon: '💳', title: 'Multi-Payment Tracking', desc: 'Full support for hybrid payment environments. Track UPI transfers, bank deposits, and physical cash in one unified ledger.' },
    { icon: '📋', title: 'Booking History', desc: 'Keep a permanent record of every match, contribution, and cost change. Audit-ready logs for your entire sports group.' },
    { icon: '🔔', title: 'Smart Reminders', desc: 'Automated nudges to pending payers so you never have to awkwardly chase money from friends again.' },
    { icon: '👥', title: 'Squad Management', desc: 'Create squads for different sports. Football, Cricket, Badminton — each with their own history.' },
    { icon: '📊', title: 'Analytics', desc: 'See who contributes the most, average costs per session, and full financial summaries per sport.' },
  ];

  const faqs = [
    { q: 'Is my payment data secure?', a: 'ContriPlayy acts as a verification layer. We do not store your bank credentials. We track transaction status to help groups manage their books effectively, utilizing industry-standard encryption for all metadata.' },
    { q: 'How does the cash tracking work?', a: 'If a friend pays you in cash at the venue, you simply mark them as "Paid - Cash" in the app. This updates the total contribution pool and notifies the group that the debt has been settled.' },
    { q: 'Can I manage multiple groups?', a: 'Absolutely. You can create separate squads for Football, Cricket, Badminton, or any other sport. Each squad has its own history and frequent players.' },
    { q: 'Is ContriPlayy free to use?', a: 'Yes! Our core features are completely free. We plan to offer a Pro tier for teams with advanced analytics and priority support in the future.' },
  ];

  const navItems = ['Features', 'How It Works', 'Pricing', 'FAQ'];

  return (
    <div style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 3px; }
        
        .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
        .animate-on-scroll:nth-child(2) { transition-delay: 0.1s; }
        .animate-on-scroll:nth-child(3) { transition-delay: 0.2s; }
        .animate-on-scroll:nth-child(4) { transition-delay: 0.3s; }
        .animate-on-scroll:nth-child(5) { transition-delay: 0.4s; }
        .animate-on-scroll:nth-child(6) { transition-delay: 0.5s; }

        .hero-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%); pointer-events: none; }
        
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3); } 50% { box-shadow: 0 0 40px rgba(16,185,129,0.6); } }

        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); border-radius: 100px; font-size: 12px; font-weight: 600; color: #10b981; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 24px; }
        .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse-glow 2s infinite; }

        .hero-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(42px, 6vw, 80px); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 24px; }
        .hero-title .accent { background: linear-gradient(135deg, #10b981, #34d399, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #10b981; color: #022c22; font-weight: 700; font-size: 15px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; text-decoration: none; justify-content: center; }
        .btn-primary:hover { background: #34d399; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(16,185,129,0.4); }
        .btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%); transform: translateX(-100%); transition: transform 0.5s ease; }
        .btn-primary:hover::after { transform: translateX(100%); }

        .btn-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; background: transparent; color: #a1a1aa; font-weight: 600; font-size: 15px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; }
        .btn-secondary:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }

        .card { background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(20px); transition: all 0.3s ease; }
        .card:hover { border-color: rgba(16,185,129,0.3); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.1); }

        .feature-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; transition: all 0.3s ease; }
        .card:hover .feature-icon { background: rgba(16,185,129,0.2); transform: scale(1.1); }

        /* Navigation Styles */
        .desktop-nav { display: flex; gap: 32px; align-items: center; }
        .mobile-nav-btn { display: none; background: transparent; border: none; color: #e4e4e7; font-size: 24px; cursor: pointer; }
        
        .nav-link { color: #a1a1aa; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; padding: 4px 0; position: relative; cursor: pointer; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #10b981; transition: width 0.3s ease; }
        .nav-link:hover { color: #e4e4e7; }
        .nav-link:hover::after { width: 100%; }
        .nav-link.active { color: #10b981; font-weight: 600; }
        .nav-link.active::after { width: 100%; }

        .mobile-menu-overlay { position: fixed; inset: 0; background: rgba(9,9,11,0.98); backdrop-filter: blur(10px); z-index: 90; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 32px; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .mobile-menu-overlay.open { opacity: 1; pointer-events: all; }
        .mobile-nav-link { font-size: 24px; font-weight: 700; color: #e4e4e7; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: color 0.2s; }
        .mobile-nav-link:hover, .mobile-nav-link.active { color: #10b981; }

        .stats-bar { display: flex; gap: 40px; align-items: center; margin-top: 40px; flex-wrap: wrap; }
        .stat-num { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; color: #10b981; }
        .stat-label { font-size: 13px; color: #71717a; margin-top: 2px; }

        .mockup-card { background: linear-gradient(135deg, rgba(16,185,129,0.05), rgba(12,12,14,0.95)); border: 1px solid rgba(16,185,129,0.2); border-radius: 20px; padding: 24px; animation: float 6s ease-in-out infinite; box-shadow: 0 0 60px rgba(16,185,129,0.08), 0 20px 60px rgba(0,0,0,0.5); }
        .player-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; margin-bottom: 8px; transition: all 0.2s; }
        .player-row:hover { background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.15); }

        .faq-item { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 12px; transition: all 0.3s; background: rgba(255,255,255,0.02); }
        .faq-item:hover { border-color: rgba(255,255,255,0.15); }
        .faq-item.open { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.03); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .faq-question { padding: 20px 24px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 600; color: #f4f4f5; transition: color 0.2s; user-select: none; }
        .faq-item.open .faq-question { color: #10b981; }
        .faq-chevron { font-size: 20px; transition: transform 0.3s ease; color: #71717a; }
        .faq-item.open .faq-chevron { transform: rotate(180deg); color: #10b981; }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-in-out; }
        .faq-item.open .faq-answer { max-height: 500px; }
        .faq-answer-inner { padding: 0 24px 20px; color: #a1a1aa; font-size: 15px; line-height: 1.7; opacity: 0; transition: opacity 0.2s ease-out; transform: translateY(-10px); transition: opacity 0.3s ease, transform 0.3s ease; }
        .faq-item.open .faq-answer-inner { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }

        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }

        .step-number { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 64px; font-weight: 900; color: rgba(16,185,129,0.12); line-height: 1; margin-bottom: 8px; transition: color 0.3s; }
        .step-card:hover .step-number { color: rgba(16,185,129,0.3); }
        .step-card { padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; height: 100%; }
        .step-card:hover { border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.03); }

        .cta-section { background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03)); border: 1px solid rgba(16,185,129,0.2); border-radius: 24px; padding: 80px 40px; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(ellipse, rgba(16,185,129,0.15), transparent 70%); }
        .cta-section::after { content: ''; position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: radial-gradient(ellipse, rgba(16,185,129,0.1), transparent 70%); }

        .tag { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .tag-paid { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .tag-pending { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }

        /* Pricing Specific Styles */
        .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 800px; margin: 0 auto; }
        .pricing-card { background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px; position: relative; overflow: hidden; transition: all 0.3s ease; }
        .pricing-card.pro { background: linear-gradient(180deg, rgba(16,185,129,0.08) 0%, rgba(12,12,14,0.8) 100%); border-color: rgba(16,185,129,0.4); box-shadow: 0 20px 40px rgba(16,185,129,0.1); }
        .pricing-card.pro::before { content: 'MOST POPULAR'; position: absolute; top: 12px; right: 12px; background: rgba(16,185,129,0.15); color: #10b981; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 100px; letter-spacing: 0.05em; }
        .pricing-price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 48px; font-weight: 800; color: #f4f4f5; margin: 16px 0; }
        .pricing-feature { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; color: #a1a1aa; font-size: 14px; line-height: 1.5; }
        .pricing-check { color: #10b981; font-weight: 700; flex-shrink: 0; }

        /* Responsive */
        @media (max-width: 900px) {
          .hero-title { font-size: clamp(36px, 8vw, 48px); }
          .stats-bar { gap: 20px; }
          .pricing-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-nav-btn { display: block; z-index: 101; }
          .hero-section-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .features-grid, .steps-grid { grid-template-columns: 1fr !important; }
          .hero-title { text-align: center; }
          .hero-text-content { text-align: center; display: flex; flex-direction: column; align-items: center; }
          .stats-bar { justify-content: center; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isScrolled || mobileMenuOpen ? 'rgba(9,9,11,0.9)' : 'transparent', backdropFilter: isScrolled || mobileMenuOpen ? 'blur(20px)' : 'none', borderBottom: isScrolled || mobileMenuOpen ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.3s ease' }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 101 }}>
          ⚽ ContriPlayy
        </div>
        
        {/* Desktop Nav */}
        <div className="desktop-nav">
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginRight: '16px' }}>
            {navItems.map(item => {
              const id = item.toLowerCase().replace(/ /g, '-');
              return (
                <a 
                  key={item} 
                  href={`#${id}`}
                  onClick={(e) => handleNavClick(e, id)}
                  className={`nav-link ${activeSection === id ? 'active' : ''}`}
                >
                  {item}
                </a>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/signin" className="nav-link" style={{ padding: '8px 16px' }}>Log In</Link>
            <Link to="/signin" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Get Started →</Link>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button className="mobile-nav-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map(item => {
          const id = item.toLowerCase().replace(/ /g, '-');
          return (
            <a 
              key={item} 
              href={`#${id}`}
              onClick={(e) => handleNavClick(e, id)}
              className={`mobile-nav-link ${activeSection === id ? 'active' : ''}`}
            >
              {item}
            </a>
          );
        })}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px', width: '200px' }}>
          <Link to="/signin" className="btn-secondary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Log In</Link>
          <Link to="/signin" className="btn-primary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Get Started →</Link>
        </div>
      </div>

      {/* HERO */}
      <section className="grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '140px 32px 80px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div className="hero-glow" />
        <div className="hero-section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <div className="hero-text-content" style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
            <h1 className="hero-title">
              Split Contributions.<br />
              <span className="accent">Not Friendships.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
              The ultimate platform for friends to split sports booking expenses, automate calculations, and track payments seamlessly. Stop chasing money, start playing more.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn-primary">Get Started Free →</Link>
            </div>
          </div>

          {/* Right — Mockup */}
          <div style={{ animation: 'fadeInUp 0.8s ease 0.2s forwards', opacity: 0 }}>
            <div className="mockup-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Active Match</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#f4f4f5' }}>Turf Booking #842</div>
                  <div style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>Sunday, 7:00 PM • Arena X</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#10b981' }}>₹2,400</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                {[{ name: 'Rahul Sharma', method: 'UPI', paid: true }, { name: 'Ananya Iyer', method: 'Cash', paid: false }, { name: 'Arjun Dev', method: 'UPI', paid: true }].map((p, i) => (
                  <div key={i} className="player-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `hsl(${i * 60 + 120}, 60%, 25%)`, border: `1px solid hsl(${i * 60 + 120}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: `hsl(${i * 60 + 120}, 70%, 70%)` }}>{p.name[0]}</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#71717a' }}>{p.method}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`tag ${p.paid ? 'tag-paid' : 'tag-pending'}`}>{p.paid ? '✓ Paid' : '⏳ Pending'}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: p.paid ? '#10b981' : '#fbbf24' }}>₹300</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <div style={{ background: 'rgba(16,185,129,0.06)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>UPI Total</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₹1,800</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Cash Total</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f4f4f5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₹600</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 32px', maxWidth: '1200px', margin: '0 auto', scrollMarginTop: '80px' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Features</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>Designed for Performance</h2>
          <p style={{ color: '#71717a', fontSize: '17px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>Skip the manual spreadsheets. ContriPlayy brings elite financial tracking to your local turf matches.</p>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} className="card animate-on-scroll" style={{ padding: '28px' }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: '#71717a', fontSize: '14px', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '100px 32px', background: 'rgba(16,185,129,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>How It Works</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em' }}>From Booking to Playing<br />in Seconds.</h2>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { title: 'Book your court', desc: 'Select your venue and total cost. Our system initializes the ledger immediately so you can start organizing.' },
              { title: 'Add your squad', desc: 'Invite friends via link or select from your frequent players list. Watch the math update live as people join.' },
              { title: 'Settle the ledger', desc: 'We help you track partial payments and full settlements, closing the ledger once everyone is squared up.' },
            ].map((step, i) => (
              <div key={i} className="step-card animate-on-scroll">
                <div className="step-number">0{i + 1}</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ color: '#71717a', fontSize: '14px', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 32px', maxWidth: '1200px', margin: '0 auto', scrollMarginTop: '80px' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Pricing</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>Fair Pricing for Every Squad</h2>
          <p style={{ color: '#71717a', fontSize: '17px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>Start managing your games for free. Upgrade when your squad needs more firepower.</p>
        </div>
        
        <div className="pricing-grid">
          {/* Free Tier */}
          <div className="pricing-card animate-on-scroll">
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 700 }}>Starter</h3>
            <div className="pricing-price">₹0<span style={{ fontSize: '16px', color: '#71717a', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>/forever</span></div>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>Perfect for casual weekend groups looking to simplify their splits.</p>
            
            <div style={{ marginBottom: '32px' }}>
              {[
                'Unlimited match creations',
                'Basic ledger and math splitting',
                'Track UPI and Cash payments',
                'Player squads history',
                'Basic smart reminders'
              ].map((feature, i) => (
                <div key={i} className="pricing-feature">
                  <span className="pricing-check">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/signin" className="btn-secondary" style={{ width: '100%' }}>Get Started Free</Link>
          </div>

          {/* Pro Tier */}
          <div className="pricing-card pro animate-on-scroll">
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 700, color: '#10b981' }}>Pro Squad</h3>
            <div className="pricing-price">₹299<span style={{ fontSize: '16px', color: '#71717a', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>/month</span></div>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>For serious organizers and regular squads who want deep insights.</p>
            
            <div style={{ marginBottom: '32px' }}>
              {[
                'Everything in Starter, plus:',
                'Advanced Player Analytics',
                'Personal Expense Tracking',
                'Export ledgers to CSV/Excel',
                'Priority support'
              ].map((feature, i) => (
                <div key={i} className="pricing-feature">
                  <span className="pricing-check" style={{ color: i === 0 ? '#71717a' : '#10b981' }}>{i === 0 ? '—' : '✓'}</span>
                  <span style={{ color: i === 0 ? '#71717a' : '#a1a1aa' }}>{feature}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%' }}>Coming Soon</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '100px 32px', maxWidth: '800px', margin: '0 auto', scrollMarginTop: '80px' }}>
        <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>FAQ</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Frequently Asked Questions</h2>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="animate-on-scroll">
            <div className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <div className="faq-question" onClick={(e) => toggleFaq(e, i)}>
                <span>{faq.q}</span>
                <span className="faq-chevron">⌄</span>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-inner">{faq.a}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 32px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="cta-section animate-on-scroll">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '20px' }}>Ready to game<br /><span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>without the drama?</span></div>
            <p style={{ color: '#71717a', fontSize: '17px', marginBottom: '36px' }}>Join thousands of friend groups already using ContriPlayy.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signin" className="btn-primary" style={{ fontSize: '16px', padding: '16px 36px' }}>Start Your First Split →</Link>
              <Link to="/dashboard" className="btn-secondary" style={{ fontSize: '16px', padding: '16px 36px' }}>View Dashboard</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981' }}>⚽ ContriPlayy</div>
      </footer>
    </div>
  );
}
