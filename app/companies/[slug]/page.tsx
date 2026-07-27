import SitePage from "@/app/site-page";
import { COMPANIES } from "@/lib/job-data";

export function generateStaticParams() {
  return COMPANIES.map((company) => ({ slug: company.id }));
}

export const dynamicParams = false;
export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SitePage route={["companies", slug]} />;
}
