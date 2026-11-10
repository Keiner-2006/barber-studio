import { HttpErrorResponse } from '@angular/common/http';
import { BUSINESS_TYPE_LABELS, BusinessType, COUNTRY_NAMES, TENANT_STATUS_LABELS, TenantStatus } from './platform-admin.models';

export function businessTypeLabel(type: BusinessType): string {
  return BUSINESS_TYPE_LABELS[type] ?? type;
}

export function statusLabel(status: TenantStatus): string {
  return TENANT_STATUS_LABELS[status] ?? status;
}

export function countryName(code: string | null | undefined): string {
  if (!code) return '—';
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

/** Relative label for an ISO timestamp. Never invents a value for an invalid date. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'sin registro';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'sin registro';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months === 1 ? '' : 'es'}`;
  const years = Math.floor(days / 365);
  return `hace ${years} año${years === 1 ? '' : 's'}`;
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
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

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export function formatMoney(value: number | null | undefined): string {
  return money.format(value ?? 0);
}

/** Triggers a client-side download of a generated CSV. */
export function downloadCsv(csv: string | null): void {
  if (!csv) return;
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `negocios-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Best human message from an API error (AllExceptionsFilter → { error: { message } }). */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: { message?: string }; message?: string | string[] } | null;
    const msg = body?.error?.message ?? (Array.isArray(body?.message) ? body?.message[0] : body?.message);
    if (msg) return msg;
    if (err.status === 0) return 'No hay conexión con la API de plataforma';
    if (err.status === 403) return 'Tu cuenta no tiene permisos de administrador de plataforma';
    return `${fallback} (error ${err.status})`;
  }
  return fallback;
}
