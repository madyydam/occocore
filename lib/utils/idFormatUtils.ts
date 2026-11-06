export interface IdNumberingFormatConfig {
  prn: {
    prefix: string;
    separator: string;
    includeYear: boolean;
    yearFormat: "YYYY" | "YY";
    includeDept: boolean;
    seqDigits: number;
    customPattern?: string;
  };
  rollNo: {
    mode: "NUMERIC" | "FORMATTED";
    prefix: string;
    separator: string;
    includeYear: boolean;
    includeCohort: boolean;
    seqDigits: number;
    customPattern?: string;
  };
}

export const DEFAULT_ID_NUMBERING_CONFIG: IdNumberingFormatConfig = {
  prn: {
    prefix: "PRN",
    separator: "/",
    includeYear: true,
    yearFormat: "YYYY",
    includeDept: true,
    seqDigits: 4,
    customPattern: "{PREFIX}/{YEAR}/{DEPT}/{SEQ}",
  },
  rollNo: {
    mode: "NUMERIC",
    prefix: "ROLL",
    separator: "/",
    includeYear: false,
    includeCohort: false,
    seqDigits: 2,
    customPattern: "{SEQ}",
  },
};

export function buildPrnString(
  config: IdNumberingFormatConfig["prn"],
  params: { year?: number; dept?: string; seq: number }
): string {
  const prefix = config.prefix?.trim() || "PRN";
  const sep = config.separator !== undefined ? config.separator : "/";
  const yr = params.year || new Date().getFullYear();
  const yearStr = config.yearFormat === "YY" ? String(yr).slice(-2) : String(yr);
  const deptStr = config.includeDept && params.dept ? params.dept.toUpperCase() : (config.includeDept ? "CSE" : "");
  const seqStr = String(params.seq).padStart(config.seqDigits || 4, "0");

  if (config.customPattern && config.customPattern.trim()) {
    return config.customPattern
      .replace(/\{PREFIX\}/gi, prefix)
      .replace(/\{YEAR\}/gi, yearStr)
      .replace(/\{DEPT\}/gi, deptStr || "GEN")
      .replace(/\{SEQ\}/gi, seqStr);
  }

  const parts = [prefix];
  if (config.includeYear) parts.push(yearStr);
  if (config.includeDept && deptStr) parts.push(deptStr);
  parts.push(seqStr);
  return parts.join(sep);
}

export function buildRollNoString(
  config: IdNumberingFormatConfig["rollNo"],
  params: { year?: number; cohort?: string; seq: number }
): string {
  if (config.mode === "NUMERIC") {
    return String(params.seq);
  }
  const prefix = config.prefix?.trim() || "ROLL";
  const sep = config.separator !== undefined ? config.separator : "/";
  const yr = params.year || new Date().getFullYear();
  const yearStr = String(yr);
  const cohortStr = config.includeCohort && params.cohort ? params.cohort.replace(/\s+/g, "").toUpperCase() : "";
  const seqStr = String(params.seq).padStart(config.seqDigits || 3, "0");

  if (config.customPattern && config.customPattern.trim()) {
    return config.customPattern
      .replace(/\{PREFIX\}/gi, prefix)
      .replace(/\{YEAR\}/gi, yearStr)
      .replace(/\{COHORT\}/gi, cohortStr || "A")
      .replace(/\{SEQ\}/gi, seqStr);
  }

  const parts = [prefix];
  if (config.includeYear) parts.push(yearStr);
  if (config.includeCohort && cohortStr) parts.push(cohortStr);
  parts.push(seqStr);
  return parts.join(sep);
}

