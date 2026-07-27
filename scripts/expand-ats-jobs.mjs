import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { extractEligibleExperience } from "./job-quality.mjs";

const DISCOVERY_API = "https://glever.co/api/jobs";
const TARGET_PER_CATEGORY = 100;
const INDIA_TARGET = 100;
const MAX_DISCOVERY_PAGES = 10;
const MAX_INDIA_PAGES = 5;
const MAX_CONCURRENCY = 10;
const FORTY_FIVE_DAYS_MS = 45 * 24 * 60 * 60 * 1000;
const now = Date.now();
const cutoff = now - FORTY_FIVE_DAYS_MS;
const supportedAts = new Set(["greenhouse", "lever", "ashbyhq"]);
const seniorTitlePattern =
  /\b(senior|sr\.?|staff|principal|lead|manager|director|head|architect|vp|vice president|chief)\b/i;
const irrelevantTitlePattern =
  /\b(physician|medical review|video editor|graphic designer|learning experience designer|linguist|talent acquisition|recruiter|market research|marketing analytics|operations associate|data center (?:it )?technician|mechanical data center|physical security systems technician|technical trainer|talent community|ongoing search|all levels|ssr\.?|expert)\b/i;

const discoveryQueries = [
  "engineer",
  "software engineer",
  "software developer",
  "Java developer",
  "Java software engineer",
  "Spring Boot developer",
  "full stack developer",
  "full stack software engineer",
  "backend engineer",
  "backend developer",
  "application developer",
  "application engineer",
  "web developer",
  "frontend developer",
  "frontend engineer",
  "React developer",
  "TypeScript developer",
  "Node.js developer",
  ".NET developer",
  "Python developer",
  "systems engineer",
  "automation engineer",
  "research engineer",
  "data engineer",
  "scientist",
  "data",
  "analytics",
  "model",
  "learning",
  "algorithm",
  "predictive",
  "research",
  "neural network",
  "AI",
  "ML",
  "cloud",
  "security",
  "platform",
  "infrastructure",
  "reliability",
  "artificial intelligence",
  "AI engineer",
  "AI developer",
  "AI scientist",
  "applied scientist",
  "machine learning",
  "machine learning engineer",
  "deep learning",
  "computer vision",
  "NLP engineer",
  "NLP",
  "Python",
  "PyTorch",
  "TensorFlow",
  "generative AI",
  "generative",
  "LLM",
  "large language model",
  "RAG engineer",
  "transformer",
  "prompt engineer",
  "AI agent",
  "data scientist",
  "data science",
  "analytics engineer",
  "MLOps",
  "machine learning platform",
  "AI infrastructure",
  "model deployment",
  "model serving",
  "Kubeflow",
  "SageMaker",
  "Vertex AI",
  "DevOps",
  "DevSecOps",
  "Kubernetes",
  "Terraform",
  "Docker",
  "CI/CD",
  "Jenkins",
  "site reliability",
  "SRE",
  "observability",
  "Prometheus",
  "Grafana",
  "production engineer",
  "release engineer",
  "platform engineer",
  "infrastructure engineer",
  "cloud engineer",
  "AWS",
  "Azure",
  "Google Cloud",
  "security engineer",
  "cybersecurity",
  "application security",
  "cloud security",
  "information security",
  "security analyst",
  "SOC analyst",
];

