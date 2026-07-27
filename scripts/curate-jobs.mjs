import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extractEligibleExperience, isRelevantDevOpsTitle } from "./job-quality.mjs";

const source = process.argv.includes("--restore-head")
  ? execFileSync("git", ["show", "HEAD:data/jobs.json"], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    })
  : await readFile("data/jobs.json", "utf8");
const data = JSON.parse(source);
const jobs = data.jobs
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

const categoryNames = Object.keys(data.counts);
const counts = Object.fromEntries(
  categoryNames.map((category) => [
    category,
    jobs.filter((job) => job.categories.includes(category)).length,
  ]),
);

await writeFile(
  "data/jobs.json",
  `${JSON.stringify({ ...data, counts, jobs }, null, 2)}\n`,
);

process.stdout.write(
  `Curated ${jobs.length} active jobs with a stated minimum of 1–4 years. ${JSON.stringify(counts)}\n`,
);
