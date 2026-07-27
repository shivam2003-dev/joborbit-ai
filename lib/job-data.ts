export type RegionType = "India" | "Outside India" | "Remote worldwide";
export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type EmploymentType = "Full-time" | "Contract" | "Internship";
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
  | "Cybersecurity";

export interface Job {
  id: string;
  slug: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  category: JobCategory;
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
  salaryCurrency: "INR" | "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "SGD";
  salaryPeriod: "year";
  salaryDisclosed: boolean;
  visaSponsorship: boolean;
  relocationAssistance: boolean;
  sourceName: string;
  sourceType: "Demo company feed";
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
  accent: string;
  industry: string;
  headquarters: string;
  size: string;
  description: string;
  technologies: string[];
  remotePolicy: string;
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
  experience: ["Fresher", "0–1 years", "1–3 years", "3–5 years", "5–8 years", "8+ years", "Lead"],
  workplace: ["Remote", "Hybrid", "On-site"],
  employment: ["Full-time", "Contract", "Internship"],
  datePosted: ["Any time", "Today", "Yesterday", "Last 7 days", "Last 30 days"],
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
    "PyTorch",
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
];

export const COMPANIES: Company[] = [
  {
    id: "nova-stack",
    name: "NovaStack Labs",
    initials: "NS",
    accent: "#111827",
    industry: "Cloud Infrastructure",
    headquarters: "Bengaluru, India",
    size: "201–500 employees",
    description: "A fictional cloud infrastructure company used to demonstrate JobOrbit AI.",
    technologies: ["AWS", "Kubernetes", "Go", "Terraform"],
    remotePolicy: "Hybrid-first",
  },
  {
    id: "orbit-pay",
    name: "OrbitPay Systems",
    initials: "OP",
    accent: "#4f46e5",
    industry: "Fintech",
    headquarters: "Mumbai, India",
    size: "501–1,000 employees",
    description: "A fictional fintech platform focused on secure, resilient payments.",
    technologies: ["Azure", "Kubernetes", "Python", "Grafana"],
    remotePolicy: "Flexible hybrid",
  },
  {
    id: "vertex-grid",
    name: "VertexGrid",
    initials: "VG",
    accent: "#0891b2",
    industry: "Developer Tools",
    headquarters: "Austin, United States",
    size: "51–200 employees",
    description: "A fictional developer tooling company building reliable delivery workflows.",
    technologies: ["Google Cloud", "Go", "Argo CD", "Prometheus"],
    remotePolicy: "Remote-friendly",
  },
  {
    id: "quanta-loop",
    name: "QuantaLoop AI",
    initials: "QL",
    accent: "#7c3aed",
    industry: "Artificial Intelligence",
    headquarters: "London, United Kingdom",
    size: "51–200 employees",
    description: "A fictional AI startup demonstrating MLOps and platform roles.",
    technologies: ["Python", "PyTorch", "Kubernetes", "MLflow"],
    remotePolicy: "Remote within supported countries",
  },
  {
    id: "green-packet",
    name: "GreenPacket Cloud",
    initials: "GP",
    accent: "#16a34a",
    industry: "Sustainable Technology",
    headquarters: "Berlin, Germany",
    size: "201–500 employees",
    description: "A fictional carbon-aware cloud operations company.",
    technologies: ["AWS", "Linux", "Terraform", "OpenTelemetry"],
    remotePolicy: "Hybrid",
  },
  {
    id: "scale-harbor",
    name: "ScaleHarbor",
    initials: "SH",
    accent: "#ea580c",
    industry: "SaaS",
    headquarters: "Singapore",
    size: "201–500 employees",
    description: "A fictional SaaS company operating high-scale regional services.",
    technologies: ["AWS", "EKS", "Datadog", "GitHub Actions"],
    remotePolicy: "Office-flexible",
  },
  {
    id: "lumen-data",
    name: "LumenData Works",
    initials: "LD",
    accent: "#db2777",
    industry: "Data Platforms",
    headquarters: "Toronto, Canada",
    size: "51–200 employees",
    description: "A fictional data platform company with a modern MLOps stack.",
    technologies: ["Python", "Snowflake", "Kubernetes", "Terraform"],
    remotePolicy: "Remote-first",
  },
  {
    id: "cobalt-health",
    name: "Cobalt HealthTech",
    initials: "CH",
    accent: "#2563eb",
    industry: "Health Technology",
    headquarters: "Sydney, Australia",
    size: "201–500 employees",
    description: "A fictional health technology company used for prototype job data.",
    technologies: ["Azure", "AKS", "Linux", "Grafana"],
    remotePolicy: "Hybrid",
  },
  {
    id: "desert-byte",
    name: "DesertByte",
    initials: "DB",
    accent: "#b45309",
    industry: "Digital Commerce",
    headquarters: "Dubai, United Arab Emirates",
    size: "501–1,000 employees",
    description: "A fictional digital commerce company hiring cloud engineers.",
    technologies: ["AWS", "Kubernetes", "Java", "Terraform"],
    remotePolicy: "On-site with flexibility",
  },
  {
    id: "prism-ops",
    name: "PrismOps",
    initials: "PO",
    accent: "#0f766e",
    industry: "Observability",
    headquarters: "Hyderabad, India",
    size: "51–200 employees",
    description: "A fictional observability platform for distributed systems.",
    technologies: ["Prometheus", "Grafana", "Go", "OpenTelemetry"],
    remotePolicy: "Remote India",
  },
];

