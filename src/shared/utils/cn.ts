import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and twMerge for Tailwind deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Utility to safely access nested object properties
 */
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
}

/**
 * Utility to create CSS variable string
 */
export function cssVar(name: string, value: string): Record<string, string> {
  return { [`--${name}`]: value };
}

/**
 * Utility to format class names for better readability
 */
export function formatClassName(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
