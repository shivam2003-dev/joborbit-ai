import type { Metadata } from "next";
import SitePage from "../site-page";

export const metadata: Metadata = {
  title: "Career Resources",
  description: "Practical resume, portfolio and interview guidance for engineers with 1 to 4 years of experience.",
};

export default function CareerResources() { return <SitePage route={["career-resources"]} />; }
