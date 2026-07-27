import type { Metadata } from "next";
import SitePage from "../site-page";

export const metadata: Metadata = {
  title: "Salary Insights",
  description: "Source-backed salary information converted to Indian rupees for active early-career AI, DevOps, cloud and MLOps jobs.",
};

export default function SalaryInsights() { return <SitePage route={["salary-insights"]} />; }
