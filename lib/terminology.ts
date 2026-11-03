export type InstitutionalArchetype =
  | "K12_SCHOOL"
  | "DEGREE_COLLEGE"
  | "UNIVERSITY"
  | "COACHING_ACADEMY";

export interface ArchetypeConfig {
  id: InstitutionalArchetype;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  sampleInstituteName: string;
  affiliationExample: string;
  terms: {
    cohortUnit: string;
    cohortPlural: string;
    subCohortUnit: string;
    subCohortPlural: string;
    termUnit: string;
    termPlural: string;
    studentIdLabel: string;
    studentIdFormat: string;
    leaderTitle: string;
    facultyTitle: string;
    facultyPlural: string;
    guardianLabel: string;
    gradingSystem: string;
    exampleCohort: string;
    syllabusType: string;
  };
  statutoryFocus: string[];
}

export const ARCHETYPES: Record<InstitutionalArchetype, ArchetypeConfig> = {
  K12_SCHOOL: {
    id: "K12_SCHOOL",
    name: "K-12 School",
    shortName: "School",
    badge: "CBSE / ICSE / State",
    description: "Primary, Middle & Senior Secondary schools with standard academic divisions and board grading.",
    sampleInstituteName: "Apex International Global Academy",
    affiliationExample: "CBSE & IB World Affiliation #2130894",
    terms: {
      cohortUnit: "Class / Standard",
      cohortPlural: "Classes",
      subCohortUnit: "Section",
      subCohortPlural: "Sections",
      termUnit: "Term",
      termPlural: "Terms",
      studentIdLabel: "Admission / Roll No",
      studentIdFormat: "AIA/2026/0491",
      leaderTitle: "Principal",
      facultyTitle: "Class Teacher",
      facultyPlural: "Teachers",
      guardianLabel: "Parent / Guardian",
      gradingSystem: "CBSE 9-Point Grading",
      exampleCohort: "Class 10-A",
      syllabusType: "NCERT Curriculum",
    },
    statutoryFocus: [
      "RTE 25% EWS Fee Exemption",
      "DPDPA 2023 Parental Consent Vault",
      "Supreme Court Bus Speed Limiter Log",
      "UDISE+ Annual Data Export",
    ],
  },
  DEGREE_COLLEGE: {
    id: "DEGREE_COLLEGE",
    name: "Degree College",
    shortName: "College",
    badge: "UGC / AICTE / NAAC",
    description: "Undergraduate and postgraduate colleges with departmental majors and semester credits.",
    sampleInstituteName: "St. Xavier's Autonomous College",
    affiliationExample: "NAAC Grade A++ Accredited",
    terms: {
      cohortUnit: "Program / Degree",
      cohortPlural: "Programs",
      subCohortUnit: "Branch / Stream",
      subCohortPlural: "Branches",
      termUnit: "Semester",
      termPlural: "Semesters",
      studentIdLabel: "College PRN / Roll",
      studentIdFormat: "PRN-2024-SX-8921",
      leaderTitle: "Principal / HOD",
      facultyTitle: "Assistant Professor",
      facultyPlural: "Faculty Members",
      guardianLabel: "Guardian Contact",
      gradingSystem: "SGPA / CGPA (10-Point)",
      exampleCohort: "B.Com Honours Sem 4",
      syllabusType: "University Syllabus",
    },
    statutoryFocus: [
      "UGC Academic Bank of Credits (ABC)",
      "APAAR 12-Digit Student Registry",
      "AISHE Annual Portal Export",
      "Attendance Condonation (75% Rule)",
    ],
  },
  UNIVERSITY: {
    id: "UNIVERSITY",
    name: "Autonomous University",
    shortName: "University",
    badge: "NIRF Top 20",
    description: "Multi-faculty universities with Choice Based Credit System (CBCS) and multi-campus governance.",
    sampleInstituteName: "Apex University of Science & Technology",
    affiliationExample: "Institute of Eminence (IoE)",
    terms: {
      cohortUnit: "Degree & Specialization",
      cohortPlural: "Degrees",
      subCohortUnit: "School / Department",
      subCohortPlural: "Departments",
      termUnit: "Semester & CBCS Credits",
      termPlural: "Semesters",
      studentIdLabel: "University PRN / APAAR ID",
      studentIdFormat: "APEX/UNIV/2023/1029",
      leaderTitle: "Dean / Vice-Chancellor",
      facultyTitle: "Professor / Research Guide",
      facultyPlural: "Faculty Body",
      guardianLabel: "Emergency Contact",
      gradingSystem: "NEP 2020 Multi-Entry/Exit Credits",
      exampleCohort: "B.Tech CSE - AI & ML (Yr 3)",
      syllabusType: "Outcome-Based Education (OBE)",
    },
    statutoryFocus: [
      "NEP 2020 DigiLocker NAD Marksheets",
      "QR Cryptographic Certificate Seal",
      "Anti-Ragging Committee Logs",
      "POSH & Grievance Statutory Records",
    ],
  },
  COACHING_ACADEMY: {
    id: "COACHING_ACADEMY",
    name: "Coaching Academy",
    shortName: "Academy",
    badge: "JEE / NEET / UPSC Prep",
    description: "Competitive examination centers, test prep institutes, and private academic academies.",
    sampleInstituteName: "Pinnacle IIT-JEE & NEET Academy",
    affiliationExample: "MoE Registered Coaching #AC-994",
    terms: {
      cohortUnit: "Course / Target Goal",
      cohortPlural: "Courses",
      subCohortUnit: "Batch",
      subCohortPlural: "Batches",
      termUnit: "Phase / Track",
      termPlural: "Phases",
      studentIdLabel: "Registration ID",
      studentIdFormat: "PINN-2026-JEE-441",
      leaderTitle: "Center Director",
      facultyTitle: "Subject Mentor",
      facultyPlural: "Faculty Mentors",
      guardianLabel: "Parent / Sponsor",
      gradingSystem: "National Percentile & AIR Rank",
      exampleCohort: "JEE Advanced 2027 Target Batch A",
      syllabusType: "Competitive Exam Syllabus",
    },
    statutoryFocus: [
      "MoE Jan 2024 Min Age (16+) Guard",
      "Statutory Pro-Rata Fee Refund (10 Days)",
      "Fire Safety & 1 sqm/Student Quota",
      "Ban on Misleading Rank Advertising",
    ],
  },
};
