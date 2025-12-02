import React from "react";
import { ComponentType } from "../types";

export const COMPONENT_SVG: Partial<Record<ComponentType, React.ReactNode>> = {
  [ComponentType.RESISTOR]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect x="16" y="28" width="32" height="8" rx="4" fill="#8B4513" />
      <rect x="20" y="26" width="4" height="12" fill="#b45309" />
      <rect x="28" y="26" width="4" height="12" fill="#000" />
      <rect x="36" y="26" width="4" height="12" fill="#dc2626" />
      <circle cx="12" cy="32" r="2" fill="#94a3b8" />
      <circle cx="52" cy="32" r="2" fill="#94a3b8" />
    </svg>
  ),
  [ComponentType.CAPACITOR]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect x="24" y="20" width="16" height="24" fill="#1f2937" />
      <rect x="38" y="20" width="2" height="24" fill="#94a3b8" />
      <circle cx="16" cy="32" r="2" fill="#94a3b8" />
      <circle cx="48" cy="32" r="2" fill="#94a3b8" />
    </svg>
  ),
  [ComponentType.LED]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="12" fill="#ef4444" />
      <circle cx="32" cy="32" r="12" fill="url(#glow)" opacity="0.6" />
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="32" r="2" fill="#94a3b8" />
      <circle cx="48" cy="32" r="2" fill="#94a3b8" />
    </svg>
  ),
  [ComponentType.VOLTAGE_SOURCE]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <line x1="22" y1="22" x2="22" y2="42" stroke="#e5e7eb" strokeWidth="3" />
      <line x1="42" y1="26" x2="42" y2="38" stroke="#e5e7eb" strokeWidth="3" />
      <text x="28" y="20" fontSize="10" fill="#64748b">V</text>
    </svg>
  ),
  [ComponentType.CURRENT_SOURCE]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="12" stroke="#e5e7eb" strokeWidth="2" fill="none" />
      <path d="M32 24 L32 40 M32 24 L28 28 M32 24 L36 28" stroke="#e5e7eb" strokeWidth="2" fill="none" />
    </svg>
  ),
  [ComponentType.GROUND]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <line x1="32" y1="24" x2="32" y2="40" stroke="#e5e7eb" strokeWidth="2" />
      <line x1="26" y1="40" x2="38" y2="40" stroke="#e5e7eb" strokeWidth="2" />
      <line x1="28" y1="44" x2="36" y2="44" stroke="#e5e7eb" strokeWidth="2" />
      <line x1="30" y1="48" x2="34" y2="48" stroke="#e5e7eb" strokeWidth="2" />
    </svg>
  ),
  [ComponentType.OPAMP]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <polygon points="20,16 20,48 48,32" fill="#0ea5e9" />
      <text x="22" y="14" fontSize="10" fill="#94a3b8">OP</text>
      <circle cx="18" cy="28" r="2" fill="#94a3b8" />
      <circle cx="18" cy="36" r="2" fill="#94a3b8" />
      <circle cx="50" cy="32" r="2" fill="#94a3b8" />
    </svg>
  ),
  [ComponentType.BUTTON]: (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect x="24" y="24" width="16" height="16" rx="4" fill="#84cc16" />
      <circle cx="32" cy="32" r="4" fill="#d9f99d" />
    </svg>
  )
};

