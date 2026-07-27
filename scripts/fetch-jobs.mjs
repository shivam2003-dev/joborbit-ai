import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extractEligibleExperience, isRelevantDevOpsTitle } from "./job-quality.mjs";

const API_URL = "https://himalayas.app/jobs/api/search";
const TARGET_PER_CATEGORY = 110;
const MAX_PAGES_PER_QUERY = 9;
const MAX_CONCURRENCY = 2;
const FORTY_FIVE_DAYS_MS = 45 * 24 * 60 * 60 * 1000;
const now = Date.now();
const cutoff = now - FORTY_FIVE_DAYS_MS;

const categoryQueries = {
  "Artificial Intelligence": [
    "artificial intelligence",
    "AI engineer",
    "applied scientist",
    "AI research",
  ],
  "Machine Learning": [
    "machine learning",
    "machine learning engineer",
    "ML engineer",
    "computer vision",
  ],
  "Generative AI": [
    "generative AI",
    "large language model",
    "LLM",
    "prompt engineer",
    "NLP engineer",
  ],
  "Data Science": [
    "data science",
    "data scientist",
    "analytics engineer",
    "data analytics",
  ],
  DevOps: [
    "devops",
    "infrastructure engineer",
    "CI CD engineer",
    "release engineer",
  ],
  MLOps: [
    "MLOps",
    "machine learning platform",
    "AI platform",
    "ML infrastructure",
    "data platform engineer",
  ],
  "Site Reliability Engineering": [
    "site reliability engineer",
    "SRE",
    "reliability engineer",
    "production engineer",
  ],
  "Platform Engineering": [
    "platform engineer",
    "developer platform",
    "infrastructure platform",
    "developer experience engineer",
  ],
  "Cloud Engineering": [
    "cloud engineer",
    "cloud infrastructure",
    "AWS engineer",
    "Azure engineer",
    "cloud architect",
  ],
  Cybersecurity: [
    "cybersecurity",
    "security engineer",
    "cloud security",
    "DevSecOps",
    "application security",
  ],
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
  ["TypeScript", /\btypescript\b/i],
  ["GitHub Actions", /github actions/i],
  ["Jenkins", /\bjenkins\b/i],
  ["GitLab CI", /gitlab ci/i],
  ["Prometheus", /\bprometheus\b/i],
  ["Grafana", /\bgrafana\b/i],
  ["Datadog", /\bdatadog\b/i],
  ["PyTorch", /\bpytorch\b/i],
  ["TensorFlow", /\btensorflow\b/i],
  ["LLM", /\bllms?\b|large language model/i],
  ["RAG", /\brag\b|retrieval.augmented generation/i],
  ["LangChain", /\blangchain\b/i],
  ["OpenAI", /\bopenai\b/i],
  ["SQL", /\bsql\b/i],
  ["Snowflake", /\bsnowflake\b/i],
  ["Spark", /\bapache spark\b|\bspark\b/i],
  ["Kafka", /\bkafka\b/i],
  ["Security", /\bcybersecurity\b|\binformation security\b|\bsecurity\b/i],
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "JobOrbitAI/1.0 (+https://github.com/shivam2003-dev/joborbit-ai)",
        },
        signal: AbortSignal.timeout(35_000),
      });
      if (response.ok) return await response.json();
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const retryAfter = Number(response.headers.get("retry-after") ?? 0) * 1000;
      await sleep(Math.max(retryAfter, attempt * 7_000));
    } catch (error) {
      if (attempt === 6) throw error;
      await sleep(attempt * 7_000);
    }
  }
  throw new Error(`Unable to fetch ${url}`);
}

function timestampMs(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;
}

function isCurrent(job) {
  const published = timestampMs(job.pubDate);
  const expires = timestampMs(job.expiryDate);
  return (
    published >= cutoff &&
    published <= now + 24 * 60 * 60 * 1000 &&
    expires > now &&
    /^https:\/\//.test(job.applicationLink ?? "") &&
    /^https:\/\//.test(job.guid ?? "")
  );
}

