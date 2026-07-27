import { Suspense } from "react";
import JobOrbitApp from "@/components/job-orbit-app";

export default function SitePage({ route = [] }: { route?: string[] }) {
  return (
    <Suspense fallback={<div className="route-loading">Loading JobOrbit AI…</div>}>
      <JobOrbitApp route={route} />
    </Suspense>
  );
}