const categoryPatterns = {
  "Artificial Intelligence":
    /\bartificial intelligence\b|\bAI[ /-]?(?:ML|engineer|developer|scientist|specialist)\b|\bmachine learning\b|\bdeep learning\b|\bcomputer vision\b|\bnatural language processing\b|\bNLP\b|\bLLM\b|\bapplied scientist\b|\bdata scientist\b/i,
  "Machine Learning":
    /\bmachine learning\b|\bML engineer\b|\bML scientist\b|\bapplied scientist\b|\bdata scientist\b|\bdeep learning\b|\bcomputer vision\b|\bnatural language processing\b|\bpredictive model/i,
  "Generative AI":
    /\bgenerative AI\b|\bgenAI\b|\blarge language models?\b|\bLLMs?\b|\bretrieval[ -]augmented\b|\bRAG\b|\bprompt engineer\b|\bagentic AI\b|\bAI agents?\b|\btransformers?\b|\bfoundation models?\b|\bembeddings?\b|\bvector (?:database|search)\b|\bLangChain\b|\bLlamaIndex\b|\bOpenAI\b|\bAnthropic\b|\bHugging Face\b|\bchatbots?\b/i,
  "Data Science":
    /\bdata scien(?:ce|tist)\b|\bdata scientist\b|\banalytics engineer\b|\bstatistical model|\bpredictive model|\bmachine learning\b/i,
  DevOps:
    /\bdevops\b|\bdevsecops\b|\bCI[ /-]?CD\b|\bcontinuous (?:integration|delivery|deployment)\b|\binfrastructure engineer\b|\brelease engineer\b|\bbuild engineer\b/i,
  MLOps:
    /\bMLOps\b|\bML platform\b|\bmachine learning platform\b|\bML infrastructure\b|\bAI infrastructure\b|\bmodel (?:deployment|serving|monitoring|operations|lifecycle|registry)\b|\bproduction ML\b|\bML pipelines?\b|\bfeature stores?\b|\bexperiment tracking\b|\bMLflow\b|\bKubeflow\b|\bSageMaker\b|\bVertex AI\b/i,
  "Site Reliability Engineering":
    /\bsite reliability\b|\bSRE\b|\breliability engineer\b|\bproduction engineer\b|\bdevops engineer\b|\bobservability engineer\b/i,
  "Platform Engineering":
    /\bplatform engineer\b|\bplatform engineering\b|\bdeveloper platform\b|\bdeveloper experience\b|\binfrastructure platform\b|\bdevops engineer\b|\bcloud platform\b/i,
  "Cloud Engineering":
    /\bcloud engineer\b|\bcloud engineering\b|\bcloud infrastructure\b|\bAWS engineer\b|\bAzure engineer\b|\bGCP engineer\b|\binfrastructure engineer\b|\bdevops engineer\b/i,
  Cybersecurity:
    /\bcyber ?security\b|\bsecurity engineer\b|\bcloud security\b|\bdevsecops\b|\bapplication security\b|\bproduct security\b|\binformation security\b|\bSOC analyst\b|\bsecurity analyst\b/i,
  "Software Engineering":
    /\bsoftware (?:engineer|developer|development)\b|\bfull[ -]?stack\b|\bjava\b|\bback[ -]?end (?:engineer|developer)\b|\bfront[ -]?end (?:engineer|developer)\b|\bapplication (?:engineer|developer)\b|\bweb developer\b|\bspring(?: boot)?\b|\breact(?:\.js|js)?\b|\bnode(?:\.js|js)?\b|\btypescript\b|\bpython developer\b|\b\.net developer\b/i,
};

const skillPatterns = [
  ["Kubernetes", /\bkubernetes\b|\bk8s\b/i],
  ["Docker", /\bdocker\b|containers?/i],
  ["Terraform", /\bterraform\b/i],
  ["Ansible", /\bansible\b/i],
  ["AWS", /\baws\b|amazon web services/i],
  ["Azure", /\bazure\b/i],
  ["Google Cloud", /\bgcp\b|google cloud/i],
  ["Linux", /\blinux\b/i],
  ["Python", /\bpython\b/i],
  ["Go", /\bgolang\b|\bgo programming\b/i],
  ["Java", /\bjava\b/i],
  ["Spring Boot", /\bspring(?: boot)?\b/i],
  ["React", /\breact(?:\.js|js)?\b/i],
  ["TypeScript", /\btypescript\b/i],
  ["GitHub Actions", /github actions/i],
  ["Jenkins", /\bjenkins\b/i],
  ["Prometheus", /\bprometheus\b/i],
  ["Grafana", /\bgrafana\b/i],
  ["PyTorch", /\bpytorch\b/i],
  ["TensorFlow", /\btensorflow\b/i],
  ["LLM", /\bllms?\b|large language model/i],
  ["RAG", /\brag\b|retrieval.augmented generation/i],
  ["SQL", /\bsql\b/i],
  ["Security", /\bcybersecurity\b|\binformation security\b|\bsecurity\b/i],
];

