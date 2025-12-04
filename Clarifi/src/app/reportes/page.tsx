export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import ReportsView from "@/components/views/reports-view";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando reportes...</div>}>
      <ReportsView />
    </Suspense>
  );
}