const roleTemplates = [
  ["DevOps Engineer", "DevOps", ["AWS", "Docker", "Terraform", "GitHub Actions"]],
  ["Senior DevOps Engineer", "DevOps", ["Azure", "Kubernetes", "Terraform", "Linux"]],
  ["Site Reliability Engineer", "Site Reliability Engineering", ["Kubernetes", "Prometheus", "Grafana", "Python"]],
  ["Platform Engineer", "Platform Engineering", ["Google Cloud", "Kubernetes", "Go", "Terraform"]],
  ["Cloud Infrastructure Engineer", "Cloud Engineering", ["AWS", "Linux", "Ansible", "Docker"]],
  ["MLOps Engineer", "MLOps", ["Python", "Kubernetes", "PyTorch", "MLflow"]],
  ["DevSecOps Engineer", "Cybersecurity", ["AWS", "Kubernetes", "Linux", "Terraform"]],
  ["Cloud Automation Engineer", "Cloud Engineering", ["Azure", "Terraform", "Ansible", "GitHub Actions"]],
  ["Production Engineer", "Site Reliability Engineering", ["Linux", "Python", "Prometheus", "Docker"]],
  ["Developer Experience Engineer", "Platform Engineering", ["Kubernetes", "GitHub Actions", "Go", "Terraform"]],
] as const;

const locations = [
  ["Bengaluru", "Karnataka", "India", "India", "Hybrid", "INR"],
  ["Hyderabad", "Telangana", "India", "India", "On-site", "INR"],
  ["Pune", "Maharashtra", "India", "India", "Hybrid", "INR"],
  ["Gurugram", "Haryana", "India", "India", "On-site", "INR"],
  ["Remote India", "", "India", "India", "Remote", "INR"],
  ["Austin", "Texas", "United States", "Outside India", "Hybrid", "USD"],
  ["London", "England", "United Kingdom", "Outside India", "Hybrid", "GBP"],
  ["Toronto", "Ontario", "Canada", "Outside India", "Remote", "CAD"],
  ["Berlin", "Berlin", "Germany", "Outside India", "Hybrid", "EUR"],
  ["Remote worldwide", "", "Worldwide", "Remote worldwide", "Remote", "USD"],
] as const;

