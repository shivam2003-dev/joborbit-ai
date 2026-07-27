const seniorTitlePattern =
  /\b(senior|sr\.?|staff|principal|lead|manager|director|head|architect|vp|vice president|chief)\b/i;

const experiencePatterns = [
  /\b(?:minimum(?:\s+of)?|at least|min(?:imum)?\.?|requires?|required|experience\s*:?|have)\s*(\d{1,2})(?:\s*(?:-|–|—|to)\s*(\d{1,2}))?\+?\s*(?:years?|yrs?)\b/gi,
  /\b(\d{1,2})(?:\s*(?:-|–|—|to)\s*(\d{1,2}))?\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:relevant\s+|professional\s+|hands[- ]on\s+|industry\s+|work\s+|practical\s+|proven\s+|technical\s+)?experience\b/gi,
  /\b(?:experience|background)\s+(?:of\s+|with\s+|in\s+)?(?:at least\s+|minimum\s+of\s+)?(\d{1,2})(?:\s*(?:-|–|—|to)\s*(\d{1,2}))?\+?\s*(?:years?|yrs?)\b/gi,
];

export function extractEligibleExperience(job) {
  if (seniorTitlePattern.test(job.title)) return null;
  if (
    /^Minimum [1-4] (?:year|years)/.test(job.experienceText) &&
    job.experienceMinimum >= 1 &&
    job.experienceMinimum <= 4
  ) {
    return {
      minimum: job.experienceMinimum,
      maximum: job.experienceMaximum,
      text: job.experienceText,
    };
  }
  if (!["Entry level", "Mid level"].includes(job.experienceText)) return null;

  const matches = [];
  for (const pattern of experiencePatterns) {
    pattern.lastIndex = 0;
    for (const match of job.description.matchAll(pattern)) {
      const minimum = Number(match[1]);
      const maximum = Number(match[2] || match[1]);
      if (minimum >= 0 && minimum <= 20 && maximum >= minimum && maximum <= 20) {
        matches.push({ minimum, maximum });
      }
    }
  }

  if (!matches.length || matches.some((match) => match.minimum >= 5)) return null;
  const minimum = Math.max(...matches.map((match) => match.minimum));
  if (minimum < 1 || minimum > 4) return null;
  const matchingRanges = matches.filter((match) => match.minimum === minimum);
  const maximum = Math.max(...matchingRanges.map((match) => match.maximum));

  return {
    minimum,
    maximum,
    text:
      maximum > minimum
        ? `Minimum ${minimum} years · source range ${minimum}–${maximum} years`
        : `Minimum ${minimum} ${minimum === 1 ? "year" : "years"}`,
  };
}

export function isRelevantDevOpsTitle(title) {
  return /\b(devops|devsecops|site reliability|sre|platform engineer|cloud engineer|infrastructure engineer|release engineer|build engineer|ci[ /-]?cd)\b/i.test(
    title,
  );
}