const indiaPattern =
  /\bindia\b|\bbengaluru\b|\bbangalore\b|\bhyderabad\b|\bpune\b|\bmumbai\b|\bdelhi\b|\bnoida\b|\bgurugram\b|\bgurgaon\b|\bchennai\b|\bkolkata\b|\bahmedabad\b|\bjaipur\b|\bkochi\b|\bkerala\b|\bkarnataka\b|\btelangana\b|\bmaharashtra\b|\btamil nadu\b/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, attempts = 6) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "JobOrbitAI/1.0 (+https://github.com/shivam2003-dev/joborbit-ai)",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.ok) return await response.json();
      if (![429, 500, 502, 503, 504].includes(response.status)) return null;
    } catch {
      if (attempt === attempts) return null;
    }
    await sleep(attempt * 2_000);
  }
  return null;
}

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value = "") {
  const decoded = decodeEntities(value);
  return decodeEntities(
    decoded
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function timestamp(value) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function employmentType(value = "") {
  const normalized = value.toLowerCase();
  if (normalized.includes("part")) return "Part-time";
  if (normalized.includes("contract") || normalized.includes("temporary")) {
    return "Contract";
  }
  if (normalized.includes("intern") || normalized.includes("fellow")) {
    return "Internship";
  }
  return "Full-time";
}

function workplaceType(value = "", isRemote = false) {
  const normalized = value.toLowerCase();
  if (isRemote || normalized.includes("remote")) return "Remote";
  if (normalized.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function categoriesFor(title, description) {
  const content = `${title}\n${description}`;
  const categories = Object.entries(categoryPatterns)
    .filter(([, pattern]) => pattern.test(content))
    .map(([category]) => category);
  const add = (category, condition) => {
    if (condition && !categories.includes(category)) categories.push(category);
  };
  const hasMachineLearning =
    /\b(machine learning|deep learning|data scientist|applied scientist|AI engineer|AI developer|AI scientist)\b/i.test(
      content,
    );
  const hasProductionStack =
    /\b(production|deploy(?:ment|ing)?|serving|pipelines?|platform|infrastructure|cloud|AWS|Azure|GCP|Kubernetes|Docker|monitoring)\b/i.test(
      content,
    );
  const hasCloudStack =
    /\b(AWS|Amazon Web Services|Azure|GCP|Google Cloud|Kubernetes|Terraform)\b/i.test(
      content,
    );
  const hasOperations =
    /\b(infrastructure|platform|DevOps|SRE|reliability|operations|deployment|CI[ /-]?CD)\b/i.test(
      content,
    );
  const hasReliability =
    /\b(observability|monitoring|on[ -]?call|incident response|availability|resilien(?:ce|t)|reliability|SLOs?|SLIs?)\b/i.test(
      content,
    );
  const hasDataOrModelStack =
    /\b(models?|modelling|data|analytics|Python|PyTorch|TensorFlow|scikit|algorithms?|inference|NLP|computer vision)\b/i.test(
      content,
    );
  const hasGenAiStack =
    /\b(language models?|natural language|NLP|inference|semantic search|AI assistants?|copilots?|agents?|vector|embeddings?|transformers?|chatbots?)\b/i.test(
      content,
    );
  const hasDataOperations =
    /\b(data pipelines?|orchestration|workflows?|data infrastructure|feature engineering|model training|distributed training|ETL)\b/i.test(
      content,
    );
  const hasTechnicalSecurity =
    /\b(security|IAM|identity and access|vulnerabilit|threat|SOC|compliance)\b/i.test(
      content,
    ) &&
    /\b(cloud|software|application|product|information|cyber|engineer|analyst|infrastructure|network)\b/i.test(
      content,
    );

  add("MLOps", hasMachineLearning && hasProductionStack);
  add(
    "Machine Learning",
    categories.includes("Artificial Intelligence") && hasDataOrModelStack,
  );
  add(
    "Data Science",
    (categories.includes("Artificial Intelligence") ||
      categories.includes("Machine Learning")) &&
      hasDataOrModelStack,
  );
  add(
    "Generative AI",
    categories.includes("Artificial Intelligence") && hasGenAiStack,
  );
  add(
    "MLOps",
    (categories.includes("Artificial Intelligence") ||
      categories.includes("Machine Learning")) &&
      (hasProductionStack || hasDataOperations),
  );
  add("DevOps", hasCloudStack && hasOperations);
  add("Cloud Engineering", hasCloudStack && hasOperations);
  add("Platform Engineering", hasCloudStack && hasOperations);
  add("Site Reliability Engineering", hasOperations && hasReliability);
  add("Cybersecurity", hasTechnicalSecurity);
  return categories;
}

function skillsFor(title, description) {
  const content = `${title}\n${description}`;
  return skillPatterns
    .filter(([, pattern]) => pattern.test(content))
    .map(([skill]) => skill)
    .slice(0, 8);
}

function isFresh(publishedAt) {
  const published = timestamp(publishedAt);
  return published >= cutoff && published <= now + 24 * 60 * 60 * 1000;
}

function parseGreenhouse(candidate) {
  const urls = [candidate.apply_url, candidate.url].filter(Boolean);
  let board = "";
  let jobId = "";
  for (const value of urls) {
    try {
      const url = new URL(value);
      board ||= url.searchParams.get("for") ?? "";
      jobId ||= url.searchParams.get("token") ?? "";
      const parts = url.pathname.split("/").filter(Boolean);
      const jobsIndex = parts.indexOf("jobs");
      if (!board && jobsIndex > 0) board = parts[jobsIndex - 1];
      if (!jobId && jobsIndex >= 0) jobId = parts[jobsIndex + 1] ?? "";
    } catch {
      // Ignore malformed discovery URLs.
    }
  }
  return board && jobId ? { board, jobId } : null;
}

async function greenhouseDetail(candidate) {
  const parsed = parseGreenhouse(candidate);
  if (!parsed) return null;
  const detail = await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(parsed.board)}/jobs/${encodeURIComponent(parsed.jobId)}`,
  );
  if (!detail) return null;
  const publishedAt = detail.first_published || detail.updated_at;
  if (!isFresh(publishedAt)) return null;
  if (detail.application_deadline && timestamp(detail.application_deadline) <= now) {
    return null;
  }
  return {
    title: detail.title,
    companyName: detail.company_name || candidate.company,
    description: stripHtml(detail.content),
    location: detail.location?.name || candidate.location || "Location not disclosed",
    publishedAt,
    expiresAt:
      detail.application_deadline ||
      new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicationUrl: detail.absolute_url || candidate.apply_url || candidate.url,
    sourceUrl: detail.absolute_url || candidate.url,
    sourceName: "Greenhouse",
    employmentType: candidate.job_type,
    workplaceType: candidate.workplace_type,
    isRemote: candidate.workplace_type === "remote",
    salaryMinimum: 0,
    salaryMaximum: 0,
    salaryCurrency: "INR",
    salaryPeriod: "annual",
  };
}

async function leverDetail(candidate) {
  let company;
  let jobId;
  try {
    const url = new URL(candidate.url);
    const parts = url.pathname.split("/").filter(Boolean);
    [company, jobId] = parts;
  } catch {
    return null;
  }
  if (!company || !jobId) return null;
  const detail = await fetchJson(
    `https://api.lever.co/v0/postings/${encodeURIComponent(company)}/${encodeURIComponent(jobId)}`,
  );
  if (!detail) return null;
  const publishedAt = new Date(Number(detail.createdAt)).toISOString();
  if (!isFresh(publishedAt)) return null;
  const description = [
    detail.openingPlain,
    detail.descriptionPlain,
    ...(detail.lists ?? []).flatMap((list) => [
      list.text,
      stripHtml(list.content || ""),
    ]),
    detail.additionalPlain,
  ]
    .filter(Boolean)
    .join("\n");
  const salary = detail.salaryRange ?? {};
  return {
    title: detail.text,
    companyName: candidate.company,
    description,
    location:
      detail.categories?.location ||
      detail.country ||
      candidate.location ||
      "Location not disclosed",
    publishedAt,
    expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicationUrl: detail.applyUrl || candidate.apply_url || candidate.url,
    sourceUrl: detail.hostedUrl || candidate.url,
    sourceName: "Lever",
    employmentType: detail.categories?.commitment || candidate.job_type,
    workplaceType: detail.workplaceType || candidate.workplace_type,
    isRemote: detail.workplaceType === "remote",
    salaryMinimum: Number(salary.min ?? 0),
    salaryMaximum: Number(salary.max ?? 0),
    salaryCurrency: salary.currency || "INR",
    salaryPeriod: salary.interval || "annual",
  };
}

const ashbyBoardCache = new Map();

async function ashbyDetail(candidate) {
  let board;
  let jobId;
  try {
    const url = new URL(candidate.url);
    const parts = url.pathname.split("/").filter(Boolean);
    [board, jobId] = parts;
  } catch {
    return null;
  }
  if (!board || !jobId) return null;
  if (!ashbyBoardCache.has(board)) {
    ashbyBoardCache.set(
      board,
      fetchJson(
        `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}?includeCompensation=true`,
      ),
    );
  }
  const payload = await ashbyBoardCache.get(board);
  const detail = payload?.jobs?.find(
    (job) => job.id === jobId || job.jobUrl?.includes(jobId),
  );
  if (!detail?.isListed || !isFresh(detail.publishedAt)) return null;
  const compensation = detail.compensation?.compensationTierSummary ?? "";
  const salaryNumbers = [...String(compensation).matchAll(/([\d,.]+)/g)].map(
    (match) => Number(match[1].replaceAll(",", "")),
  );
  return {
    title: detail.title,
    companyName: candidate.company,
    description: detail.descriptionPlain || stripHtml(detail.descriptionHtml),
    location: detail.location || candidate.location || "Location not disclosed",
    publishedAt: detail.publishedAt,
    expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicationUrl: detail.applyUrl || candidate.apply_url || candidate.url,
    sourceUrl: detail.jobUrl || candidate.url,
    sourceName: "Ashby",
    employmentType: detail.employmentType || candidate.job_type,
    workplaceType: detail.workplaceType || candidate.workplace_type,
    isRemote: Boolean(detail.isRemote),
    salaryMinimum: salaryNumbers[0] ?? 0,
    salaryMaximum: salaryNumbers[1] ?? salaryNumbers[0] ?? 0,
    salaryCurrency:
      String(compensation).match(/\b(USD|CAD|EUR|GBP|INR)\b/)?.[1] || "INR",
    salaryPeriod: /hour/i.test(compensation) ? "hourly" : "annual",
  };
}

async function fetchDetail(candidate) {
  if (candidate.ats_type === "greenhouse") return greenhouseDetail(candidate);
  if (candidate.ats_type === "lever") return leverDetail(candidate);
  if (candidate.ats_type === "ashbyhq") return ashbyDetail(candidate);
  return null;
}

function normalise(candidate, detail) {
  if (
    !detail?.description ||
    seniorTitlePattern.test(detail.title) ||
    irrelevantTitlePattern.test(detail.title)
  ) {
    return null;
  }
  const experience = extractEligibleExperience({
    title: detail.title,
    description: detail.description,
    experienceText: "Mid level",
    experienceMinimum: 0,
    experienceMaximum: 0,
  });
  if (!experience) return null;
  const categories = categoriesFor(detail.title, detail.description);
  if (!categories.length) return null;
  const locationText = detail.location.replace(/\s+/g, " ").trim();
  const isIndia = indiaPattern.test(locationText);
  const published = timestamp(detail.publishedAt);
  const sourceUrl = detail.sourceUrl;
  if (
    !/^https:\/\//.test(sourceUrl) ||
    !/^https:\/\//.test(detail.applicationUrl) ||
    timestamp(detail.expiresAt) <= now
  ) {
    return null;
  }
  const hash = createHash("sha1").update(sourceUrl).digest("hex").slice(0, 10);
  const companyName = decodeEntities(detail.companyName || candidate.company);
  const salaryMinimum = Number(detail.salaryMinimum || 0);
  const salaryMaximum = Number(detail.salaryMaximum || 0);
  const salaryDisclosed = salaryMinimum > 0 || salaryMaximum > 0;
  return {
    id: `ats-${hash}`,
    slug: `${slugify(detail.title)}-${slugify(companyName)}-${hash}`,
    title: decodeEntities(detail.title),
    companyId: slugify(companyName),
    companyName,
    companyLogo: initials(companyName),
    companyLogoUrl: "",
    category: categories[0],
    categories,
    subcategory: categories[0],
    description: detail.description.slice(0, 2200),
    responsibilities: [],
    qualifications: [],
    preferredQualifications: [],
    skills: skillsFor(detail.title, detail.description),
    country: isIndia ? "India" : "Worldwide",
    state: "",
    city: locationText,
    locationText,
    regionType: isIndia
      ? "India"
      : detail.isRemote
        ? "Remote worldwide"
        : "Outside India",
    workplaceType: workplaceType(detail.workplaceType, detail.isRemote),
    employmentType: employmentType(detail.employmentType),
    experienceMinimum: experience.minimum,
    experienceMaximum: experience.maximum,
    experienceText: experience.text,
    salaryMinimum,
    salaryMaximum,
    salaryCurrency: detail.salaryCurrency,
    salaryPeriod: detail.salaryPeriod,
    salaryDisclosed,
    visaSponsorship: false,
    relocationAssistance: false,
    sourceName: detail.sourceName,
    sourceType: "Public job API",
    sourceUrl,
    applicationUrl: detail.applicationUrl,
    publishedAt: new Date(published).toISOString(),
    discoveredAt: candidate.posted_at,
    lastVerifiedAt: new Date(now).toISOString(),
    expiresAt: new Date(detail.expiresAt).toISOString(),
    isVerified: true,
    isFeatured: false,
    isActive: true,
    isEasyApply: false,
    daysAgo: Math.max(
      0,
      Math.floor((now - published) / (24 * 60 * 60 * 1000)),
    ),
  };
}

async function discoverQuery(query, country, maxPages) {
  const found = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const url = new URL(DISCOVERY_API);
    url.searchParams.set("search", query);
    if (country) url.searchParams.set("country", country);
    url.searchParams.set("sort", "newest");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "20");
    const payload = await fetchJson(url);
    const jobs = payload?.jobs ?? [];
    if (!jobs.length) break;
    found.push(
      ...jobs.filter(
        (job) =>
          supportedAts.has(job.ats_type) &&
          !seniorTitlePattern.test(job.title) &&
          isFresh(job.posted_at),
      ),
    );
    if (jobs.length < 20) break;
    await sleep(350);
  }
  process.stdout.write(
    `Discovery ${country || "global"} · ${query}: ${found.length}\n`,
  );
  return found;
}

