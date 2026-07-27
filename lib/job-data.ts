import liveJobData from "@/data/jobs.json";

export type RegionType = "India" | "Outside India" | "Remote worldwide";
export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type JobCategory =
  | "DevOps"
  | "Site Reliability Engineering"
  | "Platform Engineering"
  | "Cloud Engineering"
  | "MLOps"
  | "Artificial Intelligence"
  | "Machine Learning"
  | "Generative AI"
  | "Data Science"
  | "Cybersecurity"
  | "Software Engineering";

export interface Job {
  id: string;
  slug: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyLogoUrl: string;
  category: JobCategory;
  categories: JobCategory[];
  subcategory: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  country: string;
  state: string;
  city: string;
  locationText: string;
  regionType: RegionType;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceMinimum: number;
  experienceMaximum: number;
  experienceText: string;
  salaryMinimum: number;
  salaryMaximum: number;
  salaryCurrency: string;
  salaryPeriod: string;
  salaryDisclosed: boolean;
  visaSponsorship: boolean;
  relocationAssistance: boolean;
  sourceName: string;
  sourceType: "Public job API";
  sourceUrl: string;
  applicationUrl: string;
  publishedAt: string;
  discoveredAt: string;
  lastVerifiedAt: string;
  expiresAt: string;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isEasyApply: boolean;
  daysAgo: number;
}

export interface Company {
  id: string;
  name: string;
  initials: string;
  logoUrl: string;
  accent: string;
  industry: string;
  headquarters: string;
  size: string;
  description: string;
  technologies: string[];
  remotePolicy: string;
  sourceUrl: string;
  activeJobs: number;
}

export interface Category {
  slug: string;
  name: JobCategory;
  description: string;
  icon: string;
  accent: string;
}

export interface JobAlert {
  role: string;
  skills: string[];
  location: string;
  region: RegionType | "All locations";
  remote: boolean;
  experience: string;
  email: string;
  frequency: "Daily" | "Weekly";
}

export const FILTER_CONFIG = {
  regions: ["Any location", "India", "Outside India", "Remote worldwide"],
  indiaLocations: [
    "Bengaluru",
    "Hyderabad",
    "Delhi NCR",
    "Mumbai",
    "Pune",
    "Chennai",
    "Gurugram",
    "Noida",
    "Kolkata",
    "Ahmedabad",
    "Remote India",
  ],
  internationalLocations: [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Singapore",
    "Germany",
    "Netherlands",
    "Ireland",
    "United Arab Emirates",
  ],
  experience: ["Any experience", "Minimum 1 year", "Minimum 2 years", "Minimum 3 years", "Minimum 4 years"],
  workplace: ["Remote", "Hybrid", "On-site"],
  employment: ["Full-time", "Part-time", "Contract", "Internship"],
  datePosted: ["Any time", "Today", "Yesterday", "Last 7 days", "Last 30 days", "Last 45 days"],
  skills: [
    "Python",
    "AWS",
    "Azure",
    "Google Cloud",
    "Kubernetes",
    "Docker",
    "Terraform",
    "Ansible",
    "Jenkins",
    "GitHub Actions",
    "Prometheus",
    "Grafana",
    "Linux",
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "PyTorch",
    "TensorFlow",
    "LLM",
    "RAG",
  ],
} as const;

export const CATEGORIES: Category[] = [
  { slug: "artificial-intelligence", name: "Artificial Intelligence", description: "Build intelligent systems", icon: "AI", accent: "#4f46e5" },
  { slug: "machine-learning", name: "Machine Learning", description: "Train production models", icon: "ML", accent: "#16a34a" },
  { slug: "generative-ai", name: "Generative AI", description: "Shape the LLM stack", icon: "✦", accent: "#7c3aed" },
  { slug: "data-science", name: "Data Science", description: "Turn data into decisions", icon: "DS", accent: "#ea580c" },
  { slug: "devops", name: "DevOps", description: "Automate software delivery", icon: "∞", accent: "#2563eb" },
  { slug: "mlops", name: "MLOps", description: "Ship reliable ML systems", icon: "⬡", accent: "#0891b2" },
  { slug: "site-reliability-engineering", name: "Site Reliability Engineering", description: "Engineer for resilience", icon: "SRE", accent: "#dc2626" },
  { slug: "platform-engineering", name: "Platform Engineering", description: "Build developer platforms", icon: "PE", accent: "#0f766e" },
  { slug: "cloud-engineering", name: "Cloud Engineering", description: "Design modern cloud stacks", icon: "☁", accent: "#0284c7" },
  { slug: "cybersecurity", name: "Cybersecurity", description: "Protect infrastructure", icon: "CS", accent: "#9333ea" },
  { slug: "software-engineering", name: "Software Engineering", description: "Build Java and full-stack products", icon: "SE", accent: "#c2410c" },
];

export const JOB_DATA_META = {
  fetchedAt: liveJobData.fetchedAt,
  cutoffDate: liveJobData.cutoffDate,
  source: liveJobData.source,
  sources: liveJobData.sources,
  exchangeRates: liveJobData.exchangeRates,
  counts: liveJobData.counts as Record<JobCategory, number>,
};

