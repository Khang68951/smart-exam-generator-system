---
name: SEGS Design System
description: Premium dark-mode design system with glassmorphic accents and high contrast academic typography.
colors:
  bg-base: "#0b0f19"
  bg-surface: "#111827"
  text-primary: "#f3f4f6"
  text-secondary: "#9ca3af"
  text-muted: "#6b7280"
  primary: "#6366f1"
  success: "#10b981"
  warning: "#f59e0b"
  info: "#3b82f6"
  accent: "#a855f7"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
  card:
    backgroundColor: "rgba(17, 24, 39, 0.7)"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System

## Overview
The SEGS design system is a high-security, professional dark-mode design built for academic concentration and absolute precision. It balances dark backgrounds with rich gradients and subtle glassmorphism to establish depth and structure, ensuring students and educators can focus without visual fatigue.

## Colors
Our palette utilizes depth-based layering:
- **Base Canvas**: Deep space dark (`#0b0f19`) to keep ambient light low.
- **Surface Elevation**: Semi-transparent dark surfaces (`rgba(17, 24, 39, 0.7)`) to represent cards and panels.
- **Accents**: Indigo (`#6366f1`), Purple (`#a855f7`), and Pink (`#ec4899`) gradients are used selectively for branding and major call-to-actions.
- **Status Indicators**: Clean, high-contrast greens, yellows, and blues for feedback and scoring metrics.

## Typography
We pair two Google Fonts:
- **Outfit**: Used exclusively for Display and Headings. Geometric, clean, and modern. Tighter letter spacing (`-0.02em`) is applied to large sizes.
- **Plus Jakarta Sans**: Used for body copy, labels, and input fields. Warm, highly legible, and optimized for reading long educational passages.

## Elevation
Instead of heavy drop shadows, we rely on border strokes and background tint transitions:
- **Borders**: Thin, semi-transparent borders (`rgba(255, 255, 255, 0.08)`) separate containers.
- **Subtle Glows**: Radial color gradients sit behind brand assets and panels to indicate system focus.
- **No Heavy Shadows**: Cards are flat but elevated using background contrast against the base canvas.

## Components
Key UI components adhere to the following principles:
- **Action Buttons**: Primary actions use rich gradient fills and transform scale transitions (0.98x scale on press).
- **Interactive Checkboxes**: Feature custom indicator rings and transition scale animations when selected.
- **Sliders**: Stylized tracks with hover-active indigo thumbs.
- **Sidebar & Workspace Panels**: Glass panels with `backdrop-filter: blur(12px)`.

## Do's and Don'ts
- **DO** use exact citations (`[P1]`) next to questions to maintain context grounding.
- **DO** keep line lengths between 65–75 characters (ch) for document readability.
- **DON'T** use gradient text combinations that compromise contrast ratios.
- **DON'T** use nested cards (cards inside cards); use border lines or background highlights instead.
- **DON'T** animate images or decoration items on hover; keep hover effects restricted to interactive controls.
