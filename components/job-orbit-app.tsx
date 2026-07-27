"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Cloud,
  ExternalLink,
  Filter,
  Flag,
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
  Users,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState, type AnchorHTMLAttributes } from "react";
import {
  CATEGORIES,
  COMPANIES,
  FILTER_CONFIG,
  JOBS,
  formatSalary,
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

function DemoNotice() {
  return (
    <div className="demo-notice">
      <ShieldCheck size={15} />
      <span><b>Prototype dataset:</b> 100 fictional roles for testing the experience. Connect a live feed before accepting applications.</span>
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
    <span className={`company-logo company-logo-${size}`} style={{ "--logo": company?.accent ?? "#4f46e5" } as React.CSSProperties}>
      {job.companyLogo}
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
            <Tag tone="violet">Sample data</Tag>
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
        <p>Discover frequently updated opportunities from leading technology companies across India and worldwide.</p>
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

function HomePage({ saved, toggleSaved }: { saved: Set<string>; toggleSaved: (id: string) => void }) {
  const featured = JOBS.filter((job) => job.isFeatured);
  const regions = [
    { title: "Jobs in India", copy: "50 sample roles", icon: <Flag />, href: "/jobs/india", className: "india" },
    { title: "Jobs outside India", copy: "40 sample roles", icon: <Globe2 />, href: "/jobs/international", className: "world" },
    { title: "Remote worldwide", copy: "10 sample roles", icon: <Cloud />, href: "/jobs/remote", className: "remote" },
    { title: "Visa sponsorship", copy: "Explore eligible roles", icon: <HeartHandshake />, href: "/jobs?visa=true", className: "visa" },
  ];
  return (
    <main>
      <div className="home-shell">
        <DemoNotice />
        <Hero onChip={(value) => { window.location.href = routeHref(`/jobs?q=${encodeURIComponent(value)}`); }} />
      </div>
      <section className="section section-tight">
        <div className="section-heading">
          <div><span className="section-kicker">Explore faster</span><h2>Browse by category</h2></div>
          <AppLink href="/jobs" className="text-link">View all 100 jobs <ArrowRight size={15} /></AppLink>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <AppLink href={`/categories/${category.slug}`} className="category-card" key={category.slug}>
              <span className="category-icon" style={{ "--category": category.accent } as React.CSSProperties}>{category.icon}</span>
              <span><b>{category.name}</b><small>{category.description}</small></span>
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
            <div><span className="section-kicker">Fresh from the feed</span><h2>Recently added sample jobs</h2><p><RefreshCw size={14} /> Last refreshed today • Ready for an automated source</p></div>
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
          {COMPANIES.slice(0, 5).map((company, index) => (
            <AppLink href={`/companies/${company.id}`} className="company-card" key={company.id}>
              <span className="company-logo company-logo-large" style={{ "--logo": company.accent } as React.CSSProperties}>{company.initials}</span>
              <b>{company.name}</b>
              <span>{company.industry}</span>
              <small>{10 - (index % 4)} active sample jobs</small>
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
  region,
  setRegion,
  date,
  setDate,
  workplace,
  setWorkplace,
  skill,
  setSkill,
  onClose,
}: {
  region: string;
  setRegion: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  workplace: string;
  setWorkplace: (value: string) => void;
  skill: string;
  setSkill: (value: string) => void;
  onClose?: () => void;
}) {
  const clear = () => {
    setRegion("Any location");
    setDate("Any time");
    setWorkplace("Any arrangement");
    setSkill("Any skill");
  };
  return (
    <aside className="filter-sidebar">
      <div className="filter-title">
        <b><ListFilter size={17} /> Filters</b>
        <button onClick={clear}>Reset</button>
        {onClose && <button className="mobile-filter-close" onClick={onClose}><X size={19} /></button>}
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
      <div className="filter-group collapsed"><h3>Experience level<ChevronDown size={15} /></h3></div>
      <div className="filter-group collapsed"><h3>Salary range<ChevronDown size={15} /></h3></div>
      <div className="filter-group collapsed"><h3>Company & industry<ChevronDown size={15} /></h3></div>
      <label className="switch-option"><input type="checkbox" /><span /> Sample jobs with salary</label>
      <label className="switch-option"><input type="checkbox" /><span /> Visa sponsorship</label>
      {onClose && <button className="button button-primary apply-filters" onClick={onClose}>Show matching jobs</button>}
    </aside>
  );
}

function JobPreview({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) {
  return (
    <aside className="job-preview">
      <div className="preview-header">
        <CompanyLogo job={job} size="large" />
        <div><div className="badge-row"><Tag tone="violet">Sample data</Tag>{job.daysAgo === 0 && <Tag tone="blue">New</Tag>}</div><h2>{job.title}</h2><p>{job.companyName}</p></div>
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
        <section><h3>Key responsibilities</h3><ul>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3>Skills required</h3><div className="skill-row">{job.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div></section>
        <section className="source-box"><h3><ShieldCheck size={17} /> Source & trust</h3><p>This is fictional demonstration data. The application button opens example.com and does not submit an application.</p><span>Last checked today</span></section>
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
  const category = CATEGORIES.find((item) => item.slug === categorySlug);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(initialRegion ?? "Any location");
  const [date, setDate] = useState("Any time");
  const [workplace, setWorkplace] = useState("Any arrangement");
  const [skill, setSkill] = useState("Any skill");
  const [sort, setSort] = useState("Most relevant");
  const [selectedId, setSelectedId] = useState(JOBS[0].id);
  const [limit, setLimit] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const items = JOBS.filter((job) => {
      const queryMatch = !query || `${job.title} ${job.companyName} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      const regionMatch = region === "Any location" || job.regionType === region;
      const workplaceMatch = workplace === "Any arrangement" || job.workplaceType === workplace;
      const skillMatch = skill === "Any skill" || job.skills.includes(skill);
      const categoryMatch = !category || job.category === category.name;
      const dateMatch =
        date === "Any time" ||
        (date === "Today" && job.daysAgo === 0) ||
        (date === "Yesterday" && job.daysAgo === 1) ||
        (date === "Last 7 days" && job.daysAgo <= 7) ||
        (date === "Last 30 days" && job.daysAgo <= 30);
      return queryMatch && regionMatch && workplaceMatch && skillMatch && categoryMatch && dateMatch;
    });
    return [...items].sort((a, b) => {
      if (sort === "Newest") return a.daysAgo - b.daysAgo;
      if (sort === "Salary: high to low") return b.salaryMaximum - a.salaryMaximum;
      if (sort === "Salary: low to high") return a.salaryMinimum - b.salaryMinimum;
      return a.id.localeCompare(b.id);
    });
  }, [query, region, date, workplace, skill, category, sort]);
  const selected = filtered.find((job) => job.id === selectedId) ?? filtered[0] ?? JOBS[0];
  const activeFilters = [region !== "Any location" && region, date !== "Any time" && date, workplace !== "Any arrangement" && workplace, skill !== "Any skill" && skill].filter(Boolean);

  return (
    <main className="jobs-page">
      <div className="jobs-search-strip">
        <div className="jobs-search-inner">
          <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, skill or company" /></label>
          <label className="desktop-only"><MapPin size={17} /><input placeholder="City or location" /></label>
          <button className="button button-primary">Search</button>
        </div>
      </div>
      <DemoNotice />
      <div className="jobs-mobile-controls">
        <button onClick={() => setFiltersOpen(true)}><Filter size={16} /> Filters {activeFilters.length > 0 && <b>{activeFilters.length}</b>}</button>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Most relevant</option><option>Newest</option><option>Salary: high to low</option><option>Salary: low to high</option>
        </select>
      </div>
      <div className="jobs-layout">
        <div className={`filter-drawer ${filtersOpen ? "open" : ""}`} onClick={(event) => event.currentTarget === event.target && setFiltersOpen(false)}>
          <FilterSidebar
            region={region} setRegion={setRegion} date={date} setDate={setDate}
            workplace={workplace} setWorkplace={setWorkplace} skill={skill} setSkill={setSkill}
            onClose={() => setFiltersOpen(false)}
          />
        </div>
        <section className="results-column">
          <div className="results-heading">
            <div>
              <span>{category ? category.name : "DevOps, platform & cloud opportunities"}</span>
              <h1>{filtered.length} sample jobs found</h1>
            </div>
            <label className="desktop-sort">Sort by:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Most relevant</option><option>Newest</option><option>Salary: high to low</option><option>Salary: low to high</option>
              </select>
            </label>
          </div>
          {activeFilters.length > 0 && <div className="active-filters">{activeFilters.map((item) => <span key={String(item)}>{item}<X size={12} /></span>)}</div>}
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
            {filtered.length === 0 && <div className="empty-state"><Search size={28} /><h3>No matching sample jobs</h3><p>Try removing a filter or searching for a broader skill.</p></div>}
          </div>
          {limit < filtered.length && <button className="button load-more" onClick={() => setLimit((value) => value + 12)}>Load more jobs</button>}
        </section>
        {selected && <JobPreview job={selected} saved={saved.has(selected.id)} onSave={() => toggleSaved(selected.id)} />}
      </div>
    </main>
  );
}

function FullJobPage({ job, saved, toggleSaved }: { job: Job; saved: boolean; toggleSaved: () => void }) {
  return (
    <main className="detail-page">
      <div className="page-shell">
        <AppLink href="/jobs" className="back-link"><ArrowLeft size={16} /> Back to all jobs</AppLink>
        <DemoNotice />
        <div className="detail-grid">
          <article className="detail-main">
            <header className="detail-hero">
              <CompanyLogo job={job} size="large" />
              <div><div className="badge-row"><Tag tone="violet">Sample data</Tag><Tag tone="blue">{job.category}</Tag></div><h1>{job.title}</h1><p>{job.companyName}</p></div>
              <button className="icon-button" onClick={toggleSaved}><Bookmark fill={saved ? "currentColor" : "none"} /></button>
            </header>
            <div className="job-meta detail-meta">
              <span><MapPin />{job.locationText}</span><span><BriefcaseBusiness />{job.workplaceType} · {job.employmentType}</span><span><Users />{job.experienceText}</span><span><CircleDollarSign />{formatSalary(job)}</span>
            </div>
            <section><h2>Job overview</h2><p>{job.description}</p></section>
            <section><h2>Key responsibilities</h2><ul>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h2>Required qualifications</h2><ul>{job.qualifications.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h2>Preferred qualifications</h2><ul>{job.preferredQualifications.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h2>Skills</h2><div className="skill-row">{job.skills.map((item) => <Tag key={item}>{item}</Tag>)}</div></section>
            <section><h2>Benefits & support</h2><div className="benefit-grid"><span><Check /> Learning budget</span><span><Check /> Flexible working</span><span><Check /> Health coverage</span><span><Check /> Modern tooling</span></div></section>
          </article>
          <aside className="detail-aside">
            <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="button button-primary button-block">Apply on original source <ExternalLink size={17} /></a>
            <button className="button button-outline button-block" onClick={toggleSaved}><Bookmark size={17} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save this job"}</button>
            <div className="trust-card">
              <h3><ShieldCheck /> Source information</h3>
              <dl><dt>Listing type</dt><dd>Fictional sample</dd><dt>Source</dt><dd>JobOrbit demo dataset</dd><dt>First discovered</dt><dd>{postedLabel(job.daysAgo)}</dd><dt>Last checked</dt><dd>Today</dd></dl>
              <a href={job.sourceUrl} target="_blank" rel="noreferrer">Open demo source <ExternalLink size={14} /></a>
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
        <div className="page-title"><span className="eyebrow"><Building2 size={14} /> Company directory</span><h1>Discover teams building the future</h1><p>Explore fictional company profiles designed to demonstrate how employer discovery will work.</p></div>
        <DemoNotice />
        <div className="company-directory-grid">
          {COMPANIES.map((company, index) => (
            <AppLink href={`/companies/${company.id}`} key={company.id} className="directory-company-card">
              <span className="company-logo company-logo-large" style={{ "--logo": company.accent } as React.CSSProperties}>{company.initials}</span>
              <div><h2>{company.name}</h2><p>{company.industry}</p></div>
              <span><MapPin size={15} />{company.headquarters}</span>
              <span><Users size={15} />{company.size}</span>
              <b>{10 - (index % 4)} active sample jobs</b>
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
          <span className="company-logo company-logo-large" style={{ "--logo": company.accent } as React.CSSProperties}>{company.initials}</span>
          <div><Tag tone="violet">Fictional company</Tag><h1>{company.name}</h1><p>{company.industry} · {company.headquarters}</p></div>
          <button className="button button-primary"><Bell size={16} /> Follow company</button>
        </div>
        <div className="company-profile-grid">
          <article className="company-about">
            <h2>About {company.name}</h2><p>{company.description}</p>
            <h2>Technology stack</h2><div className="skill-row">{company.technologies.map((tech) => <Tag key={tech}>{tech}</Tag>)}</div>
            <h2>Work policy</h2><p>{company.remotePolicy}. India and international hiring shown in this prototype is sample data.</p>
          </article>
          <aside className="company-facts"><h3>Company details</h3><dl><dt>Headquarters</dt><dd>{company.headquarters}</dd><dt>Company size</dt><dd>{company.size}</dd><dt>Industry</dt><dd>{company.industry}</dd><dt>Visa sponsorship</dt><dd>Role dependent</dd></dl></aside>
        </div>
        <section className="company-openings"><div className="section-heading"><div><span className="section-kicker">Openings</span><h2>{jobs.length} sample jobs</h2></div></div><div className="featured-grid">{jobs.slice(0, 6).map((job) => <JobCard key={job.id} job={job} detailed isSaved={false} onSave={() => {}} onSelect={() => {}} />)}</div></section>
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
          {created ? <div className="success-state"><span><Check /></span><h2>Alert created</h2><p>Your sample alert is ready. Connect an email service to enable delivery.</p><button type="button" className="button button-outline" onClick={() => setCreated(false)}>Create another</button></div> : <>
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

function AdminPage() {
  const metrics = [
    ["Total jobs", "100", BriefcaseBusiness, "+12 this week"],
    ["Active jobs", "100", Zap, "Prototype dataset"],
    ["Added today", "4", Sparkles, "Ready to review"],
    ["Failed imports", "0", ShieldCheck, "No live imports"],
    ["Duplicate jobs", "3", Link2, "Needs review"],
    ["Sources", "1", Globe2, "Demo source"],
  ] as const;
  return (
    <main className="admin-page">
      <div className="admin-shell">
        <aside className="admin-nav">
          <AppLink href="/" className="brand"><Logo /><span>JobOrbit <b>AI</b></span></AppLink>
          <nav><a className="active"><LayoutDashboard />Overview</a><a><BriefcaseBusiness />Jobs</a><a><Building2 />Companies</a><a><Globe2 />Sources</a><a><RefreshCw />Imports</a></nav>
          <span>Prototype admin</span>
        </aside>
        <section className="admin-content">
          <div className="admin-heading"><div><span>Monday, 27 July</span><h1>Job operations overview</h1><p>Monitor the quality and freshness of your aggregated job catalogue.</p></div><button className="button button-primary"><RefreshCw size={16} /> Trigger refresh</button></div>
          <DemoNotice />
          <div className="metric-grid">{metrics.map(([label, value, Icon, note]) => <div className="metric-card" key={label}><span><Icon /></span><small>{label}</small><b>{value}</b><em>{note}</em></div>)}</div>
          <div className="admin-grid">
            <div className="admin-panel"><div className="panel-heading"><h2>Jobs by category</h2><button>View report</button></div>{[["DevOps", 34], ["Platform Engineering", 22], ["SRE", 18], ["Cloud Engineering", 16], ["MLOps", 10]].map(([label, value]) => <div className="bar-row" key={label}><span>{label}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}</b></div>)}</div>
            <div className="admin-panel"><div className="panel-heading"><h2>Source health</h2><button>Manage</button></div><div className="source-health"><span className="company-logo company-logo-medium" style={{ "--logo": "#4f46e5" } as React.CSSProperties}>JO</span><div><b>JobOrbit demo dataset</b><small>Last refresh: today</small></div><Tag tone="green">Healthy</Tag></div><div className="admin-empty"><RefreshCw /><p>Connect APIs or scraping pipelines to see live import health.</p></div></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PlaceholderPage({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <main className="placeholder-page"><div className="empty-state large"><span className="placeholder-icon">{icon}</span><h1>{title}</h1><p>This screen is prepared for the next integration phase. The navigation and product structure are already in place.</p><AppLink href="/jobs" className="button button-primary">Explore sample jobs</AppLink></div></main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div><span className="brand"><Logo /><span>JobOrbit <b>AI</b></span></span><p>Discover AI, DevOps and MLOps opportunities worldwide.</p><Tag tone="violet">Prototype</Tag></div>
        <div><b>Discover</b><AppLink href="/jobs">All jobs</AppLink><AppLink href="/jobs/india">India jobs</AppLink><AppLink href="/jobs/remote">Remote jobs</AppLink></div>
        <div><b>For talent</b><AppLink href="/saved-jobs">Saved jobs</AppLink><AppLink href="/job-alerts">Job alerts</AppLink><AppLink href="/companies">Companies</AppLink></div>
        <div><b>Platform</b><AppLink href="/post-job">Post a job</AppLink><AppLink href="/admin">Admin demo</AppLink><a href="mailto:hello@joborbit.example">Contact</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 JobOrbit AI prototype.</span><span>Fictional job data • Built for demonstration</span></div>
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
    content = <JobsPage categorySlug={path[1]} saved={saved} toggleSaved={toggleSaved} />;
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
    content = <PlaceholderPage title="Salary insights" icon={<CircleDollarSign />} />;
  } else {
    content = <PlaceholderPage title="Career resources" icon={<Sparkles />} />;
  }

  return (
    <div className="app">
      <Header savedCount={saved.size} dark={dark} onToggleTheme={toggleTheme} />
      {content}
      <Footer />
    </div>
  );
}