const importedJobs = liveJobData.jobs as Job[];
const now = Date.now();
const cutoff = now - 45 * 24 * 60 * 60 * 1000;
const seniorTitlePattern =
  /\b(senior|sr\.?|staff|principal|lead|manager|director|head|architect|vp|vice president|chief)\b/i;

// Defensive runtime filter: even a stale generated file cannot expose expired or
// older-than-45-day listings.
export const JOBS: Job[] = importedJobs.filter((job) => {
  const published = Date.parse(job.publishedAt);
  const expires = Date.parse(job.expiresAt);
  return (
    job.isActive &&
    Number.isFinite(published) &&
    Number.isFinite(expires) &&
    published >= cutoff &&
    published <= now + 24 * 60 * 60 * 1000 &&
    expires > now &&
    job.experienceMinimum >= 1 &&
    job.experienceMinimum <= 4 &&
    !seniorTitlePattern.test(job.title) &&
    /^https:\/\//.test(job.applicationUrl) &&
    /^https:\/\//.test(job.sourceUrl)
  );
});

const companyColors = ["#111827", "#4f46e5", "#0891b2", "#7c3aed", "#16a34a", "#ea580c", "#db2777", "#2563eb", "#b45309", "#0f766e"];

function colorFor(value: string) {
  const score = [...value].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return companyColors[score % companyColors.length];
}

function publicLogoUrl(job: Job) {
  if (job.companyLogoUrl) return job.companyLogoUrl;
  const atsHosts = new Set([
    "job-boards.greenhouse.io",
    "boards.greenhouse.io",
    "boards.eu.greenhouse.io",
    "job-boards.eu.greenhouse.io",
    "jobs.lever.co",
    "jobs.ashbyhq.com",
  ]);
  let domain = "";
  try {
    const sourceDomain = new URL(job.sourceUrl).hostname.replace(/^www\./, "");
    domain = atsHosts.has(sourceDomain)
      ? `${job.companyId.replaceAll("-", "")}.com`
      : sourceDomain;
  } catch {
    domain = `${job.companyId.replaceAll("-", "")}.com`;
  }
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

const companyMap = new Map<string, Company>();
for (const job of JOBS) {
  const company = companyMap.get(job.companyId);
  if (company) {
    company.activeJobs += 1;
    if (!company.logoUrl) company.logoUrl = publicLogoUrl(job);
    company.technologies = [...new Set([...company.technologies, ...job.skills])].slice(0, 8);
    continue;
  }
  companyMap.set(job.companyId, {
    id: job.companyId,
    name: job.companyName,
    initials: job.companyLogo,
    logoUrl: publicLogoUrl(job),
    accent: colorFor(job.companyName),
    industry: job.category,
    headquarters: job.locationText,
    size: "Not disclosed by source",
    description: `Current openings from ${job.companyName}, collected from an active public job feed and linked to the original application page.`,
    technologies: job.skills.slice(0, 8),
    remotePolicy: "Remote opportunities available",
    sourceUrl: job.sourceUrl,
    activeJobs: 1,
  });
}

export const COMPANIES: Company[] = [...companyMap.values()].sort(
  (a, b) => b.activeJobs - a.activeJobs || a.name.localeCompare(b.name),
);

export function formatSalary(job: Job) {
  if (!job.salaryDisclosed) return "Salary not disclosed";
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: job.salaryCurrency || "USD",
    maximumFractionDigits: 0,
    notation: job.salaryMaximum >= 100_000 ? "compact" : "standard",
  });
  if (job.salaryMinimum > 0 && job.salaryMaximum > 0) {
    if (job.salaryMinimum === job.salaryMaximum) {
      return formatter.format(job.salaryMinimum);
    }
    return `${formatter.format(job.salaryMinimum)}–${formatter.format(job.salaryMaximum)}`;
  }
  if (job.salaryMinimum > 0) return `From ${formatter.format(job.salaryMinimum)}`;
  return `Up to ${formatter.format(job.salaryMaximum)}`;
}

export function formatSalaryInInr(job: Job) {
  if (!job.salaryDisclosed) return "Salary not disclosed";
  const rates = JOB_DATA_META.exchangeRates.ratesToInr as Record<string, number>;
  const rate = rates[job.salaryCurrency];
  if (!rate) return formatSalary(job);
  const formatter = (amount: number) => {
    const [divisor, suffix] = amount >= 10_000_000
      ? [10_000_000, "Cr"]
      : amount >= 100_000
        ? [100_000, "L"]
        : [1, ""];
    const rounded = Math.round((amount / divisor) * 10) / 10;
    const value = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    return `₹${value}${suffix}`;
  };
  const minimum = Math.round(job.salaryMinimum * rate);
  const maximum = Math.round(job.salaryMaximum * rate);
  if (minimum > 0 && maximum > 0) {
    if (minimum === maximum) return formatter(minimum);
    return `${formatter(minimum)}–${formatter(maximum)}`;
  }
  if (minimum > 0) return `From ${formatter(minimum)}`;
  return `Up to ${formatter(maximum)}`;
}

export function postedLabel(daysAgo: number) {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}

export function getJobBySlug(slug: string | undefined) {
  return JOBS.find((job) => job.slug === slug);
}

export function getCompanyById(id: string | undefined) {
  return COMPANIES.find((company) => company.id === id);
}
