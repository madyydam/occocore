# UX Design System, Command Palette & Guided Tour Specifications

This document defines the visual design system, interaction patterns, keyboard shortcuts, and interactive guided tour scripts.

---

## 1. Design System Tokens & Foundations

The design system blends the operational density of **Linear** with the clean typography of **Notion**:

- **Font Hierarchy**:
  - Primary UI Font: `Plus Jakarta Sans`, sans-serif (Weights: 400, 500, 600, 700)
  - Numeric / Tabular / Monospace: `JetBrains Mono` (Weights: 500, 700) for Roll numbers, PRNs, and Currency
- **Color Palettes**:
  - Light Mode: Neutral slate canvas (`bg-slate-50`), crisp white cards (`bg-white`), slate borders (`border-slate-200`)
  - Dark Mode: Deep obsidian surface (`bg-slate-950`), elevated card surfaces (`bg-slate-900`), subtle borders (`border-slate-800`)
  - Primary Brand Accent: Dynamic CSS Variable (`--tenant-primary`) with fallback Indigo (`#4F46E5`)
  - Status Semantics:
    - Success (Present, Paid): Emerald (`#10B981`)
    - Warning (Tardy, Grace Period): Amber (`#F59E0B`)
    - Danger (Absent, Defaulter, Expelled): Rose (`#F43F5E`)
    - Info / Neutral (Elective, Notice): Sky (`#0EA5E9`)

---

## 2. Universal Command Palette (Ctrl + K / Cmd + K)

A global spotlight overlay allowing staff to execute actions without touching the mouse:

```
[ Search anything: students, invoices, classes, settings... (Ctrl+K) ]
───────────────────────────────────────────────────────────────────────
Quick Actions:
  ⚡ Mark Today's Roll Call            (Press A)
  ⚡ Collect Cash Fee                  (Press F)
  ⚡ Enter Exam Scores                 (Press M)
  ⚡ Create New Student Admission      (Press N)

Recently Visited:
  👤 Aarav Sharma (Class 10-A, Roll: 14)
  📄 Invoice #DPS/INV/2026/0491 (Unpaid)
  📅 Time Table - Class 9-B

Jump to Section:
  ⚙️  General Settings & Branding
  📊 Examination Tabulation Sheet
  🚌 Transport Route 4 (North Campus)
```

---

## 3. Interactive Guided Tours (Driver.js Integration)

To eliminate staff training barriers, first-time logins trigger an automated, spotlight-driven interactive tour:

### Tour 1: Institute Admin First-Day Walkthrough (5 Steps)
1. **Welcome Step**:
   - Element: Modal Center
   - Text: *"Welcome to your institute's new ERP portal! Let's take a 60-second tour of your command center."*
2. **Executive KPI Cards**:
   - Element: `#stat-kpi-grid`
   - Text: *"Here is your pulse check: Real-time student attendance %, daily fee collected, and active faculty."*
3. **Academic Structure & Classes**:
   - Element: `#nav-academics`
   - Text: *"Manage your standards, sections, and subjects here. We've pre-configured your default classes."*
4. **Admissions & Student Roll**:
   - Element: `#nav-students`
   - Text: *"Click here to view your student directory, issue Transfer Certificates, or upload bulk student CSVs."*
5. **Universal Command Bar**:
   - Element: `#global-command-palette-trigger`
   - Text: *"Tip: Press Ctrl + K anywhere to search for any student, invoice, or setting instantly!"*

### Tour 2: Teacher 30-Second Roll Call Walkthrough (3 Steps)
1. **Daily Roll Call Card**:
   - Element: `#btn-quick-rollcall`
   - Text: *"Your assigned classroom is ready. Click here to open today's attendance sheet."*
2. **1-Click Bulk Action**:
   - Element: `#btn-mark-all-present`
   - Text: *"Click 'Mark All Present' to fill everyone as Present in 1 click, then simply tap absent students."*
3. **Offline Sync Status Pill**:
   - Element: `#network-status-pill`
   - Text: *"No Wi-Fi? No problem! The ERP saves attendance locally and syncs automatically when reconnected."*

---

## 4. Accessibility & Micro-Interactions

- **WCAG 2.1 AA Compliance**: All text elements maintain a minimum contrast ratio of 4.5:1 against backgrounds.
- **Keyboard Navigation**: Form grids support Arrow navigation, Tab navigation, and Enter key execution.
- **Undo Snackbar**: Destructive actions (e.g. deleting an optional fee head) display a 5-second Sonner toast with an "Undo" button before permanently executing.