function decodeEntities(value) {
  const decoded = value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
  if (!/[ÃÂ]/.test(decoded)) return decoded;
  const repaired = Buffer.from(decoded, "latin1").toString("utf8");
  return repaired.includes("�") ? decoded : repaired;
}

function stripHtml(value = "") {
  return decodeEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function listItems(value = "") {
  return [...value.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter((item) => item.length > 20 && item.length < 360)
    .slice(0, 6);
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

function experience(seniority = []) {
  const joined = seniority.join(" ").toLowerCase();
  if (joined.includes("executive")) return [10, 15, "Executive"];
  if (joined.includes("director")) return [8, 12, "Director"];
  if (joined.includes("manager")) return [6, 10, "Manager"];
  if (joined.includes("senior")) return [5, 8, "Senior level"];
  if (joined.includes("mid")) return [2, 5, "Mid level"];
  if (joined.includes("entry")) return [0, 2, "Entry level"];
  return [0, 0, "Experience not disclosed"];
}

function employmentType(value = "") {
  const normalized = value.toLowerCase();
  if (normalized.includes("part")) return "Part-time";
  if (normalized.includes("contract")) return "Contract";
  if (normalized.includes("intern")) return "Internship";
  if (normalized.includes("temporary")) return "Contract";
  return "Full-time";
}

function normalise(job, matchedCategories, index) {
  const published = timestampMs(job.pubDate);
  const expires = timestampMs(job.expiryDate);
  const description = stripHtml(job.description || job.excerpt || "");
  const content = `${job.title} ${description} ${(job.categories ?? []).join(" ")}`;
  const extractedSkills = skillPatterns
    .filter(([, pattern]) => pattern.test(content))
    .map(([name]) => name)
    .slice(0, 8);
  const sourceTags = [...(job.categories ?? []), ...(job.parentCategories ?? [])]
    .map((tag) => String(tag).replaceAll("-", " "))
    .filter((tag) => tag.length >= 2 && tag.length <= 28);
  const skills = [...new Set([...extractedSkills, ...sourceTags])].slice(0, 8);
  const restrictions = job.locationRestrictions ?? [];
  const restrictionNames = restrictions.map((item) => item.name).filter(Boolean);
  const isIndia = restrictions.some((item) => item.alpha2 === "IN" || /india/i.test(item.name));
  const remoteWorldwide = restrictions.length === 0;
  const [experienceMinimum, experienceMaximum, experienceText] = experience(job.seniority);
  const hash = createHash("sha1").update(job.guid).digest("hex").slice(0, 10);
  const slug = `${slugify(job.title)}-${slugify(job.companyName)}-${hash}`;
  const categories = [...matchedCategories];
  const primaryCategory = categories[0];
  const salaryMinimum = Number(job.minSalary ?? 0);
  const salaryMaximum = Number(job.maxSalary ?? 0);
  const salaryDisclosed = salaryMinimum > 0 || salaryMaximum > 0;
  const daysAgo = Math.max(0, Math.floor((now - published) / (24 * 60 * 60 * 1000)));

  return {
    id: `live-${hash}`,
    slug,
    title: decodeEntities(job.title),
    companyId: slugify(job.companyName),
    companyName: decodeEntities(job.companyName),
    companyLogo: initials(job.companyName),
    companyLogoUrl: job.companyLogo || "",
    category: primaryCategory,
    categories,
    subcategory: (job.categories ?? [primaryCategory])[0],
    description: description.slice(0, 1800),
    responsibilities: listItems(job.description),
    qualifications: [],
    preferredQualifications: [],
    skills,
    country: restrictionNames[0] || "Worldwide",
    state: "",
    city: restrictionNames[0] || "Remote worldwide",
    locationText: restrictionNames.length ? restrictionNames.join(", ") : "Remote worldwide",
    regionType: isIndia ? "India" : remoteWorldwide ? "Remote worldwide" : "Outside India",
    workplaceType: "Remote",
    employmentType: employmentType(job.employmentType),
    experienceMinimum,
    experienceMaximum,
    experienceText,
    salaryMinimum,
    salaryMaximum,
    salaryCurrency: job.currency || "USD",
    salaryPeriod: job.salaryPeriod || "annual",
    salaryDisclosed,
    visaSponsorship: false,
    relocationAssistance: false,
    sourceName: "Himalayas",
    sourceType: "Public job API",
    sourceUrl: job.guid,
    applicationUrl: job.applicationLink,
    publishedAt: new Date(published).toISOString(),
    discoveredAt: new Date(published).toISOString(),
    lastVerifiedAt: new Date(now).toISOString(),
    expiresAt: new Date(expires).toISOString(),
    isVerified: true,
    isFeatured: index < 6,
    isActive: true,
    isEasyApply: false,
    daysAgo,
  };
}

const globalJobs = new Map();
const categoryIds = new Map(
  Object.keys(categoryQueries).map((category) => [category, new Set()]),
);

async function fetchCategory(category, queries) {
  const categorySet = categoryIds.get(category);
  for (const query of queries) {
    if (categorySet.size >= TARGET_PER_CATEGORY) break;
    for (let page = 1; page <= MAX_PAGES_PER_QUERY; page += 1) {
      if (categorySet.size >= TARGET_PER_CATEGORY) break;
      const url = new URL(API_URL);
      url.searchParams.set("q", query);
      url.searchParams.set("sort", "recent");
      url.searchParams.set("page", String(page));
      const payload = await fetchJson(url);
      const jobs = payload.jobs ?? [];
      if (!jobs.length) break;
      for (const job of jobs) {
        if (!isCurrent(job)) continue;
        const id = job.guid;
        categorySet.add(id);
        const existing = globalJobs.get(id);
        if (existing) {
          existing.categories.add(category);
        } else {
          globalJobs.set(id, { raw: job, categories: new Set([category]) });
        }
      }
      process.stdout.write(
        `${category}: ${categorySet.size}/${TARGET_PER_CATEGORY} (${query}, page ${page})\n`,
      );
      await sleep(1_500);
    }
  }
  if (categorySet.size < 100) {
    throw new Error(
      `${category} has only ${categorySet.size} current, non-expired jobs after all searches`,
    );
  }
}

async function runPool(entries) {
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const index = cursor;
      cursor += 1;
      const [category, queries] = entries[index];
      await fetchCategory(category, queries);
    }
  }
  await Promise.all(Array.from({ length: MAX_CONCURRENCY }, () => worker()));
}

await runPool(Object.entries(categoryQueries));

const records = [...globalJobs.values()]
  .sort((a, b) => timestampMs(b.raw.pubDate) - timestampMs(a.raw.pubDate))
  .map((entry, index) => normalise(entry.raw, entry.categories, index))
  .map((job) => {
    const experience = extractEligibleExperience(job);
    if (!experience) return null;
    const categories = job.categories.filter(
      (category) => category !== "DevOps" || isRelevantDevOpsTitle(job.title),
    );
    if (!categories.length) return null;
    return {
      ...job,
      category: categories[0],
      categories,
      experienceMinimum: experience.minimum,
      experienceMaximum: experience.maximum,
      experienceText: experience.text,
    };
  })
  .filter(Boolean)
  .map((job, index) => ({ ...job, isFeatured: index < 6 }));

const counts = Object.fromEntries(
  Object.keys(categoryQueries).map((category) => [
    category,
    records.filter((job) => job.categories.includes(category)).length,
  ]),
);

await mkdir("data", { recursive: true });
await writeFile(
  "data/jobs.json",
  `${JSON.stringify(
    {
      fetchedAt: new Date(now).toISOString(),
      cutoffDate: new Date(cutoff).toISOString(),
      source: {
        name: "Himalayas",
        url: "https://himalayas.app/jobs",
        api: "https://himalayas.app/jobs/api",
      },
      counts,
      jobs: records,
    },
    null,
    2,
  )}\n`,
);

process.stdout.write(
  `Fetched ${records.length} current jobs with a stated minimum of 1–4 years. Category counts: ${JSON.stringify(counts)}\n`,
);
