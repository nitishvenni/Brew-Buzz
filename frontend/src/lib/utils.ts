import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatCompactCurrency(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatNumber(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat('en-IN').format(num);
}
