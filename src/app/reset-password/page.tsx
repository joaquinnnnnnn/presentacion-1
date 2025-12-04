import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-emerald-50">
          <p className="text-sm text-gray-600">Cargando formulario...</p>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
