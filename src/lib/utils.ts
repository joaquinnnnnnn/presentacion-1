import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases tailwind (utilizada por componentes shadcn/ui) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea montos guardados en CLP y convierte si se muestra en USD */
export function formatCurrency(
  amountCLP: number,
  currency: "CLP" | "USD",
  fxRateUSDPerCLP: number = 0.00106 // fallback: 1000 CLP ≈ 1.06 USD
) {
  const value = currency === "USD" ? amountCLP * fxRateUSDPerCLP : amountCLP;

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "CLP",
    maximumFractionDigits: currency === "USD" ? 2 : 0,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value);
}
