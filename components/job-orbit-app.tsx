"use client";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Cloud,
  ExternalLink,
  FileText,
  Filter,
  Globe2,
  HeartHandshake,
  LayoutDashboard,
  Link2,
  ListFilter,
  MapPin,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type AnchorHTMLAttributes } from "react";
import {
  CATEGORIES,
  COMPANIES,
  FILTER_CONFIG,
  JOB_DATA_META,
  JOBS,
  formatSalary,
  formatSalaryInInr,
  getCompanyById,
  getJobBySlug,
  postedLabel,
  type Job,
} from "@/lib/job-data";

const navItems = [
  ["Jobs", "/jobs"],
  ["Companies", "/companies"],
  ["Categories", "/categories/devops"],
  ["Remote Jobs", "/jobs/remote"],
  ["Salary Insights", "/salary-insights"],
  ["Career Resources", "/career-resources"],
] as const;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function routeHref(href: string) {
  return href.startsWith("/") ? `${BASE_PATH}${href}` : href;
}

function Logo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function AppLink({
  href,
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
}) {
  return (
    <a href={routeHref(href)} className={className} {...props}>
      {children}
    </a>
  );
}

function Header({
  savedCount,
  dark,
  onToggleTheme,
}: {
  savedCount: number;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <AppLink href="/" className="brand">
          <Logo />
          <span>JobOrbit <b>AI</b></span>
        </AppLink>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <AppLink key={label} href={href}>{label}</AppLink>
          ))}
          <AppLink href="/post-job" className="mobile-only nav-post">Post a job</AppLink>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" onClick={onToggleTheme} aria-label="Toggle colour theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <AppLink href="/saved-jobs" className="icon-button saved-link" aria-label="Saved jobs">
            <Bookmark size={18} />
            {savedCount > 0 && <em>{savedCount}</em>}
          </AppLink>
          <AppLink href="/post-job" className="button button-outline desktop-only">
            <BriefcaseBusiness size={16} /> Post a Job
          </AppLink>
          <button className="button button-primary desktop-only">Sign In</button>
          <button
            className="icon-button menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

const fetchedAtLabel = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
}).format(new Date(JOB_DATA_META.fetchedAt));

function FreshnessNotice() {
  return (
    <div className="demo-notice">
      <ShieldCheck size={15} />
      <span><b>Early-career catalogue:</b> every role states a minimum of 1–4 years, was posted within 45 days, and has a future source expiry. Updated {fetchedAtLabel}.</span>
    </div>
  );
}

function SearchBar({ compact = false }: { compact?: boolean }) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("All locations");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("location", location);
    if (region !== "All locations") params.set("region", region);
    window.location.href = routeHref(`/jobs${params.size ? `?${params.toString()}` : ""}`);
  };
  return (
    <form className={`search-bar ${compact ? "search-bar-compact" : ""}`} onSubmit={submit}>
      <label className="search-field">
        <span>{compact ? "Search jobs" : "Job title, skill or company"}</span>
        <div><Search size={18} /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. DevOps, Kubernetes, MLOps" /></div>
      </label>
      {!compact && (
        <>
          <label className="search-field">
            <span>Location</span>
            <div><MapPin size={18} /><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, state or remote" /></div>
          </label>
          <label className="search-field region-select">
            <span>Region</span>
            <div><Globe2 size={18} /><select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>All locations</option>
              <option>India</option>
              <option>Outside India</option>
              <option>Remote worldwide</option>
            </select><ChevronDown size={16} /></div>
          </label>
        </>
      )}
      <button className="button button-primary search-submit" type="submit">Search Jobs <ArrowRight size={17} /></button>
    </form>
  );
}

function CompanyLogo({ job, size = "medium" }: { job: Job; size?: "small" | "medium" | "large" }) {
  const company = getCompanyById(job.companyId);
  return (
    <CompanyMark
      key={job.companyLogoUrl || job.companyId}
      name={job.companyName}
      initials={job.companyLogo}
      logoUrl={job.companyLogoUrl || company?.logoUrl || ""}
      accent={company?.accent ?? "#4f46e5"}
      size={size}
    />
  );
}

function CompanyMark({
  name,
  initials,
  logoUrl,
  accent,
  size = "medium",
}: {
  name: string;
  initials: string;
  logoUrl: string;
  accent: string;
  size?: "small" | "medium" | "large";
}) {
  const [failed, setFailed] = useState(!logoUrl);
  return (
    <span
      className={`company-logo company-logo-${size} ${!failed ? "has-image" : ""}`}
      style={{ "--logo": accent } as React.CSSProperties}
    >
      {!failed ? (
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          sizes={size === "large" ? "58px" : size === "small" ? "34px" : "46px"}
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : initials}
    </span>
  );
}

function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "blue" | "green" | "violet" | "orange" }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

function JobCard({
  job,
  selected = false,
  detailed = false,
  isSaved,
  onSelect,
  onSave,
}: {
  job: Job;
  selected?: boolean;
  detailed?: boolean;
  isSaved: boolean;
  onSelect: () => void;
  onSave: () => void;
}) {
  return (
    <article className={`job-card ${selected ? "selected" : ""} ${detailed ? "job-card-detailed" : ""}`} onClick={onSelect}>
      <div className="job-card-top">
        <CompanyLogo job={job} />
        <div className="job-card-heading">
          <div className="badge-row">
            {job.daysAgo === 0 && <Tag tone="blue">New</Tag>}
            {job.isVerified && <Tag tone="green"><ShieldCheck size={10} /> Active source</Tag>}
            <Tag tone={job.regionType === "India" ? "orange" : "green"}>{job.regionType}</Tag>
          </div>
          <h3>{job.title}</h3>
          <p>{job.companyName}</p>
        </div>
        <button
          className={`save-button ${isSaved ? "saved" : ""}`}
          aria-label={isSaved ? "Remove saved job" : "Save job"}
          onClick={(event) => {
            event.stopPropagation();
            onSave();
          }}
        >
          <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="job-meta">
        <span><MapPin size={14} />{job.locationText}</span>
        <span><BriefcaseBusiness size={14} />{job.workplaceType}</span>
        <span><CircleDollarSign size={14} />{formatSalary(job)}</span>
        <span><Users size={14} />{job.experienceText}</span>
      </div>
      <div className="skill-row">
        {job.skills.slice(0, detailed ? 5 : 4).map((skill) => <Tag key={skill}>{skill}</Tag>)}
      </div>
      <div className="job-card-footer">
        <span>{postedLabel(job.daysAgo)}</span>
        <span>•</span>
        <span>{job.employmentType}</span>
        <span>•</span>
        <span>Source: {job.sourceName}</span>
        {detailed && <button className="text-link" onClick={(event) => { event.stopPropagation(); onSelect(); }}>View job <ArrowRight size={14} /></button>}
      </div>
    </article>
  );
}

function Hero({ onChip }: { onChip: (value: string) => void }) {
  const chips = ["AI Engineer", "DevOps Engineer", "MLOps Engineer", "Platform Engineer", "SRE", "AWS", "Kubernetes"];
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={14} /> AI-ready career discovery</span>
        <h1>Find your next <span>AI, DevOps</span> or <span>MLOps opportunity</span></h1>
        <p>Focused opportunities for professionals with a stated minimum requirement of 1–4 years.</p>
      </div>
      <div className="orbit-visual" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <span className="planet" />
        <span className="satellite satellite-ai">AI</span>
        <span className="satellite satellite-code">&lt;/&gt;</span>
        <span className="satellite satellite-infinity">∞</span>
        <span className="star star-a" />
        <span className="star star-b" />
        <span className="star star-c" />
      </div>
      <div className="hero-search">
        <SearchBar />
        <div className="popular-searches">
          <span>Popular:</span>
          {chips.map((chip) => <button key={chip} onClick={() => onChip(chip)}>{chip}</button>)}
        </div>
      </div>
    </section>
  );
}

