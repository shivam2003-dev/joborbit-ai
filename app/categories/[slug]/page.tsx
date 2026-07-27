import SitePage from "@/app/site-page";
import { CATEGORIES } from "@/lib/job-data";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export const dynamicParams = false;
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SitePage route={["categories", slug]} />;
}