function isoDaysFromNow(days: number) {
  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export const JOBS: Job[] = Array.from({ length: 100 }, (_, index) => {
  const template = roleTemplates[index % roleTemplates.length];
  const company = COMPANIES[index % COMPANIES.length];
  const location = locations[index % locations.length];
  const daysAgo = index % 31;
  const experienceMinimum = index % 4;
  const experienceMaximum = experienceMinimum + 3;
  const currency = location[5];
  const isIndia = location[3] === "India";
  const salaryMinimum = isIndia ? 900000 + (index % 8) * 250000 : 70000 + (index % 7) * 8000;
  const salaryMaximum = isIndia ? salaryMinimum + 900000 : salaryMinimum + 35000;
  const slug = `${template[0].toLowerCase().replaceAll(" ", "-")}-${company.id}-${index + 1}`;

  return {
    id: `job-${String(index + 1).padStart(3, "0")}`,
    slug,
    title: template[0],
    companyId: company.id,
    companyName: company.name,
    companyLogo: company.initials,
    category: template[1] as JobCategory,
    subcategory: template[0],
    description:
      `Join ${company.name} in this sample ${template[0]} role. You will improve delivery reliability, automate cloud infrastructure, and help product teams ship safely at scale. This listing is demonstration data for the JobOrbit AI prototype.`,
    responsibilities: [
      "Design and operate secure, reliable cloud infrastructure.",
      "Improve deployment pipelines, observability, and incident response.",
      "Partner with engineering teams to remove delivery bottlenecks.",
      "Document operational standards and automate repetitive work.",
    ],
    qualifications: [
      `${experienceMinimum}+ years working with cloud or production infrastructure.`,
      `Hands-on experience with ${template[2].slice(0, 3).join(", ")}.`,
      "Strong troubleshooting, communication, and systems thinking.",
    ],
    preferredQualifications: [
      "Experience operating distributed systems at scale.",
      "Familiarity with security and cost optimisation practices.",
    ],
    skills: [...template[2]],
    country: location[2],
    state: location[1],
    city: location[0],
    locationText: location[0],
    regionType: location[3] as RegionType,
    workplaceType: location[4] as WorkplaceType,
    employmentType: index % 14 === 0 ? "Contract" : index % 23 === 0 ? "Internship" : "Full-time",
    experienceMinimum,
    experienceMaximum,
    experienceText: `${experienceMinimum}–${experienceMaximum} years`,
    salaryMinimum,
    salaryMaximum,
    salaryCurrency: currency,
    salaryPeriod: "year",
    salaryDisclosed: index % 5 !== 0,
    visaSponsorship: !isIndia && index % 3 === 0,
    relocationAssistance: index % 6 === 0,
    sourceName: "JobOrbit demo dataset",
    sourceType: "Demo company feed",
    sourceUrl: "https://example.com/",
    applicationUrl: `https://example.com/jobs/${slug}`,
    publishedAt: isoDaysFromNow(-daysAgo),
    discoveredAt: isoDaysFromNow(-daysAgo),
    lastVerifiedAt: isoDaysFromNow(0),
    expiresAt: isoDaysFromNow(45 - daysAgo),
    isVerified: false,
    isFeatured: index < 6,
    isActive: true,
    isEasyApply: index % 4 === 0,
    daysAgo,
  };
});

export function formatSalary(job: Job) {
  if (!job.salaryDisclosed) return "Salary not disclosed";
  const symbol: Record<Job["salaryCurrency"], string> = {
    INR: "₹",
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "CA$",
    AUD: "A$",
    SGD: "S$",
  };
  if (job.salaryCurrency === "INR") {
    return `${symbol.INR}${(job.salaryMinimum / 100000).toFixed(0)}L–${symbol.INR}${(job.salaryMaximum / 100000).toFixed(0)}L`;
  }
  return `${symbol[job.salaryCurrency]}${Math.round(job.salaryMinimum / 1000)}k–${symbol[job.salaryCurrency]}${Math.round(job.salaryMaximum / 1000)}k`;
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