const guidedRoles = [
  { label: "DevOps", categories: ["DevOps", "Cloud Engineering"] },
  { label: "AI & ML", categories: ["Artificial Intelligence", "Machine Learning", "Generative AI"] },
  { label: "MLOps", categories: ["MLOps", "Platform Engineering"] },
  { label: "SRE & Platform", categories: ["Site Reliability Engineering", "Platform Engineering"] },
] as const;

const guidedQuestions = [
  { key: "role", title: "Which role family are you targeting?", options: guidedRoles.map((item) => item.label) },
  { key: "experience", title: "How much professional experience do you have?", options: ["1 year", "2 years", "3 years", "4 years"] },
  { key: "location", title: "Where do you want to work?", options: ["India", "Hyderabad", "Bengaluru", "Remote worldwide"] },
  { key: "workplace", title: "Which work arrangement fits you?", options: ["Any arrangement", "Remote", "Hybrid", "On-site"] },
] as const;

const locationAliases = [
  "hyderabad",
  "bengaluru",
  "bangalore",
  "pune",
  "mumbai",
  "chennai",
  "noida",
  "gurugram",
  "gurgaon",
  "delhi",
  "india",
] as const;

function inferRoleCategories(value: string) {
  const text = value.toLowerCase();
  const categories = new Set<string>();
  const add = (...items: string[]) => items.forEach((item) => categories.add(item));
  if (/\bdevops\b|ci.?cd|terraform|ansible|jenkins/.test(text)) add("DevOps", "Cloud Engineering");
  if (/\bsre\b|site reliability|observability|prometheus|grafana/.test(text)) add("Site Reliability Engineering", "Platform Engineering");
  if (/platform|kubernetes|infrastructure/.test(text)) add("Platform Engineering", "Cloud Engineering");
  if (/cloud|\baws\b|azure|\bgcp\b/.test(text)) add("Cloud Engineering", "DevOps");
  if (/mlops|model deploy|model serving/.test(text)) add("MLOps", "Machine Learning");
  if (/generative|\bgenai\b|\bllm\b|\brag\b|prompt/.test(text)) add("Generative AI", "Artificial Intelligence");
  if (/machine learning|\bml\b|data scientist|pytorch|tensorflow/.test(text)) add("Machine Learning", "Artificial Intelligence", "Data Science");
  if (/artificial intelligence|\bai\b/.test(text)) add("Artificial Intelligence");
  if (/data science|analytics/.test(text)) add("Data Science", "Machine Learning");
  if (/security|cyber|soc analyst/.test(text)) add("Cybersecurity");
  return [...categories];
}