async function runPool(items, worker, concurrency) {
  let cursor = 0;
  const results = [];
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  );
  return results;
}

const activeDiscoveryQueries =
  process.env.SOFTWARE_ONLY === "true"
    ? discoveryQueries.slice(0, discoveryQueries.indexOf("systems engineer"))
    : discoveryQueries;
const discoveryTasks = activeDiscoveryQueries.flatMap((query) => [
  { query, country: "IN", pages: MAX_INDIA_PAGES },
  { query, country: "", pages: MAX_DISCOVERY_PAGES },
]);
const discovered = (
  await runPool(
    discoveryTasks,
    ({ query, country, pages }) => discoverQuery(query, country, pages),
    1,
  )
).flat();

const candidates = [
  ...new Map(discovered.map((candidate) => [candidate.url, candidate])).values(),
].sort((a, b) => {
  const aIndia = indiaPattern.test(a.location || "") ? 1 : 0;
  const bIndia = indiaPattern.test(b.location || "") ? 1 : 0;
  return bIndia - aIndia || timestamp(b.posted_at) - timestamp(a.posted_at);
});

process.stdout.write(`Fetching ${candidates.length} unique ATS details...\n`);
let processed = 0;
const atsJobs = (
  await runPool(
    candidates,
    async (candidate) => {
      const detail = await fetchDetail(candidate);
      processed += 1;
      if (processed % 100 === 0) {
        process.stdout.write(`Verified ${processed}/${candidates.length} ATS jobs\n`);
      }
      return detail ? normalise(candidate, detail) : null;
    },
    MAX_CONCURRENCY,
  )
).filter(Boolean);

