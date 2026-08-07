'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// Helper: Escape HTML
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!value) return;
    const target = typeof value === 'string' ? parseInt(value) : value;
    if (isNaN(target)) { setCount(value); return; }
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span>{count}</span>;
}

// Score Ring SVG component
function ScoreRing({ score, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="score-ring-fill" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{Math.round(score)}</span>
      </div>
    </div>
  );
}

// Tab component
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <clipPath id="globe-clip">
        <circle cx="12" cy="12" r="10" />
      </clipPath>
    </defs>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <g clipPath="url(#globe-clip)">
      <g className="animate-earth-spin-x">
        <ellipse cx="-12" cy="12" rx="6" ry="10" />
        <ellipse cx="0" cy="12" rx="6" ry="10" />
        <ellipse cx="12" cy="12" rx="6" ry="10" />
        <ellipse cx="24" cy="12" rx="6" ry="10" />
      </g>
    </g>
  </svg>
);

const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>;

const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;

const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;

const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;

const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="0.5" fill="currentColor"/></svg>;

const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m8.59 10.49 6.83-3.98"/></svg>;

const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;

const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>;

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>;

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>;

const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;

const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>;

const HeadingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/></svg>;

const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;

const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>;


export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('seo');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const resultsRef = useRef(null);

  const analyzeWebsite = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Analysis failed');
      } else {
        setData(result);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      setError(`Failed to connect to the analysis server. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = (analysisData) => {
    if (!analysisData) return [];
    
    const paragraphs = [];
    const seo = analysisData.seo?.score || 0;
    const speed = analysisData.performance?.load_time || 0;
    const issues = analysisData.seo?.checks?.filter(c => !c.passed) || [];
    
    // Overall rating
    let overall = `The website ${analysisData.url} performs `;
    if (seo >= 80 && speed < 3) overall += "exceptionally well across our automated checks.";
    else if (seo >= 60 && speed < 5) overall += "reasonably well, but has room for improvement.";
    else overall += "poorly in our checks and requires significant optimization.";
    paragraphs.push(overall);

    // SEO & Speed
    paragraphs.push(`It achieves an SEO score of ${seo}/100 and loads in ${speed} seconds. ${speed > 3 ? 'The load time is quite slow and could negatively impact user experience and search rankings.' : 'The load speed is excellent.'}`);
    
    // Content
    const words = analysisData.content?.word_count || 0;
    if (words > 1000) paragraphs.push(`The content is highly detailed with over ${words} words, offering substantial value to visitors.`);
    else if (words > 300) paragraphs.push(`The page contains a decent amount of content (${words} words) which is adequate for most standard pages.`);
    else paragraphs.push(`With only ${words} words, the content might be considered thin by search engines.`);

    // Improvements
    if (issues.length > 0) {
        paragraphs.push(`Top areas for improvement include: ${issues.slice(0, 3).map(i => i.name.toLowerCase()).join(', ')}.`);
    } else {
        paragraphs.push(`No major SEO issues were detected. Keep up the good work!`);
    }

    return paragraphs;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') analyzeWebsite();
  };

  // TABS definition
  const tabs = [
    { id: 'seo', label: 'SEO', icon: <TargetIcon /> },
    { id: 'content', label: 'Content', icon: <FileTextIcon /> },
    { id: 'tech', label: 'Tech Stack', icon: <CodeIcon /> },
    { id: 'security', label: 'Security', icon: <ShieldIcon /> },
    { id: 'accessibility', label: 'Accessibility', icon: <EyeIcon /> },
    { id: 'headings', label: 'Headings', icon: <HeadingIcon /> },
    { id: 'links', label: 'Links', icon: <LinkIcon /> },
    { id: 'images', label: 'Images', icon: <ImageIcon /> },
    { id: 'meta', label: 'Meta Tags', icon: <TagIcon /> },
    { id: 'keywords', label: 'Keywords', icon: <KeyIcon /> },
    { id: 'speed', label: 'Page Speed', icon: <ZapIcon /> },
    { id: 'social', label: 'Social', icon: <ShareIcon /> },
    { id: 'contact', label: 'Contact', icon: <MailIcon /> },
    { id: 'ai', label: 'Summary', icon: <SparklesIcon /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Background ambient glow (Optimized) */}
      <div className="fixed inset-0 pointer-events-none z-[-2]">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-indigo-900/5 to-transparent rounded-full" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-purple-900/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-card w-[90%] max-w-4xl !rounded-full border border-white/10 shadow-2xl">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <GlobeIcon />
            </div>
            <span className="text-lg font-bold tracking-tight">Web<span className="gradient-text">Scope</span></span>
          </div>
          <a href="https://github.com/aurasqlm/webscope" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-zinc-300 hover:text-white">
            <GithubIcon />
            <span className="text-sm hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative pt-32 pb-16 px-6 transition-all duration-700 ${data ? 'pb-8 pt-24' : 'min-h-[70vh] flex flex-col items-center justify-center'}`}>
        <div className="max-w-3xl mx-auto text-center">
          {!data && (
            <>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
                Website <span className="gradient-text">Intelligence</span> Analyzer
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl mb-10 animate-fade-in-up delay-1 max-w-2xl mx-auto">
                Scrape, analyze, and understand any website. SEO, tech stack, security, accessibility, content quality, and AI-powered insights.
              </p>
            </>
          )}

          {/* Search Box */}
          <div className="animate-fade-in-up delay-2">
            <div className="flex items-center gap-3 glass-card p-2 rounded-2xl focus-within:border-indigo-500/30 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all duration-300">
              <div className="pl-4 text-zinc-500"><SearchIcon /></div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter any URL (e.g., github.com)"
                className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-lg py-3"
                id="url-input"
              />
              <button
                onClick={analyzeWebsite}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                id="analyze-btn"
              >
                {loading ? <><LoaderIcon /> <span>Analyzing...</span></> : <><SearchIcon /> <span>Analyze</span></>}
              </button>
            </div>
            {!data && <p className="text-zinc-600 text-sm mt-3">Free | No signup | Open source | AI-powered</p>}
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mb-8 animate-fade-in">
          <div className="glass-card border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center gap-3">
            <div className="text-red-400"><XIcon /></div>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && (() => {
        const overallScore = Math.round(((data.seo?.score || 0) * 1.5 + (data.performance?.status_code === 200 ? 100 : 50) + (data.images?.with_alt > 0 ? 50 : 0)) / 3);
        return (
        <section ref={resultsRef} className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-up">

          {/* Overview Bar */}
          <div className="glass-card p-5 rounded-2xl mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">URL</p>
              <p className="text-sm text-white truncate font-medium">{data.url}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
              <p className={`text-sm font-medium ${data.performance?.status_code === 200 ? 'text-green-400' : 'text-yellow-400'}`}>{data.performance?.status_code}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Load Time</p>
              <p className="text-sm text-white font-medium">{data.performance?.load_time}s</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Page Size</p>
              <p className="text-sm text-white font-medium">{data.performance?.page_size_formatted}</p>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300 col-span-2 md:col-span-1 lg:col-span-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>
              <div className="z-10 flex flex-col items-center">
                <ScoreRing score={overallScore} size={100} />
                <span className="text-xs text-zinc-300 mt-2 font-bold tracking-wide">Overall Rating</span>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300 col-span-2 md:col-span-1 lg:col-span-1">
              <ScoreRing score={data.seo?.score || 0} size={100} />
              <span className="text-xs text-zinc-400 mt-2">SEO Score</span>
            </div>
            {[
              { label: 'Words', value: data.content?.word_count, icon: <FileTextIcon /> },
              { label: 'Links', value: data.links?.total, icon: <LinkIcon /> },
              { label: 'Images', value: data.images?.total, icon: <ImageIcon /> },
              { label: 'Scripts', value: data.performance?.scripts_count, icon: <CodeIcon /> },
              { label: 'Read Time', value: data.content?.reading_time, icon: <BookOpenIcon /> },
            ].map((stat, i) => (
              <div key={stat.label} className={`glass-card p-5 rounded-2xl flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300 animate-fade-in-up delay-${i+1}`}>
                <div className="text-indigo-400 mb-2">{stat.icon}</div>
                <span className="text-2xl font-bold text-white">
                  {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} /> : stat.value || '0'}
                </span>
                <span className="text-xs text-zinc-400 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Score Row - Security + Accessibility + Readability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Security', score: data.security?.score, icon: <ShieldIcon /> },
              { label: 'Accessibility', score: data.accessibility?.score, icon: <EyeIcon /> },
              { label: 'Readability', score: data.readability?.flesch_reading_ease, subtitle: data.readability?.interpretation, icon: <BookOpenIcon /> },
            ].map((item) => (
              <div key={item.label} className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                <ScoreRing score={item.score || 0} size={70} strokeWidth={6} />
                <div>
                  <p className="text-white font-semibold">{item.label}</p>
                  <p className="text-sm text-zinc-400">{item.subtitle || `${Math.round(item.score || 0)}/100`}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>

          {/* Tab Panels */}
          <div className="glass-card p-6 rounded-2xl min-h-[300px]">

            {/* SEO Panel */}
            {activeTab === 'seo' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><TargetIcon /> SEO Analysis</h3>
                <div className="space-y-2">
                  {data.seo?.checks?.map((check, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${check.passed ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                      <div className="flex items-center gap-3">
                        <span className={check.passed ? 'text-green-400' : 'text-red-400'}>
                          {check.passed ? <CheckIcon /> : <XIcon />}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{check.name}</p>
                          <p className="text-xs text-zinc-400">{check.detail}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-mono px-2 py-1 rounded-lg ${check.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {check.points}/{check.max_points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Panel */}
            {activeTab === 'content' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileTextIcon /> Content Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Word Count', value: data.content?.word_count },
                    { label: 'Paragraphs', value: data.content?.paragraphs },
                    { label: 'Reading Time', value: data.content?.reading_time },
                    { label: 'Unique Words', value: data.keyword_density?.unique_words },
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-white">{item.value || '0'}</p>
                      <p className="text-xs text-zinc-400 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <h4 className="text-sm font-semibold text-zinc-300 mb-3">Readability</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Reading Ease', value: data.readability?.flesch_reading_ease?.toFixed(1) },
                    { label: 'Grade Level', value: data.readability?.grade_level?.toFixed(1) },
                    { label: 'Avg Sentence Length', value: data.readability?.avg_sentence_length?.toFixed(1) },
                    { label: 'Interpretation', value: data.readability?.interpretation },
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-xl font-bold text-indigo-400">{item.value || 'N/A'}</p>
                      <p className="text-xs text-zinc-400 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Panel */}
            {activeTab === 'tech' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><CodeIcon /> Detected Technologies</h3>
                {data.technologies?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {data.technologies.map((tech, i) => (
                      <span key={tech} className={`px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium animate-fade-in-up delay-${Math.min(i+1, 6)}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-10">No technologies detected</p>
                )}
              </div>
            )}

            {/* Security Panel */}
            {activeTab === 'security' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShieldIcon /> Security Headers</h3>
                <div className="space-y-2">
                  {data.security?.headers?.map((header, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${header.present ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                      <div className="flex items-center gap-3">
                        <span className={header.present ? 'text-green-400' : 'text-red-400'}>
                          {header.present ? <CheckIcon /> : <XIcon />}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{header.name}</p>
                          <p className="text-xs text-zinc-400">{header.present ? `Value: ${header.value}` : header.recommendation}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg ${header.present ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {header.present ? 'Present' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accessibility Panel */}
            {activeTab === 'accessibility' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><EyeIcon /> Accessibility</h3>
                <div className="space-y-2">
                  {data.accessibility?.checks?.map((check, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${check.passed ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                      <span className={check.passed ? 'text-green-400' : 'text-red-400'}>
                        {check.passed ? <CheckIcon /> : <XIcon />}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{check.name}</p>
                        <p className="text-xs text-zinc-400">{check.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Headings Panel */}
            {activeTab === 'headings' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><HeadingIcon /> Heading Structure</h3>
                <div className="space-y-1">
                  {['h1','h2','h3','h4','h5','h6'].map(level => (
                    data.headings?.[level]?.length > 0 && data.headings[level].map((text, i) => (
                      <div key={`${level}-${i}`} className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" style={{ paddingLeft: `${(parseInt(level[1]) - 1) * 24 + 12}px` }}>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          level === 'h1' ? 'bg-indigo-500/20 text-indigo-400' :
                          level === 'h2' ? 'bg-purple-500/20 text-purple-400' :
                          level === 'h3' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>{level.toUpperCase()}</span>
                        <span className="text-sm text-zinc-300">{text}</span>
                      </div>
                    ))
                  ))}
                  {!['h1','h2','h3','h4','h5','h6'].some(l => data.headings?.[l]?.length > 0) && (
                    <p className="text-zinc-500 text-center py-10">No headings found</p>
                  )}
                </div>
              </div>
            )}

            {/* Links Panel */}
            {activeTab === 'links' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><LinkIcon /> Links Analysis</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{data.links?.total || 0}</p>
                    <p className="text-xs text-zinc-400">Total</p>
                  </div>
                  <div className="bg-blue-500/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{data.links?.internal || 0}</p>
                    <p className="text-xs text-zinc-400">Internal</p>
                  </div>
                  <div className="bg-purple-500/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">{data.links?.external || 0}</p>
                    <p className="text-xs text-zinc-400">External</p>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {data.links?.items?.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      {link.is_external ? <span className="text-purple-400"><ExternalLinkIcon /></span> : <span className="text-blue-400"><LinkIcon /></span>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300 truncate">{link.text || '(no text)'}</p>
                        <p className="text-xs text-zinc-500 truncate">{link.url}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${link.is_external ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {link.is_external ? 'External' : 'Internal'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Panel */}
            {activeTab === 'images' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon /> Images Analysis</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{data.images?.total || 0}</p>
                    <p className="text-xs text-zinc-400">Total</p>
                  </div>
                  <div className="bg-green-500/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{data.images?.with_alt || 0}</p>
                    <p className="text-xs text-zinc-400">With Alt</p>
                  </div>
                  <div className="bg-red-500/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{data.images?.without_alt || 0}</p>
                    <p className="text-xs text-zinc-400">Missing Alt</p>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {data.images?.items?.map((img, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {img.src ? <img src={img.src} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} /> : <ImageIcon />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 truncate">{img.src || '(no src)'}</p>
                        <p className={`text-xs ${img.alt ? 'text-green-400' : 'text-red-400'}`}>{img.alt || 'Missing alt text'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Tags Panel */}
            {activeTab === 'meta' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><TagIcon /> Meta Tags</h3>
                {data.meta_tags?.og && Object.keys(data.meta_tags.og).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-2">Open Graph</h4>
                    <div className="space-y-1">
                      {Object.entries(data.meta_tags.og).map(([key, value]) => (
                        <div key={key} className="flex gap-4 p-2 rounded-lg bg-white/3">
                          <span className="text-xs text-zinc-400 w-40 flex-shrink-0 font-mono">{key}</span>
                          <span className="text-xs text-zinc-300 break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.meta_tags?.twitter && Object.keys(data.meta_tags.twitter).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">Twitter Cards</h4>
                    <div className="space-y-1">
                      {Object.entries(data.meta_tags.twitter).map(([key, value]) => (
                        <div key={key} className="flex gap-4 p-2 rounded-lg bg-white/3">
                          <span className="text-xs text-zinc-400 w-40 flex-shrink-0 font-mono">{key}</span>
                          <span className="text-xs text-zinc-300 break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.meta_tags?.other?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Other Meta Tags</h4>
                    <div className="space-y-1">
                      {data.meta_tags.other.map((tag, i) => (
                        <div key={i} className="flex gap-4 p-2 rounded-lg bg-white/3">
                          <span className="text-xs text-zinc-400 w-40 flex-shrink-0 font-mono">{tag.name}</span>
                          <span className="text-xs text-zinc-300 break-all">{tag.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Keywords Panel */}
            {activeTab === 'keywords' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><KeyIcon /> Keyword Density</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{data.keyword_density?.total_words || 0}</p>
                    <p className="text-xs text-zinc-400">Total Words</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-400">{data.keyword_density?.unique_words || 0}</p>
                    <p className="text-xs text-zinc-400">Unique Words</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.keyword_density?.keywords?.map((kw, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <span className="text-xs text-zinc-500 w-6 text-right">#{i+1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{kw.word}</span>
                          <span className="text-xs text-zinc-400">{kw.count}x ({kw.density?.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(kw.density * 20, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page Speed Panel */}
            {activeTab === 'speed' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ZapIcon /> Page Speed Factors</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'DOM Elements', value: data.page_speed?.dom_elements },
                    { label: 'Inline Scripts', value: data.page_speed?.inline_scripts },
                    { label: 'Inline Styles', value: data.page_speed?.inline_styles },
                    { label: 'Render Blocking', value: data.page_speed?.render_blocking_scripts },
                    { label: 'Lazy Images', value: `${data.page_speed?.lazy_images || 0}/${data.page_speed?.total_images || 0}` },
                    { label: 'Compression', value: data.page_speed?.compression || 'None' },
                    { label: 'External Scripts', value: data.performance?.scripts_count },
                    { label: 'Stylesheets', value: data.performance?.stylesheets_count },
                    { label: 'Load Time', value: `${data.performance?.load_time}s` },
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-4">
                      <p className="text-xl font-bold text-white">{item.value ?? 'N/A'}</p>
                      <p className="text-xs text-zinc-400 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Panel */}
            {activeTab === 'social' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShareIcon /> Social Media Links</h3>
                {data.social_links?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.social_links.map((social, i) => (
                      <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <GlobeIcon />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">{social.platform}</p>
                          <p className="text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors">Visit</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-10">No social media links found</p>
                )}
              </div>
            )}

            {/* Contact Panel */}
            {activeTab === 'contact' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MailIcon /> Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Email Addresses</h4>
                    {data.contact_info?.emails?.length > 0 ? (
                      <div className="space-y-1">
                        {data.contact_info.emails.map((email, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <MailIcon />
                            <span className="text-sm text-indigo-400">{email}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-zinc-500 text-sm">No email addresses found</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Phone Numbers</h4>
                    {data.contact_info?.phones?.length > 0 ? (
                      <div className="space-y-1">
                        {data.contact_info.phones.map((phone, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <span className="text-sm text-indigo-400">{phone}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-zinc-500 text-sm">No phone numbers found</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Algorithmic Summary Panel */}
            {activeTab === 'ai' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><SparklesIcon /> Algorithmic Summary</h3>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-xl p-6">
                      <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                        {generateSummary(data).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
            )}

          </div>

          {/* Page Info */}
          <div className="glass-card p-6 rounded-2xl mt-6">
            <h3 className="text-lg font-semibold mb-4">Page Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {[
                ['Title', data.basic_info?.title],
                ['Description', data.basic_info?.description],
                ['Language', data.basic_info?.language],
                ['Charset', data.basic_info?.charset],
                ['Canonical', data.basic_info?.canonical],
                ['Favicon', data.basic_info?.favicon],
                ['Content Type', data.performance?.content_type],
                ['URL Length', `${data.url_analysis?.length || 0} characters`],
              ].filter(([_, v]) => v).map(([label, value]) => (
                <div key={label} className="flex items-start gap-2 py-2 border-b border-white/5">
                  <span className="text-xs text-zinc-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-zinc-300 break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </section>
        );
      })()}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-zinc-500 text-sm">
          Built with care by <span className="gradient-text font-semibold">WebScope</span> | <a href="https://github.com/aurasqlm/webscope" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Open Source</a>
        </p>
      </footer>
    </div>
  );
}
