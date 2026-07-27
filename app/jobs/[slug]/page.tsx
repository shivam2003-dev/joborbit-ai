import type { Metadata } from "next";
import SitePage from "@/app/site-page";
import { JOBS, getJobBySlug } from "@/lib/job-data";

type JobPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return JOBS.map((job) => ({ slug: job.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return {};
  const title = `${job.title} at ${job.companyName}`;
  const description = `Explore this active ${job.title} role in ${job.locationText}, including skills, salary, source details and the original application link.`;
  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}/` },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "JobOrbit AI job discovery platform" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  const structuredData = job
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        datePosted: job.publishedAt,
        validThrough: job.expiresAt,
        employmentType: job.employmentType.toUpperCase().replace("-", "_"),
        hiringOrganization: {
          "@type": "Organization",
          name: job.companyName,
          sameAs: job.sourceUrl,
        },
        jobLocationType: job.workplaceType === "Remote" ? "TELECOMMUTE" : undefined,
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.city,
            addressRegion: job.state,
            addressCountry: job.country,
          },
        },
        baseSalary: job.salaryDisclosed
          ? {
              "@type": "MonetaryAmount",
              currency: job.salaryCurrency,
              value: {
                "@type": "QuantitativeValue",
                minValue: job.salaryMinimum,
                maxValue: job.salaryMaximum,
                unitText: "YEAR",
              },
            }
          : undefined,
      }
    : null;
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
        />
      )}
      <SitePage route={["jobs", slug]} />
    </>
  );
}