function rankJobsForCandidate({
  prompt,
  resumeText,
  role,
  experience,
  location,
  workplace,
}: {
  prompt: string;
  resumeText: string;
  role?: string;
  experience?: string;
  location?: string;
  workplace?: string;
}) {
  const combined = `${prompt} ${resumeText.slice(0, 20_000)}`.toLowerCase();
  const roleConfig = guidedRoles.find((item) => item.label === role);
  const categories = roleConfig ? [...roleConfig.categories] : inferRoleCategories(combined);
  const experienceValue = Number(
    experience?.match(/\d/)?.[0] ?? combined.match(/\b([1-4])\s*(?:years?|yrs?)\b/)?.[1] ?? 0,
  );
  const inferredLocation =
    location?.toLowerCase() ??
    locationAliases.find((item) => combined.includes(item)) ??
    (combined.includes("remote") ? "remote worldwide" : "");
  const tokens = [
    ...new Set(
      combined
        .replace(/[^a-z0-9+#.]+/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2)
        .filter((token) => !["job", "jobs", "with", "years", "year", "experience", "looking", "want"].includes(token)),
    ),
  ].slice(0, 40);

  const ranked = JOBS.map((job) => {
    const haystack = `${job.title} ${job.companyName} ${job.categories.join(" ")} ${job.skills.join(" ")} ${job.locationText}`.toLowerCase();
    let score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 2 : 0), 0);
    if (categories.some((category) => job.categories.includes(category as Job["category"]))) score += 14;
    if (experienceValue && job.experienceMinimum <= experienceValue && job.experienceMaximum >= experienceValue) score += 9;
    if (inferredLocation) {
      const wantsIndia = inferredLocation === "india";
      const wantsRemote = inferredLocation.includes("remote");
      const locationMatch =
        (wantsIndia && job.regionType === "India") ||
        (wantsRemote && (job.workplaceType === "Remote" || job.regionType === "Remote worldwide")) ||
        job.locationText.toLowerCase().includes(inferredLocation.replace("bangalore", "bengaluru"));
      score += locationMatch ? 12 : -10;
    }
    if (workplace && workplace !== "Any arrangement") {
      score += job.workplaceType === workplace ? 8 : -8;
    }
    if (job.regionType === "India") score += 2;
    score += Math.max(0, 4 - job.daysAgo / 10);
    return { job, score };
  })
    .filter(({ job, score }) => {
      if (score <= 0) return false;
      if (categories.length && !categories.some((category) => job.categories.includes(category as Job["category"]))) return false;
      if (experienceValue && !(job.experienceMinimum <= experienceValue && job.experienceMaximum >= experienceValue)) return false;
      if (workplace && workplace !== "Any arrangement" && job.workplaceType !== workplace) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score || a.job.daysAgo - b.job.daysAgo);

  return ranked.slice(0, 4).map(({ job }) => job);
}

function AiJobMatcher() {
  const [mode, setMode] = useState<"prompt" | "guided">("prompt");
  const [prompt, setPrompt] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<Job[]>([]);
  const [searched, setSearched] = useState(false);

  const runPrompt = () => {
    setMatches(rankJobsForCandidate({ prompt, resumeText }));
    setSearched(true);
  };

  const chooseGuidedAnswer = (key: string, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < guidedQuestions.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    setMatches(
      rankJobsForCandidate({
        prompt: "",
        resumeText,
        role: next.role,
        experience: next.experience,
        location: next.location,
        workplace: next.workplace,
      }),
    );
    setSearched(true);
  };

  const resetGuided = () => {
    setStep(0);
    setAnswers({});
    setMatches([]);
    setSearched(false);
  };

  return (
    <section className="section ai-matcher-section">
      <div className="ai-matcher">
        <div className="ai-matcher-intro">
          <span className="eyebrow"><Sparkles size={15} /> JobOrbit Match</span>
          <h2>Describe the job you want. We’ll find the closest live roles.</h2>
          <p>Search naturally, add your resume for skill context, or use a guided four-question path. Matching runs against the verified JobOrbit catalogue.</p>
          <div className="matcher-trust">
            <span><ShieldCheck /> Resume processed in your browser</span>
            <span><Check /> Only active 1–4 year roles</span>
          </div>
        </div>
        <div className="ai-workspace">
          <div className="ai-mode-tabs" role="tablist" aria-label="Job matching mode">
            <button className={mode === "prompt" ? "active" : ""} onClick={() => setMode("prompt")}><Search /> Natural search</button>
            <button className={mode === "guided" ? "active" : ""} onClick={() => setMode("guided")}><ListFilter /> Guided mode</button>
          </div>
          {mode === "prompt" ? (
            <div className="ai-prompt-panel">
              <label>
                <span>What are you looking for?</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Example: DevOps jobs in Hyderabad for 2 years of experience"
                  rows={3}
                />
              </label>
              <div className="prompt-examples">
                {["DevOps · Hyderabad · 2 years", "Remote MLOps · 3 years", "AI engineer · Bengaluru · 1 year"].map((example) => (
                  <button key={example} onClick={() => setPrompt(example)}>{example}</button>
                ))}
              </div>
              <div className="ai-input-actions">
                <label className={`resume-upload ${resumeName ? "has-file" : ""}`}>
                  <Upload size={18} />
                  <span>{resumeName || "Add resume"}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setResumeName(file.name);
                      setResumeText((await file.text().catch(() => "")).slice(0, 20_000));
                    }}
                  />
                </label>
                <button className="button button-primary" onClick={runPrompt} disabled={!prompt.trim() && !resumeName}>
                  Find my jobs <ArrowRight size={17} />
                </button>
              </div>
            </div>
          ) : (
            <div className="guided-panel">
              <div className="guided-progress">
                <span>Question {Math.min(step + 1, guidedQuestions.length)} of {guidedQuestions.length}</span>
                <i><b style={{ width: `${((Math.min(step + 1, guidedQuestions.length)) / guidedQuestions.length) * 100}%` }} /></i>
              </div>
              {!searched ? (
                <>
                  <h3>{guidedQuestions[step].title}</h3>
                  <div className="guided-options">
                    {guidedQuestions[step].options.map((option) => (
                      <button key={option} onClick={() => chooseGuidedAnswer(guidedQuestions[step].key, option)}>
                        <span>{option}</span><ArrowRight size={17} />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button className="guided-reset" onClick={resetGuided}>Start again</button>
              )}
            </div>
          )}
          {searched && (
            <div className="ai-match-results" aria-live="polite">
              <div><b>{matches.length} strongest matches</b><span>Ranked by role, skills, experience, location and freshness</span></div>
              {matches.length ? matches.map((job) => (
                <AppLink href={`/jobs/${job.slug}`} key={job.id} className="ai-match-row">
                  <CompanyLogo job={job} size="small" />
                  <span><b>{job.title}</b><small>{job.companyName} · {job.locationText}</small></span>
                  <Tag tone="green">{job.experienceText}</Tag>
                  <ArrowRight size={17} />
                </AppLink>
              )) : <p className="matcher-empty">No exact live match yet. Try a nearby city, a broader role family, or “Remote worldwide”.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HomePage({ saved, toggleSaved }: { saved: Set<string>; toggleSaved: (id: string) => void }) {
  const featured = JOBS.slice(0, 6);
  const regions = [
    { title: "Jobs in India", copy: `${JOBS.filter((job) => job.regionType === "India").length} verified roles`, icon: <BriefcaseBusiness />, href: "/jobs/india", className: "india" },
    { title: "Jobs outside India", copy: `${JOBS.filter((job) => job.regionType === "Outside India").length} active roles`, icon: <Globe2 />, href: "/jobs/international", className: "world" },
    { title: "Remote worldwide", copy: `${JOBS.filter((job) => job.regionType === "Remote worldwide").length} active roles`, icon: <Cloud />, href: "/jobs/remote", className: "remote" },
    { title: "Experience 1–4 years", copy: "No senior-level roles", icon: <HeartHandshake />, href: "/jobs", className: "visa" },
  ];
  return (
    <main>
      <div className="home-shell">
        <FreshnessNotice />
        <Hero onChip={(value) => { window.location.href = routeHref(`/jobs?q=${encodeURIComponent(value)}`); }} />
      </div>
      <AiJobMatcher />
      <section className="section section-tight">
        <div className="section-heading">
          <div><span className="section-kicker">Explore faster</span><h2>Browse by category</h2></div>
          <AppLink href="/jobs" className="text-link">View all {JOBS.length} jobs <ArrowRight size={15} /></AppLink>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <AppLink href={`/categories/${category.slug}`} className="category-card" key={category.slug}>
              <span className="category-icon" style={{ "--category": category.accent } as React.CSSProperties}>{category.icon}</span>
              <span><b>{category.name}</b><small>{JOBS.filter((job) => job.categories.includes(category.name)).length} jobs · {category.description}</small></span>
              <ArrowRight size={16} />
            </AppLink>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div><span className="section-kicker">Curated for you</span><h2>Featured opportunities</h2></div>
          <AppLink href="/jobs" className="text-link">Browse all jobs <ArrowRight size={15} /></AppLink>
        </div>
        <div className="featured-grid">
          {featured.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              detailed
              isSaved={saved.has(job.id)}
              onSave={() => toggleSaved(job.id)}
              onSelect={() => { window.location.href = routeHref(`/jobs/${job.slug}`); }}
            />
          ))}
        </div>
      </section>
      <section className="section region-section">
        <div className="section-heading">
          <div><span className="section-kicker">Quick routes</span><h2>Choose where you want to work</h2></div>
        </div>
        <div className="region-grid">
          {regions.map((region) => (
            <AppLink key={region.title} href={region.href} className={`region-card ${region.className}`}>
              <span>{region.icon}</span>
              <div><b>{region.title}</b><small>{region.copy}</small></div>
              <ArrowRight size={18} />
            </AppLink>
          ))}
        </div>
      </section>
      <section className="section recent-section">
        <div className="recent-panel">
          <div className="section-heading">
            <div><span className="section-kicker">Fresh from the feed</span><h2>Recently added jobs</h2><p><RefreshCw size={14} /> Source refreshed {fetchedAtLabel} • Expired listings excluded</p></div>
            <AppLink href="/jobs?date=Today" className="text-link">See newest jobs <ArrowRight size={15} /></AppLink>
          </div>
          <div className="compact-job-list">
            {JOBS.slice(0, 4).map((job) => (
              <div key={job.id} className="compact-job">
                <CompanyLogo job={job} size="small" />
                <div><b>{job.title}</b><span>{job.companyName} · {job.locationText}</span></div>
                <Tag tone="blue">{postedLabel(job.daysAgo)}</Tag>
                <AppLink href={`/jobs/${job.slug}`} className="icon-button"><ArrowRight size={17} /></AppLink>
              </div>
            ))}
          </div>
        </div>
        <div className="alert-panel">
          <span className="alert-icon"><Bell /></span>
          <span className="section-kicker">Never miss a role</span>
          <h2>Get matched jobs in your inbox</h2>
          <p>Create a personalised alert for your role, stack, location and experience level.</p>
          <AppLink href="/job-alerts" className="button button-light">Create job alert <ArrowRight size={16} /></AppLink>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div><span className="section-kicker">Companies to watch</span><h2>Top hiring companies</h2></div>
          <AppLink href="/companies" className="text-link">View directory <ArrowRight size={15} /></AppLink>
        </div>
        <div className="company-grid">
          {COMPANIES.slice(0, 5).map((company) => (
            <AppLink href={`/companies/${company.id}`} className="company-card" key={company.id}>
              <CompanyMark name={company.name} initials={company.initials} logoUrl={company.logoUrl} accent={company.accent} size="large" />
              <b>{company.name}</b>
              <span>{company.industry}</span>
              <small>{company.activeJobs} active {company.activeJobs === 1 ? "job" : "jobs"}</small>
            </AppLink>
          ))}
        </div>
      </section>
    </main>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="filter-group">
      <h3>{title}<ChevronDown size={15} /></h3>
      <div className="filter-options">
        {options.map((option) => (
          <label key={option} className="filter-option">
            <input type="radio" name={title} checked={selected === option} onChange={() => onSelect(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FilterSidebar({
  query,
  setQuery,
  location,
  setLocation,
  region,
  setRegion,
  date,
  setDate,
  workplace,
  setWorkplace,
  skill,
  setSkill,
  experience,
  setExperience,
  company,
  setCompany,
  salaryOnly,
  setSalaryOnly,
  onReset,
  onClose,
}: {
  query: string;
  setQuery: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  workplace: string;
  setWorkplace: (value: string) => void;
  skill: string;
  setSkill: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  company: string;
  setCompany: (value: string) => void;
  salaryOnly: boolean;
  setSalaryOnly: (value: boolean) => void;
  onReset: () => void;
  onClose?: () => void;
}) {
  return (
    <aside className="filter-sidebar">
      <div className="filter-title">
        <b><ListFilter size={17} /> Filters</b>
        <button onClick={onReset}>Reset all</button>
        {onClose && <button className="mobile-filter-close" onClick={onClose}><X size={19} /></button>}
      </div>
      <div className="sidebar-search">
        <label>
          <span>Search jobs</span>
          <div><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, skill or company" /></div>
        </label>
        <label>
          <span>Location</span>
          <div><MapPin size={17} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or remote" /></div>
        </label>
      </div>
      <FilterGroup title="Region" options={FILTER_CONFIG.regions} selected={region} onSelect={setRegion} />
      <FilterGroup title="Date posted" options={FILTER_CONFIG.datePosted} selected={date} onSelect={setDate} />
      <FilterGroup title="Work arrangement" options={["Any arrangement", ...FILTER_CONFIG.workplace]} selected={workplace} onSelect={setWorkplace} />
      <div className="filter-group">
        <h3>Skills<ChevronDown size={15} /></h3>
        <select value={skill} onChange={(event) => setSkill(event.target.value)}>
          <option>Any skill</option>
          {FILTER_CONFIG.skills.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <h3>Minimum experience<ChevronDown size={15} /></h3>
        <select value={experience} onChange={(event) => setExperience(event.target.value)}>
          <option value="Any experience">Any within 1–4 years</option>
          {[1, 2, 3, 4].map((year) => <option key={year} value={String(year)}>Minimum {year} {year === 1 ? "year" : "years"}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <h3>Company<ChevronDown size={15} /></h3>
        <select value={company} onChange={(event) => setCompany(event.target.value)}>
          <option value="Any company">Any company</option>
          {COMPANIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <label className="switch-option">
        <input type="checkbox" checked={salaryOnly} onChange={(event) => setSalaryOnly(event.target.checked)} />
        <span /> Salary disclosed
      </label>
      {onClose && <button className="button button-primary apply-filters" onClick={onClose}>Show matching jobs</button>}
    </aside>
  );
}

function JobPreview({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) {
  return (
    <aside className="job-preview">
      <div className="preview-header">
        <CompanyLogo job={job} size="large" />
        <div><div className="badge-row"><Tag tone="green"><ShieldCheck size={10} /> Active source</Tag>{job.daysAgo === 0 && <Tag tone="blue">New</Tag>}</div><h2>{job.title}</h2><p>{job.companyName}</p></div>
      </div>
      <div className="job-meta preview-meta">
        <span><MapPin size={15} />{job.locationText}</span>
        <span><BriefcaseBusiness size={15} />{job.employmentType}</span>
        <span><Users size={15} />{job.experienceText}</span>
        <span><CircleDollarSign size={15} />{formatSalary(job)}</span>
      </div>
      <div className="preview-actions">
        <a className="button button-primary" href={job.applicationUrl} target="_blank" rel="noreferrer">Apply on source <ExternalLink size={16} /></a>
        <button className="button button-outline" onClick={onSave}><Bookmark size={16} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save job"}</button>
      </div>
      <div className="preview-scroll">
        <section><h3>About the role</h3><p>{job.description}</p></section>
        {job.responsibilities.length > 0 && <section><h3>Role highlights from source</h3><ul>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        <section><h3>Skills required</h3><div className="skill-row">{job.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div></section>
        <section className="source-box"><h3><ShieldCheck size={17} /> Source & freshness</h3><p>Imported from {job.sourceName}. The feed reported this listing as active, its expiry date is in the future, and the application button opens the source-provided URL.</p><span>Checked {new Date(job.lastVerifiedAt).toISOString().slice(0, 10)} · Expires {new Date(job.expiresAt).toISOString().slice(0, 10)}</span></section>
        <AppLink href={`/jobs/${job.slug}`} className="text-link">Open full job details <ArrowRight size={15} /></AppLink>
      </div>
    </aside>
  );
}

function JobsPage({
  initialRegion,
  categorySlug,
  saved,
  toggleSaved,
}: {
  initialRegion?: string;
  categorySlug?: string;
  saved: Set<string>;
  toggleSaved: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const category = CATEGORIES.find((item) => item.slug === categorySlug);
  const initialRegionParam = searchParams.get("region");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [region, setRegion] = useState(initialRegion ?? initialRegionParam ?? "Any location");
  const [date, setDate] = useState(searchParams.get("date") ?? "Any time");
  const [workplace, setWorkplace] = useState(searchParams.get("workplace") ?? "Any arrangement");
  const [skill, setSkill] = useState(searchParams.get("skill") ?? "Any skill");
  const [experience, setExperience] = useState(searchParams.get("experience") ?? "Any experience");
  const [company, setCompany] = useState(searchParams.get("company") ?? "Any company");
  const [salaryOnly, setSalaryOnly] = useState(searchParams.get("salary") === "true");
  const [sort, setSort] = useState("Most relevant");
  const [selectedId, setSelectedId] = useState(JOBS[0].id);
  const [limit, setLimit] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const items = JOBS.filter((job) => {
      const queryMatch = !query || `${job.title} ${job.companyName} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      const locationMatch = !location || job.locationText.toLowerCase().includes(location.toLowerCase());
      const regionMatch = region === "Any location" || job.regionType === region;
      const workplaceMatch = workplace === "Any arrangement" || job.workplaceType === workplace;
      const skillMatch = skill === "Any skill" || job.skills.includes(skill);
      const experienceMatch = experience === "Any experience" || job.experienceMinimum === Number(experience);
      const companyMatch = company === "Any company" || job.companyId === company;
      const salaryMatch = !salaryOnly || job.salaryDisclosed;
      const categoryMatch = !category || job.categories.includes(category.name);
      const dateMatch =
        date === "Any time" ||
        (date === "Today" && job.daysAgo === 0) ||
        (date === "Yesterday" && job.daysAgo === 1) ||
        (date === "Last 7 days" && job.daysAgo <= 7) ||
        (date === "Last 30 days" && job.daysAgo <= 30) ||
        (date === "Last 45 days" && job.daysAgo <= 45);
      return queryMatch && locationMatch && regionMatch && workplaceMatch && skillMatch && experienceMatch && companyMatch && salaryMatch && categoryMatch && dateMatch;
    });
    return [...items].sort((a, b) => {
      if (sort === "Newest") return a.daysAgo - b.daysAgo;
      if (sort === "Salary: high to low") return b.salaryMaximum - a.salaryMaximum;
      if (sort === "Salary: low to high") return a.salaryMinimum - b.salaryMinimum;
      return a.id.localeCompare(b.id);
    });
  }, [query, location, region, date, workplace, skill, experience, company, salaryOnly, category, sort]);
  const selected = filtered.find((job) => job.id === selectedId) ?? filtered[0] ?? JOBS[0];
  const activeFilters = [
    query && `Search: ${query}`,
    location && `Location: ${location}`,
    region !== "Any location" && region,
    date !== "Any time" && date,
    workplace !== "Any arrangement" && workplace,
    skill !== "Any skill" && skill,
    experience !== "Any experience" && `Minimum ${experience} ${experience === "1" ? "year" : "years"}`,
    company !== "Any company" && COMPANIES.find((item) => item.id === company)?.name,
    salaryOnly && "Salary disclosed",
  ].filter(Boolean);

  const resetFilters = () => {
    setQuery("");
    setLocation("");
    setRegion(initialRegion ?? "Any location");
    setDate("Any time");
    setWorkplace("Any arrangement");
    setSkill("Any skill");
    setExperience("Any experience");
    setCompany("Any company");
    setSalaryOnly(false);
  };

  const removeFilter = (label: string) => {
    if (label.startsWith("Search:")) setQuery("");
    else if (label.startsWith("Location:")) setLocation("");
    else if (label.startsWith("Minimum")) setExperience("Any experience");
    else if (label === "Salary disclosed") setSalaryOnly(false);
    else if (label === region) setRegion(initialRegion ?? "Any location");
    else if (label === date) setDate("Any time");
    else if (label === workplace) setWorkplace("Any arrangement");
    else if (label === skill) setSkill("Any skill");
    else setCompany("Any company");
  };

  return (
    <main className="jobs-page">
      <div className="jobs-mobile-controls">
        <button onClick={() => setFiltersOpen(true)}><Filter size={16} /> Filters {activeFilters.length > 0 && <b>{activeFilters.length}</b>}</button>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Most relevant</option><option>Newest</option><option>Salary: high to low</option><option>Salary: low to high</option>
        </select>
      </div>
      <div className="jobs-layout">
        <div className={`filter-drawer ${filtersOpen ? "open" : ""}`} onClick={(event) => event.currentTarget === event.target && setFiltersOpen(false)}>
          <FilterSidebar
            query={query} setQuery={setQuery} location={location} setLocation={setLocation}
            region={region} setRegion={setRegion} date={date} setDate={setDate}
            workplace={workplace} setWorkplace={setWorkplace} skill={skill} setSkill={setSkill}
            experience={experience} setExperience={setExperience}
            company={company} setCompany={setCompany}
            salaryOnly={salaryOnly} setSalaryOnly={setSalaryOnly}
            onReset={resetFilters}
            onClose={() => setFiltersOpen(false)}
          />
        </div>
        <section className="results-column">
          <div className="results-heading">
            <div>
              <span>{category ? category.name : "DevOps, platform & cloud opportunities"}</span>
              <h1>{filtered.length} active jobs found</h1>
            </div>
            <label className="desktop-sort">Sort by:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Most relevant</option><option>Newest</option><option>Salary: high to low</option><option>Salary: low to high</option>
              </select>
            </label>
          </div>
          {activeFilters.length > 0 && <div className="active-filters">{activeFilters.map((item) => <button key={String(item)} onClick={() => removeFilter(String(item))}>{item}<X size={12} /></button>)}</div>}
          <div className="result-list">
            {filtered.slice(0, limit).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={job.id === selected.id}
                isSaved={saved.has(job.id)}
                onSave={() => toggleSaved(job.id)}
                onSelect={() => setSelectedId(job.id)}
              />
            ))}
            {filtered.length === 0 && <div className="empty-state"><Search size={28} /><h3>No matching active jobs</h3><p>Try removing a filter or searching for a broader skill.</p></div>}
          </div>
          {limit < filtered.length && <button className="button load-more" onClick={() => setLimit((value) => value + 12)}>Load more jobs</button>}
        </section>
        {selected && <JobPreview job={selected} saved={saved.has(selected.id)} onSave={() => toggleSaved(selected.id)} />}
      </div>
    </main>
  );
}

function CategoryLandingPage({
  categorySlug,
  saved,
  toggleSaved,
}: {
  categorySlug?: string;
  saved: Set<string>;
  toggleSaved: (id: string) => void;
}) {
  const category = CATEGORIES.find((item) => item.slug === categorySlug) ?? CATEGORIES[0];
  const jobs = JOBS.filter((job) => job.categories.includes(category.name));
  const indiaCount = jobs.filter((job) => job.regionType === "India").length;
  const remoteCount = jobs.filter((job) => job.workplaceType === "Remote" || job.regionType === "Remote worldwide").length;
  const newestCount = jobs.filter((job) => job.daysAgo <= 7).length;
  const [limit, setLimit] = useState(24);
  return (
    <main className="category-page">
      <div className="page-shell">
        <AppLink href="/jobs" className="back-link"><ArrowLeft size={16} /> All jobs</AppLink>
        <section className="category-hero" style={{ "--category-accent": category.accent } as React.CSSProperties}>
          <span className="category-hero-icon">{category.icon}</span>
          <div>
            <span className="section-kicker">Role collection</span>
            <h1>{category.name} jobs</h1>
            <p>{category.description}. Every role is active, was published within 45 days, and asks for a minimum of 1–4 years of experience.</p>
          </div>
          <AppLink href={`/jobs?q=${encodeURIComponent(category.name)}`} className="button button-primary">Search with filters <ListFilter size={17} /></AppLink>
        </section>
        <div className="category-metrics">
          <div><b>{jobs.length}</b><span>verified openings</span></div>
          <div><b>{indiaCount}</b><span>India roles</span></div>
          <div><b>{remoteCount}</b><span>remote options</span></div>
          <div><b>{newestCount}</b><span>added this week</span></div>
        </div>
        <section className="category-results">
          <div className="section-heading">
            <div><span className="section-kicker">Current openings</span><h2>Explore {category.name}</h2></div>
            <span className="category-result-count">Showing {Math.min(limit, jobs.length)} of {jobs.length}</span>
          </div>
          <div className="category-job-grid">
            {jobs.slice(0, limit).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                detailed
                isSaved={saved.has(job.id)}
                onSave={() => toggleSaved(job.id)}
                onSelect={() => { window.location.href = routeHref(`/jobs/${job.slug}`); }}
              />
            ))}
          </div>
          {limit < jobs.length && <button className="button load-more" onClick={() => setLimit((value) => value + 24)}>Load 24 more jobs</button>}
        </section>
        <section className="category-related">
          <div className="section-heading"><div><span className="section-kicker">Related paths</span><h2>Explore other categories</h2></div></div>
          <div className="track-grid">
            {CATEGORIES.filter((item) => item.slug !== category.slug).slice(0, 4).map((item) => (
              <AppLink href={`/categories/${item.slug}`} key={item.slug}>
                <span style={{ "--category": item.accent } as React.CSSProperties}>{item.icon}</span>
                <div><b>{item.name}</b><small>{JOBS.filter((job) => job.categories.includes(item.name)).length} verified jobs</small></div>
                <ArrowRight size={16} />
              </AppLink>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FullJobPage({ job, saved, toggleSaved }: { job: Job; saved: boolean; toggleSaved: () => void }) {
  return (
    <main className="detail-page">
      <div className="page-shell">
        <AppLink href="/jobs" className="back-link"><ArrowLeft size={16} /> Back to all jobs</AppLink>
        <FreshnessNotice />
        <div className="detail-grid">
          <article className="detail-main">
            <header className="detail-hero">
              <CompanyLogo job={job} size="large" />
              <div><div className="badge-row"><Tag tone="green"><ShieldCheck size={10} /> Active source</Tag><Tag tone="blue">{job.category}</Tag></div><h1>{job.title}</h1><p>{job.companyName}</p></div>
              <button className="icon-button" onClick={toggleSaved}><Bookmark fill={saved ? "currentColor" : "none"} /></button>
            </header>
            <div className="job-meta detail-meta">
              <span><MapPin />{job.locationText}</span><span><BriefcaseBusiness />{job.workplaceType} · {job.employmentType}</span><span><Users />{job.experienceText}</span><span><CircleDollarSign />{formatSalary(job)}</span>
            </div>
            <section><h2>Job overview</h2><p>{job.description}</p></section>
            {job.responsibilities.length > 0 && <section><h2>Role highlights from the source</h2><ul>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            {job.qualifications.length > 0 && <section><h2>Required qualifications</h2><ul>{job.qualifications.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            {job.preferredQualifications.length > 0 && <section><h2>Preferred qualifications</h2><ul>{job.preferredQualifications.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            <section><h2>Skills</h2><div className="skill-row">{job.skills.map((item) => <Tag key={item}>{item}</Tag>)}</div></section>
            <section><h2>Listing freshness</h2><div className="benefit-grid"><span><Check /> Published {new Date(job.publishedAt).toISOString().slice(0, 10)}</span><span><Check /> Expires {new Date(job.expiresAt).toISOString().slice(0, 10)}</span><span><Check /> Active at last source check</span><span><Check /> Direct source application link</span></div></section>
          </article>
          <aside className="detail-aside">
            <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="button button-primary button-block">Apply on original source <ExternalLink size={17} /></a>
            <button className="button button-outline button-block" onClick={toggleSaved}><Bookmark size={17} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save this job"}</button>
            <div className="trust-card">
              <h3><ShieldCheck /> Source information</h3>
              <dl><dt>Listing status</dt><dd>Active</dd><dt>Source</dt><dd>{job.sourceName}</dd><dt>Published</dt><dd>{postedLabel(job.daysAgo)}</dd><dt>Expires</dt><dd>{new Date(job.expiresAt).toISOString().slice(0, 10)}</dd></dl>
              <a href={job.sourceUrl} target="_blank" rel="noreferrer">Open original source <ExternalLink size={14} /></a>
              <button>Report expired job</button>
            </div>
            <div className="aside-company">
              <CompanyLogo job={job} />
              <h3>{job.companyName}</h3>
              <p>{getCompanyById(job.companyId)?.industry}</p>
              <AppLink href={`/companies/${job.companyId}`} className="text-link">View company profile <ArrowRight size={14} /></AppLink>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function CompaniesPage() {
  return (
    <main className="directory-page">
      <div className="page-shell">
        <div className="page-title"><span className="eyebrow"><Building2 size={14} /> Company directory</span><h1>Discover teams hiring now</h1><p>Companies are derived from active jobs in the latest source refresh.</p></div>
        <FreshnessNotice />
        <div className="company-directory-grid">
          {COMPANIES.map((company) => (
            <AppLink href={`/companies/${company.id}`} key={company.id} className="directory-company-card">
              <CompanyMark name={company.name} initials={company.initials} logoUrl={company.logoUrl} accent={company.accent} size="large" />
              <div><h2>{company.name}</h2><p>{company.industry}</p></div>
              <span><MapPin size={15} />{company.headquarters}</span>
              <span><Users size={15} />{company.size}</span>
              <b>{company.activeJobs} active {company.activeJobs === 1 ? "job" : "jobs"}</b>
              <ArrowRight size={18} />
            </AppLink>
          ))}
        </div>
      </div>
    </main>
  );
}

function CompanyPage({ id }: { id: string }) {
  const company = getCompanyById(id) ?? COMPANIES[0];
  const jobs = JOBS.filter((job) => job.companyId === company.id);
  return (
    <main className="company-profile-page">
      <div className="page-shell">
        <AppLink href="/companies" className="back-link"><ArrowLeft size={16} /> All companies</AppLink>
        <div className="company-profile-hero">
          <CompanyMark name={company.name} initials={company.initials} logoUrl={company.logoUrl} accent={company.accent} size="large" />
          <div><Tag tone="green">Actively hiring</Tag><h1>{company.name}</h1><p>{company.industry} · {company.headquarters}</p></div>
          <button className="button button-primary"><Bell size={16} /> Follow company</button>
        </div>
        <div className="company-profile-grid">
          <article className="company-about">
            <h2>About {company.name}</h2><p>{company.description}</p>
            <h2>Technology stack</h2><div className="skill-row">{company.technologies.map((tech) => <Tag key={tech}>{tech}</Tag>)}</div>
            <h2>Work policy</h2><p>{company.remotePolicy}. Confirm location eligibility on the original posting before applying.</p>
          </article>
          <aside className="company-facts"><h3>Company details</h3><dl><dt>Headquarters</dt><dd>{company.headquarters}</dd><dt>Company size</dt><dd>{company.size}</dd><dt>Industry</dt><dd>{company.industry}</dd><dt>Visa sponsorship</dt><dd>Role dependent</dd></dl></aside>
        </div>
        <section className="company-openings"><div className="section-heading"><div><span className="section-kicker">Openings</span><h2>{jobs.length} active jobs</h2></div></div><div className="featured-grid">{jobs.slice(0, 6).map((job) => <JobCard key={job.id} job={job} detailed isSaved={false} onSave={() => {}} onSelect={() => { window.location.href = routeHref(`/jobs/${job.slug}`); }} />)}</div></section>
      </div>
    </main>
  );
}

function SavedJobsPage({ saved, toggleSaved }: { saved: Set<string>; toggleSaved: (id: string) => void }) {
  const jobs = JOBS.filter((job) => saved.has(job.id));
  return (
    <main className="saved-page">
      <div className="page-shell">
        <div className="page-title"><span className="eyebrow"><Bookmark size={14} /> Your shortlist</span><h1>Saved jobs</h1><p>Bookmarks are stored on this device for the prototype.</p></div>
        {jobs.length ? <div className="featured-grid">{jobs.map((job) => <JobCard key={job.id} job={job} detailed isSaved onSave={() => toggleSaved(job.id)} onSelect={() => { window.location.href = routeHref(`/jobs/${job.slug}`); }} />)}</div> : <div className="empty-state large"><Bookmark size={34} /><h2>No saved jobs yet</h2><p>Save interesting roles while you browse and they will appear here.</p><AppLink href="/jobs" className="button button-primary">Browse jobs</AppLink></div>}
      </div>
    </main>
  );
}

function AlertPage() {
  const [created, setCreated] = useState(false);
  return (
    <main className="alert-page">
      <div className="page-shell alert-layout">
        <div className="alert-copy">
          <span className="eyebrow"><Bell size={14} /> Personalised job alerts</span>
          <h1>Let the right opportunities find you</h1>
          <p>Choose the role, stack and location that matter to you. This prototype saves the alert only for the current session.</p>
          <div className="alert-benefits"><span><Check /> Matching based on your stack</span><span><Check /> India and worldwide regions</span><span><Check /> Daily or weekly delivery</span></div>
        </div>
        <form className="alert-form" onSubmit={(event) => { event.preventDefault(); setCreated(true); }}>
          {created ? <div className="success-state"><span><Check /></span><h2>Alert created</h2><p>Your alert preferences are ready for email delivery integration.</p><button type="button" className="button button-outline" onClick={() => setCreated(false)}>Create another</button></div> : <>
            <h2>Create your alert</h2>
            <label>Job role<input required placeholder="e.g. DevOps Engineer" /></label>
            <label>Skills<input required placeholder="AWS, Kubernetes, Terraform" /></label>
            <div className="form-row"><label>Preferred location<input placeholder="Bengaluru or Remote" /></label><label>Region<select><option>India</option><option>Outside India</option><option>Remote worldwide</option></select></label></div>
            <div className="form-row"><label>Experience<select>{FILTER_CONFIG.experience.map((value) => <option key={value}>{value}</option>)}</select></label><label>Frequency<select><option>Daily</option><option>Weekly</option></select></label></div>
            <label>Email address<input required type="email" placeholder="you@example.com" /></label>
            <label className="check-line"><input type="checkbox" /> Include remote opportunities</label>
            <button className="button button-primary button-block">Create job alert <Send size={16} /></button>
          </>}
        </form>
      </div>
    </main>
  );
}

function SalaryInsightsPage() {
  const salaryJobs = JOBS.filter((job) => job.salaryDisclosed);
  const currencies = [...new Set(salaryJobs.map((job) => job.salaryCurrency))];
  const fx = JOB_DATA_META.exchangeRates;
  return (
    <main className="insights-page">
      <div className="page-shell">
        <section className="insights-hero">
          <div>
            <span className="eyebrow"><BarChart3 size={14} /> Salary insights in Indian rupees</span>
            <h1>Compare published pay in ₹ INR</h1>
            <p>Every range is converted to Indian rupees for quick comparison while the original source currency remains visible. Missing salaries are never estimated.</p>
          </div>
          <div className="insights-hero-card">
            <CircleDollarSign />
            <b>₹ INR</b>
            <span>{salaryJobs.length} current salary ranges</span>
            <small>FX reference date {fx.date}</small>
          </div>
        </section>
        <div className="insight-stat-grid">
          <div><BriefcaseBusiness /><b>{JOBS.length}</b><span>eligible active jobs</span></div>
          <div><CircleDollarSign /><b>{salaryJobs.length}</b><span>salary-disclosed roles</span></div>
          <div><Globe2 /><b>{currencies.length}</b><span>source currencies converted</span></div>
          <div><CalendarDays /><b>45 days</b><span>maximum listing age</span></div>
        </div>
        <section className="salary-section">
          <div className="section-heading">
            <div><span className="section-kicker">Live compensation data</span><h2>Published ranges converted to INR</h2><p>Open the source listing to confirm location, tax treatment, equity and benefits.</p></div>
            <AppLink href="/jobs?salary=true" className="text-link">Filter salary jobs <ArrowRight size={15} /></AppLink>
          </div>
          {salaryJobs.length > 0 ? (
            <div className="salary-role-list">
              {salaryJobs.map((job) => (
                <AppLink href={`/jobs/${job.slug}`} className="salary-role" key={job.id}>
                  <CompanyLogo job={job} />
                  <div><b>{job.title}</b><span>{job.companyName} · {job.locationText}</span></div>
                  <strong>{formatSalaryInInr(job)}</strong>
                  <small>Original: {formatSalary(job)} · {job.salaryPeriod}</small>
                  <ArrowRight size={17} />
                </AppLink>
              ))}
            </div>
          ) : <div className="empty-state"><CircleDollarSign /><h3>No current source has disclosed salary</h3><p>Listings will appear here automatically after the next source refresh.</p></div>}
          <p className="fx-note">
            Indicative conversion using {fx.source} reference rates dated {fx.date}.{" "}
            <a href={fx.sourceUrl} target="_blank" rel="noreferrer">View exchange-rate source <ExternalLink size={12} /></a>
          </p>
        </section>
        <section className="salary-guide">
          <div><TrendingUp /><h3>Use INR as a reference</h3><p>Conversion makes international ranges easier to scan, but it does not represent India-localized pay or take-home salary.</p></div>
          <div><Target /><h3>Ask for the full range</h3><p>Confirm base salary, bonus, equity, benefits, review cycle and whether the published range changes by location.</p></div>
          <div><ShieldCheck /><h3>Verify at the source</h3><p>JobOrbit displays source-provided values without estimating missing compensation.</p></div>
        </section>
      </div>
    </main>
  );
}

function CareerResourcesPage() {
  const roadmap = [
    ["Week 1", "Position your profile", "Choose one target role, rewrite your summary around outcomes, and make your 1–4 years of experience easy to verify."],
    ["Week 2", "Build proof of work", "Publish one focused project with architecture, automation, monitoring, trade-offs and a concise README."],
    ["Week 3", "Prepare interviews", "Practice troubleshooting, Linux, networking, cloud, CI/CD and one system-design story from your own work."],
    ["Week 4", "Apply with focus", "Shortlist fresh roles, tailor the top third of your resume, and track follow-ups instead of mass applying."],
  ];
  const checklists: Array<[string, string[]]> = [
    ["Resume", ["Lead with measurable impact", "Match skills to the role", "Keep dates and titles factual", "Link relevant projects"]],
    ["Portfolio", ["Show a deployment path", "Document reliability choices", "Include monitoring evidence", "Explain one failure and fix"]],
    ["Interview", ["Prepare a 90-second introduction", "Use STAR for incident stories", "Review core commands", "Bring questions for the team"]],
  ];
  const roleResources = [
    {
      role: "DevOps & SRE",
      copy: "Linux, delivery pipelines, reliability and production troubleshooting.",
      resources: [
        ["roadmap.sh DevOps", "Role roadmap", "https://roadmap.sh/devops"],
        ["Prepare.sh DevOps", "Interview practice", "https://prepare.sh/interviews/devops"],
        ["Kubernetes Basics", "Hands-on tutorial", "https://kubernetes.io/docs/tutorials/kubernetes-basics/"],
      ],
    },
    {
      role: "AI & Machine Learning",
      copy: "Applied AI foundations, model development and practical learning paths.",
      resources: [
        ["roadmap.sh AI Engineer", "Role roadmap", "https://roadmap.sh/ai-engineer"],
        ["Google ML Crash Course", "Free course", "https://developers.google.com/machine-learning/crash-course"],
        ["Hugging Face Learn", "Open courses", "https://huggingface.co/learn"],
      ],
    },
    {
      role: "MLOps & Platform",
      copy: "Model delivery, reproducibility, platform workflows and cloud-native operations.",
      resources: [
        ["roadmap.sh MLOps", "Role roadmap", "https://roadmap.sh/mlops"],
        ["MLOps Zoomcamp", "Open course", "https://github.com/DataTalksClub/mlops-zoomcamp"],
        ["CNCF Glossary", "Concept reference", "https://glossary.cncf.io/"],
      ],
    },
    {
      role: "Cloud Engineering",
      copy: "Cloud fundamentals, infrastructure design and practical environments.",
      resources: [
        ["Prepare.sh Workspaces", "Hands-on labs", "https://prepare.sh/workspaces"],
        ["AWS Skill Builder", "Cloud learning", "https://skillbuilder.aws/"],
        ["Microsoft Learn Azure", "Cloud learning", "https://learn.microsoft.com/training/azure/"],
      ],
    },
    {
      role: "Data Science",
      copy: "Python, data analysis, statistics and machine-learning practice.",
      resources: [
        ["Kaggle Learn", "Micro-courses", "https://www.kaggle.com/learn"],
        ["scikit-learn Examples", "Practical reference", "https://scikit-learn.org/stable/auto_examples/index.html"],
        ["Prepare.sh Quickstart", "Guided practice", "https://prepare.sh/quickstart"],
      ],
    },
    {
      role: "Cybersecurity",
      copy: "Security foundations, web exploitation labs and defensive thinking.",
      resources: [
        ["roadmap.sh Cyber Security", "Role roadmap", "https://roadmap.sh/cyber-security"],
        ["PortSwigger Academy", "Free hands-on labs", "https://portswigger.net/web-security"],
        ["OWASP Top 10", "Security reference", "https://owasp.org/www-project-top-ten/"],
      ],
    },
  ];
  return (
    <main className="resources-page">
      <div className="page-shell">
        <section className="resource-section">
          <div className="section-heading"><div><span className="section-kicker">30-day plan</span><h2>A focused path from profile to interview</h2></div></div>
          <div className="roadmap-grid">
            {roadmap.map(([week, title, copy], index) => (
              <article key={week}><span>{index + 1}</span><small>{week}</small><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
        </section>
        <section className="resource-section">
          <div className="section-heading"><div><span className="section-kicker">Application toolkit</span><h2>Use these checks before you apply</h2></div></div>
          <div className="checklist-grid">
            {checklists.map(([title, items], index) => {
              const Icon = [FileText, Sparkles, Target][index];
              return <article key={title}><Icon /><h3>{title}</h3><ul>{items.map((item) => <li key={item}><Check />{item}</li>)}</ul></article>;
            })}
          </div>
        </section>
        <section className="resource-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Public learning library</span>
              <h2>Role-wise roadmaps, courses and practice</h2>
              <p>Curated public resources open on their original websites. Availability and free-tier limits are controlled by each provider.</p>
            </div>
          </div>
          <div className="public-resource-grid">
            {roleResources.map(({ role, copy, resources }) => (
              <article className="public-resource-card" key={role}>
                <div><BookOpen /><span>Learning track</span></div>
                <h3>{role}</h3>
                <p>{copy}</p>
                <ul>
                  {resources.map(([name, type, url]) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer">
                        <span><b>{name}</b><small>{type}</small></span>
                        <ExternalLink size={15} />
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section className="resource-section">
          <div className="section-heading"><div><span className="section-kicker">Live demand</span><h2>Choose a role track</h2><p>Counts below come from the current eligible catalogue.</p></div></div>
          <div className="track-grid">
            {CATEGORIES.map((category) => {
              const count = JOBS.filter((job) => job.categories.includes(category.name)).length;
              return (
                <AppLink href={`/categories/${category.slug}`} key={category.slug}>
                  <span style={{ "--category": category.accent } as React.CSSProperties}>{category.icon}</span>
                  <div><b>{category.name}</b><small>{count} current {count === 1 ? "role" : "roles"}</small></div>
                  <ArrowRight size={16} />
                </AppLink>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminPage() {
  const sourceCount = JOB_DATA_META.sources.length;
  const categoryMetrics = CATEGORIES.map((category) => ({
    label: category.name,
    value: JOBS.filter((job) => job.categories.includes(category.name)).length,
  })).sort((a, b) => b.value - a.value);
  const largestCategory = Math.max(...categoryMetrics.map((item) => item.value), 1);
  const metrics = [
    ["Total jobs", String(JOBS.length), BriefcaseBusiness, "Current catalogue"],
    ["Active jobs", String(JOBS.length), Zap, "Expired excluded"],
    ["Added today", String(JOBS.filter((job) => job.daysAgo === 0).length), Sparkles, "Fresh source records"],
    ["Experience scope", "1–4 yrs", ShieldCheck, "Senior roles excluded"],
    ["Unique sources", String(sourceCount), Link2, "Public job feeds"],
    ["Sources", String(sourceCount), Globe2, "ATS and aggregator APIs"],
  ] as const;
  return (
    <main className="admin-page">
      <div className="admin-shell">
        <aside className="admin-nav">
          <AppLink href="/" className="brand"><Logo /><span>JobOrbit <b>AI</b></span></AppLink>
          <nav><a className="active"><LayoutDashboard />Overview</a><a><BriefcaseBusiness />Jobs</a><a><Building2 />Companies</a><a><Globe2 />Sources</a><a><RefreshCw />Imports</a></nav>
          <span>Catalogue operations</span>
        </aside>
        <section className="admin-content">
          <div className="admin-heading"><div><span>Monday, 27 July</span><h1>Job operations overview</h1><p>Monitor the quality and freshness of your aggregated job catalogue.</p></div><button className="button button-primary"><RefreshCw size={16} /> Trigger refresh</button></div>
          <FreshnessNotice />
          <div className="metric-grid">{metrics.map(([label, value, Icon, note]) => <div className="metric-card" key={label}><span><Icon /></span><small>{label}</small><b>{value}</b><em>{note}</em></div>)}</div>
          <div className="admin-grid">
            <div className="admin-panel"><div className="panel-heading"><h2>Jobs by category</h2><button>View report</button></div>{categoryMetrics.map(({ label, value }) => <div className="bar-row" key={label}><span>{label}</span><div><i style={{ width: `${Math.round((value / largestCategory) * 100)}%` }} /></div><b>{value}</b></div>)}</div>
            <div className="admin-panel"><div className="panel-heading"><h2>Source health</h2><button>Manage</button></div><div className="source-health"><span className="company-logo company-logo-medium" style={{ "--logo": "#4f46e5" } as React.CSSProperties}>{sourceCount}</span><div><b>Public job source network</b><small>{JOB_DATA_META.sources.map((source) => source.name).join(", ")} · refreshed {fetchedAtLabel}</small></div><Tag tone="green">Healthy</Tag></div><div className="admin-empty"><RefreshCw /><p>{JOBS.length} current jobs passed publication-date, expiry-date and URL validation.</p></div></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PlaceholderPage({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <main className="placeholder-page"><div className="empty-state large"><span className="placeholder-icon">{icon}</span><h1>{title}</h1><p>This screen is prepared for the next integration phase. The live job catalogue is already available.</p><AppLink href="/jobs" className="button button-primary">Explore active jobs</AppLink></div></main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div><span className="brand"><Logo /><span>JobOrbit <b>AI</b></span></span><p>Discover current AI, DevOps and MLOps opportunities worldwide.</p><Tag tone="green">Live jobs</Tag></div>
        <div><b>Discover</b><AppLink href="/jobs">All jobs</AppLink><AppLink href="/jobs/india">India jobs</AppLink><AppLink href="/jobs/remote">Remote jobs</AppLink></div>
        <div><b>For talent</b><AppLink href="/saved-jobs">Saved jobs</AppLink><AppLink href="/job-alerts">Job alerts</AppLink><AppLink href="/companies">Companies</AppLink></div>
        <div><b>Platform</b><AppLink href="/post-job">Post a job</AppLink><AppLink href="/admin">Admin</AppLink><a href="https://github.com/shivam2003-dev/joborbit-ai" target="_blank" rel="noreferrer">GitHub</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 JobOrbit AI.</span><span>Jobs sourced from public Greenhouse, Lever, Ashby and Himalayas feeds • Updated daily • Expired listings excluded</span></div>
    </footer>
  );
}

export default function JobOrbitApp({ route = [] }: { route?: string[] }) {
  const path = route;
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [dark, setDark] = useState(false);
  const toggleSaved = (id: string) => setSaved((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleTheme = () => {
    setDark((current) => {
      const next = !current;
      document.documentElement.dataset.theme = next ? "dark" : "light";
      return next;
    });
  };

  let content: React.ReactNode;
  const root = path[0] ?? "";
  if (!root) {
    content = <HomePage saved={saved} toggleSaved={toggleSaved} />;
  } else if (root === "jobs" && path[1] && !["india", "international", "remote"].includes(path[1])) {
    const job = getJobBySlug(path[1]) ?? JOBS[0];
    content = <FullJobPage job={job} saved={saved.has(job.id)} toggleSaved={() => toggleSaved(job.id)} />;
  } else if (root === "jobs") {
    const region = path[1] === "india" ? "India" : path[1] === "international" ? "Outside India" : path[1] === "remote" ? "Remote worldwide" : undefined;
    content = <JobsPage initialRegion={region} saved={saved} toggleSaved={toggleSaved} />;
  } else if (root === "categories") {
    content = <CategoryLandingPage categorySlug={path[1]} saved={saved} toggleSaved={toggleSaved} />;
  } else if (root === "companies" && path[1]) {
    content = <CompanyPage id={path[1]} />;
  } else if (root === "companies") {
    content = <CompaniesPage />;
  } else if (root === "saved-jobs") {
    content = <SavedJobsPage saved={saved} toggleSaved={toggleSaved} />;
  } else if (root === "job-alerts") {
    content = <AlertPage />;
  } else if (root === "admin") {
    return <AdminPage />;
  } else if (root === "post-job") {
    content = <PlaceholderPage title="Post a job" icon={<BriefcaseBusiness />} />;
  } else if (root === "salary-insights") {
    content = <SalaryInsightsPage />;
  } else if (root === "career-resources") {
    content = <CareerResourcesPage />;
  } else {
    content = <PlaceholderPage title="Page not found" icon={<Search />} />;
  }

  return (
    <div className="app">
      <Header savedCount={saved.size} dark={dark} onToggleTheme={toggleTheme} />
      {content}
      <Footer />
    </div>
  );
}
