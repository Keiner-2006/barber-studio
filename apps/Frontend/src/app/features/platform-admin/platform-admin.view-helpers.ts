import {
  BUSINESS_TYPE_LABELS,
  BusinessType,
  COUNTRY_NAMES,
  STATUS_CHIP_CLASSES,
  STATUS_DOT_CLASSES,
  TenantStatus,
} from './platform-admin.models';
import { PlatformAdminStore } from './platform-admin.store';

/**
 * True only when the platform catalogue is actually available. Screens must show
 * a placeholder instead of a number in every other case (first render, loading,
 * API error, demo mode) so no metric is ever fabricated.
 */
export function hasPlatformData(store: PlatformAdminStore): boolean {
  return !store.loading() && !store.offline() && store.totalTenants() !== null;
}

export function businessTypeLabel(type: BusinessType): string {
  return BUSINESS_TYPE_LABELS[type] ?? type;
}

export function countryName(code: string | null | undefined): string {
  if (!code) return '—';
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

export function statusChipClass(status: TenantStatus): string {
  return STATUS_CHIP_CLASSES[status] ?? 'bg-pa-surface-container text-pa-on-surface-variant';
}

export function statusDotClass(status: TenantStatus): string {
  return STATUS_DOT_CLASSES[status] ?? 'bg-pa-outline';
}

/** Relative label for an ISO timestamp. Never invents a value for an invalid date. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'fecha desconocida';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'fecha desconocida';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months === 1 ? '' : 'es'}`;
  const years = Math.floor(days / 365);
  return `hace ${years} año${years === 1 ? '' : 's'}`;
}

export function initials(text: string | null | undefined): string {
  if (!text) return '—';
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** Triggers a client-side download of a generated CSV. */
export function downloadCsv(csv: string | null): void {
  if (!csv) return;
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tenants-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