const existing = JSON.parse(await readFile("data/jobs.json", "utf8"));
const currentExisting = existing.jobs
  .filter(
    (job) =>
      job.isActive &&
      timestamp(job.publishedAt) >= cutoff &&
      timestamp(job.expiresAt) > now &&
      job.experienceMinimum >= 1 &&
      job.experienceMinimum <= 4 &&
      !seniorTitlePattern.test(job.title) &&
      !irrelevantTitlePattern.test(job.title),
  )
  .map((job) => {
    const categories = [
      ...new Set([
        ...job.categories,
        ...categoriesFor(job.title, job.description),
      ]),
    ];
    return { ...job, category: categories[0], categories };
  });
const allJobs = [
  ...new Map(
    [...currentExisting, ...atsJobs].map((job) => [
      `${job.companyId}:${job.title.toLowerCase().replace(/\W+/g, "")}`,
      job,
    ]),
  ).values(),
];

const categoryNames = Object.keys(categoryPatterns);
const selected = [];
const selectedIds = new Set();
const counts = Object.fromEntries(categoryNames.map((category) => [category, 0]));

function addJob(job) {
  if (selectedIds.has(job.id)) return;
  selectedIds.add(job.id);
  selected.push(job);
  for (const category of job.categories) counts[category] += 1;
}

for (const job of currentExisting) addJob(job);

const remaining = allJobs
  .filter((job) => !selectedIds.has(job.id))
  .sort((a, b) => {
    const aIndia = a.regionType === "India" ? 1 : 0;
    const bIndia = b.regionType === "India" ? 1 : 0;
    return bIndia - aIndia || a.daysAgo - b.daysAgo;
  });

while (Object.values(counts).some((count) => count < TARGET_PER_CATEGORY)) {
  let bestIndex = -1;
  let bestScore = 0;
  for (let index = 0; index < remaining.length; index += 1) {
    const job = remaining[index];
    const categoryScore = job.categories.reduce(
      (score, category) =>
        score + Math.max(0, TARGET_PER_CATEGORY - counts[category]),
      0,
    );
    const indiaBonus = job.regionType === "India" ? TARGET_PER_CATEGORY : 0;
    const score = categoryScore + indiaBonus - job.daysAgo / 100;
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  }
  if (bestIndex < 0 || bestScore <= 0) break;
  addJob(remaining.splice(bestIndex, 1)[0]);
}

let indiaCount = selected.filter((job) => job.regionType === "India").length;
for (const job of remaining) {
  if (indiaCount >= INDIA_TARGET) break;
  if (job.regionType !== "India") continue;
  addJob(job);
  indiaCount += 1;
}

const finalCounts = Object.fromEntries(
  categoryNames.map((category) => [
    category,
    selected.filter((job) => job.categories.includes(category)).length,
  ]),
);
const missing = Object.entries(finalCounts).filter(
  ([, count]) => count < TARGET_PER_CATEGORY,
);
if (missing.length) {
  throw new Error(
    `Unable to meet category targets: ${missing.map(([category, count]) => `${category}=${count}`).join(", ")}. Eligible ATS jobs=${atsJobs.length}`,
  );
}

selected.sort(
  (a, b) =>
    Number(b.regionType === "India") - Number(a.regionType === "India") ||
    a.daysAgo - b.daysAgo,
);
const jobs = selected.map((job, index) => ({
  ...job,
  isFeatured: index < 6,
}));

await writeFile(
  "data/jobs.json",
  `${JSON.stringify(
    {
      ...existing,
      fetchedAt: new Date(now).toISOString(),
      cutoffDate: new Date(cutoff).toISOString(),
      source: {
        name: "Public ATS feeds",
        url: "https://github.com/shivam2003-dev/joborbit-ai",
        api: "Greenhouse, Lever, Ashby and Himalayas public job APIs",
      },
      sources: [
        { name: "Himalayas", url: "https://himalayas.app/jobs" },
        { name: "Greenhouse", url: "https://www.greenhouse.com/" },
        { name: "Lever", url: "https://www.lever.co/" },
        { name: "Ashby", url: "https://www.ashbyhq.com/" },
      ],
      counts: finalCounts,
      jobs,
    },
    null,
    2,
  )}\n`,
);

process.stdout.write(
  `Expanded to ${jobs.length} eligible jobs (${indiaCount} India). Category counts: ${JSON.stringify(finalCounts)}\n`,
);
