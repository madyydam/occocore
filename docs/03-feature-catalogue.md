# The 500+ Feature Catalogue (Classified, Tagged & Flag-Controlled)

Every single feature below is mapped to an internal tenant feature flag (`tenant_features` key), allowing institute administrators or the Super Admin to enable or disable individual capabilities dynamically per school, college, university, or academy.

Tagging Legend:
- **P0**: Core 20-Day Production Build (Non-negotiable foundational feature)
- **P1**: Post-Launch Fast-Follow (Included in schema and UI hook; enabled in Phase 2)
- **P2**: Advanced Enterprise Roadmap

---

## Module 1: Multi-Tenancy, Domains & White-Labeling (Features 1 - 25)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F001 | Subdomain Auto-Provisioning | Instant subdomain creation (`{slug}.edusaas.com`) on onboarding. | P0 | SuperAdmin, Admin | `feat_subdomain` |
| F002 | Custom Domain Binding | CNAME mapping with automated DNS verification checks. | P0 | SuperAdmin, Admin | `feat_custom_domain` |
| F003 | Automated SSL Certificate Issuance | Zero-touch Let's Encrypt / Cloudflare SSL provisioning. | P0 | SuperAdmin | `feat_auto_ssl` |
| F004 | Dynamic Tenant Theme Injection | Real-time CSS variable injection for brand primary/secondary colors. | P0 | All | `feat_custom_branding` |
| F005 | Custom Logo & Favicon Upload | High-res dark/light logo and browser favicon personalization. | P0 | Admin | `feat_custom_logo` |
| F006 | Custom Institutional Font Selection | Choice of 12 Google Fonts (Inter, Plus Jakarta, Roboto, Outfit, etc.). | P0 | Admin | `feat_custom_font` |
| F007 | White-Labeled Login Portal | Dedicated login screen with institute imagery, slogan, and badge. | P0 | All | `feat_whitelabel_login` |
| F008 | Custom Slogan & Watermark | Dynamic watermarking on student receipts, hall tickets, and marksheets. | P0 | Admin | `feat_doc_watermark` |
| F009 | Email Sender Identity (Custom SMTP) | Send transactional emails using institute's own domain address. | P0 | Admin | `feat_custom_smtp` |
| F010 | White-label SMS Sender Header | Custom 6-character TRAI DLT approved Sender ID for SMS. | P0 | Admin | `feat_sms_sender_id` |
| F011 | WhatsApp Business API Profile | Institute's own WhatsApp display name, logo, and phone number. | P1 | Admin | `feat_custom_whatsapp` |
| F012 | Custom Privacy Policy & Terms Link | Institute-specific legal links in portal footer. | P0 | All | `feat_custom_legal` |
| F013 | Tenant Data Isolation Enforcement | Logical Postgres RLS preventing cross-tenant leakage. | P0 | System | `feat_tenant_rls` |
| F014 | Tenant Geo-Region Pinning | Configurable cloud storage region for student documents. | P1 | SuperAdmin | `feat_geo_pinning` |
| F015 | Multi-Campus Cluster Management | Grouping multiple branch schools under a single trust/board. | P1 | SuperAdmin, Admin | `feat_multicampus` |
| F016 | Tenant Hierarchy Inheritance | Propagate academic guidelines from Head Office to branch campuses. | P1 | Admin | `feat_trust_inheritance` |
| F017 | Custom Social Media Links | Header/footer integration with school YouTube, Instagram, LinkedIn. | P0 | All | `feat_social_links` |
| F018 | Dynamic Browser Title & OpenGraph | Tailored tab titles and social preview cards with institute name. | P0 | All | `feat_og_metadata` |
| F019 | Tenant Archival & Suspension | One-click tenant suspension preserving data integrity. | P0 | SuperAdmin | `feat_tenant_lifecycle` |
| F020 | Tenant Export (Full DB Dump) | GDPR/DPDPA compliant full JSON/SQL export of all tenant records. | P0 | SuperAdmin, Admin | `feat_tenant_data_export` |
| F021 | Custom Subdomain Redirects | Automatic 301 redirection from old subdomains to active custom domains. | P1 | System | `feat_domain_redirects` |
| F022 | Portal Maintenance Mode Toggle | Tenant-specific maintenance banner during off-peak upgrades. | P0 | Admin | `feat_maintenance_mode` |
| F023 | Institute Motto & Mission Display | Displayed prominently in student and parent portal headers. | P0 | All | `feat_institute_motto` |
| F024 | Custom Dashboard Welcome Video | Embed YouTube/Vimeo orientation clip for newly enrolled students. | P1 | Admin, Student | `feat_welcome_video` |
| F025 | Tenant IP Whitelisting | Restrict staff logins to institute physical IP range / VPN. | P2 | Admin | `feat_ip_restriction` |

---

## Module 2: Super Admin Platform Governance & SaaS Billing (Features 26 - 45)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F026 | Global Tenant Registry | Searchable directory of all institutes with status and plan details. | P0 | SuperAdmin | `feat_saas_core` |
| F027 | Plan & Subscription Manager | Create tiers (Starter, Pro, Enterprise, University Elite). | P0 | SuperAdmin | `feat_saas_plans` |
| F028 | Student Headcount Billing Meter | Automatic billing calculation based on active student records. | P0 | SuperAdmin | `feat_metered_billing` |
| F029 | Per-Tenant Feature Flag Matrix | UI matrix to toggle any of the 500 features for a specific institute. | P0 | SuperAdmin | `feat_flag_matrix` |
| F030 | Audited Instant Impersonation | Secure 1-click login into any tenant account with logged audit token. | P0 | SuperAdmin | `feat_audit_impersonation` |
| F031 | Global Revenue Analytics (MRR/ARR) | Real-time charts of monthly recurring revenue and churn. | P0 | SuperAdmin | `feat_platform_analytics` |
| F032 | Automated SaaS Invoice Generation | Automated GST tax invoices issued to school owners for software usage. | P0 | SuperAdmin | `feat_saas_invoicing` |
| F033 | Razorpay Subscriptions Integration | Recurring auto-debit of SaaS fees from institute credit cards/mandates. | P1 | SuperAdmin | `feat_saas_razorpay` |
| F034 | Institute Storage Usage Quota | Monitoring GB consumed by school documents and report card PDFs. | P0 | SuperAdmin | `feat_storage_meter` |
| F035 | SMS & WhatsApp Credit Balances | Pre-paid wallet management for institute outgoing message credits. | P0 | SuperAdmin, Admin | `feat_msg_wallet` |
| F036 | Support Ticket Desk | Integrated helpdesk ticketing system between school admins and platform. | P0 | SuperAdmin, Admin | `feat_support_desk` |
| F037 | Global System Health Monitor | Real-time monitoring of database query latency, worker queue depth. | P0 | SuperAdmin | `feat_health_telemetry` |
| F038 | Scheduled Platform Broadcasts | Send announcement banner to all school dashboards (maintenance, etc.). | P0 | SuperAdmin | `feat_platform_broadcasts` |
| F039 | Multi-Tenant Database Migrator | Safe, zero-downtime rolling schema migrations across all tenants. | P0 | SuperAdmin | `feat_db_migrator` |
| F040 | Failed Webhook Inspector | Inspection dashboard for failed payment or SMS webhook callbacks. | P0 | SuperAdmin | `feat_webhook_monitor` |
| F041 | Orphaned Asset Cleaner | Background worker to clean up unused uploaded photos and temp files. | P1 | System | `feat_storage_cleanup` |
| F042 | Platform Audit Log Export | Downloadable CSV of all Super Admin actions with cryptographic hash. | P0 | SuperAdmin | `feat_master_audit_log` |
| F043 | Referral & Partner Agency Portal | Commission tracking for regional ed-tech channel partners. | P2 | SuperAdmin | `feat_partner_portal` |
| F044 | Custom SaaS Contract Creator | Ability to upload offline enterprise MoUs and service agreements. | P1 | SuperAdmin | `feat_contract_management` |
| F045 | Institute Health Score Metric | Algorithmic scoring of tenant engagement (daily active teachers). | P1 | SuperAdmin | `feat_tenant_health_score` |

---

## Module 3: Guided Onboarding & Terminology Engine (Features 46 - 65)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F046 | 10-Minute Guided Onboarding Wizard | Step-by-step interactive setup flow for newly registered school owners. | P0 | Admin | `feat_onboarding_wizard` |
| F047 | Archetype Preset Selector | 1-Click setup: K-12 School, Degree College, University, or Coaching. | P0 | Admin | `feat_archetype_selector` |
| F048 | Dynamic Terminology Transformer | Dynamically swaps terms (Class vs Program, Section vs Semester). | P0 | All | `feat_terminology_engine` |
| F049 | Enabled User Types Selector | Admin chooses whether Student and Parent logins are enabled or hidden. | P0 | Admin | `feat_user_type_toggle` |
| F050 | Modular Feature Selector | Admin turns off unused modules (e.g. disabling Hostel/Transport). | P0 | Admin | `feat_module_toggle` |
| F051 | Onboarding Progress Checklist | Persistent widget showing "% Setup Complete" with direct action links. | P0 | Admin | `feat_setup_checklist` |
| F052 | 1-Click Demo Data Seeder | Pre-populates sample classes, students, and marks for quick evaluation. | P0 | Admin | `feat_demo_seeder` |
| F053 | Academic Calendar Quick Setup | Setup current academic year start/end dates and working days in 1 click. | P0 | Admin | `feat_academic_quickstart` |
| F054 | Bulk CSV Student Import Wizard | Upload student CSV with auto-column matching and error highlight preview. | P0 | Admin | `feat_csv_importer` |
| F055 | Interactive Sample CSV Generator | Download sample CSV tailored to the institute's specific active columns. | P0 | Admin | `feat_csv_sample_gen` |
| F056 | Data Rollback on Failed Import | Undo bulk imported records with one click if mistakes are detected. | P0 | Admin | `feat_import_rollback` |
| F057 | Institutional Contact Card Setup | Configure emergency phone, official email, and campus address. | P0 | Admin | `feat_campus_contact` |
| F058 | Currency & Timezone Selector | Global currency (₹ INR, $, €, £) and local timezone configuration. | P0 | Admin | `feat_i18n_config` |
| F059 | Fiscal Year Date Boundary | Align financial reporting with Indian financial year (April - March). | P0 | Admin | `feat_fiscal_year` |
| F060 | Institute Accreditation Badges | Display NAAC grade, CBSE affiliation number, or ISO certification. | P0 | Admin, All | `feat_accreditation_badges` |
| F061 | Pre-Built Indian Board Presets | Ready-to-use gradebooks for CBSE, ICSE, Maharashtra State Board, etc. | P0 | Admin | `feat_board_presets` |
| F062 | Default Password Policy Selector | Configure standard initial password format for staff and students. | P0 | Admin | `feat_password_policy` |
| F063 | Onboarding Completion Celebration | Confetti celebration and instant redirection to interactive role tour. | P0 | Admin | `feat_onboarding_confetti` |
| F064 | Wizard Re-entry Settings Page | Ability to re-run the setup wizard at the start of a new academic year. | P0 | Admin | `feat_wizard_reentry` |
| F065 | Setup Verification Diagnostic | Automated checker verifying that fees, classes, and teachers are linked. | P0 | Admin | `feat_setup_diagnostic` |

---

## Module 4: Academic Hierarchy & Curriculum Management (Features 66 - 90)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F066 | Multi-Year Academic Session Manager | Seamless switching between active, past, and upcoming academic years. | P0 | Admin, Staff | `feat_academic_sessions` |
| F067 | Dynamic Class / Program Creator | Define grades (Class 1-12) or university degrees (B.Tech, MBA, MBBS). | P0 | Admin | `feat_classes_management` |
| F068 | Section & Division Allocator | Sub-divide classes into sections (A, B, C) with individual capacity caps. | P0 | Admin | `feat_sections_management` |
| F069 | Semester & Trimester Support | Multi-term academic calendar with distinct start/end milestones. | P0 | Admin | `feat_semesters` |
| F070 | NEP 2020 Major & Minor Tracks | Tag subjects as Major, Minor, Multidisciplinary, or Skill Enhancement. | P0 | Admin, Faculty | `feat_nep_curriculum` |
| F071 | Subject Catalog & Course Codes | Define theory and practical subjects with unique codes (e.g. CS-101). | P0 | Admin | `feat_subjects_catalog` |
| F072 | Credit Hour Weighting System | Assign academic credits (e.g. 4 credits theory, 2 credits practical). | P0 | Admin, Faculty | `feat_credit_system` |
| F073 | Elective Subject Grouping | Allow students to pick 1 out of 5 optional elective subjects. | P0 | Admin, Student | `feat_elective_selection` |
| F074 | Class Teacher / Tutor Allocation | Appoint primary classroom mentors with special attendance/report rights. | P0 | Admin | `feat_class_teacher_assign` |
| F075 | Subject-to-Teacher Mapping | Assign specific faculty members to subject-section combinations. | P0 | Admin | `feat_subject_faculty_map` |
| F076 | Classroom / Hall Number Tracking | Map physical lecture halls, labs, and capacity to classes. | P0 | Admin | `feat_room_allocation` |
| F077 | Syllabus Tracker & Unit Mapping | Teachers log completed syllabus chapters against planned timeline. | P1 | Faculty, Student | `feat_syllabus_tracker` |
| F078 | Academic Working Days Calendar | Mark instructional days, preparatory leaves, and exam weeks. | P0 | All | `feat_academic_calendar` |
| F079 | Official Gazette Holiday Master | State and National public holidays with automatic timetable exclusion. | P0 | All | `feat_holiday_master` |
| F080 | Institutional Event Planner | Annual sports day, science fair, and cultural fest calendar with alerts. | P0 | All | `feat_event_planner` |
| F081 | Department / Faculty Heads (HOD) | Assign HODs with oversight over all departmental teachers and subjects. | P0 | Admin | `feat_department_heads` |
| F082 | Course Prerequisite Rules | Prevent students from taking Advanced Calculus without passing Basics. | P1 | Admin | `feat_course_prerequisites` |
| F083 | Course Outcome (CO) Definition | Define Bloom's Taxonomy learning objectives per course. | P1 | Faculty | `feat_course_outcomes` |
| F084 | Program Outcome (PO) Mapping | Align course outcomes to degree-level graduate attributes (for NAAC). | P1 | Admin, Faculty | `feat_po_co_mapping` |
| F085 | Lesson Plan Builder | Structured digital weekly lesson plans with learning objective tags. | P1 | Faculty | `feat_lesson_plans` |
| F086 | Practical Lab Group Batches | Split a 60-student class into Batch B1, B2, B3 for physics/chem labs. | P0 | Admin, Faculty | `feat_lab_batches` |
| F087 | Student House / Clan System | Assign students to Red/Blue/Green/Yellow houses for co-curriculars. | P0 | Admin, Staff | `feat_house_system` |
| F088 | Academic Year Rollover Wizard | 1-Click transfer of academic structure to the next academic session. | P0 | Admin | `feat_session_rollover` |
| F089 | Course Material Repository | Centralized digital repository of lecture notes categorized by unit. | P0 | Faculty, Student | `feat_course_repository` |
| F090 | Academic Audit Log | Track all modifications to classes, subjects, and credits with timestamps. | P0 | Admin | `feat_academic_audit` |

---

## Module 5: Student Admissions & Complete Lifecycle (Features 91 - 125)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F091 | Online Admission Inquiry Form | Embeddable public lead capture form on school website. | P0 | Public, Admin | `feat_online_inquiry` |
| F092 | Lead Conversion & Follow-up CRM | Track prospective applicant status (Inquiry, Campus Visit, Admitted). | P1 | Admin, Staff | `feat_admission_crm` |
| F093 | Comprehensive Student Profile | 60+ fields: Personal, Demographic, Emergency, Medical, Previous School. | P0 | Admin, Staff | `feat_student_profile` |
| F094 | Unique Admission / Scholar Number | Customizable auto-increment format (e.g. `DPS/2026/0014`). | P0 | Admin | `feat_admission_numbering` |
| F095 | Student Permanent Roll Number | Section-specific roll numbering (alphabetical or admission-order). | P0 | Admin, Faculty | `feat_roll_numbering` |
| F096 | Indian PRN & University Enrollment | Permanent Registration Number issued for lifelong higher-ed tracking. | P0 | Admin | `feat_prn_tracking` |
| F097 | DigiLocker ABC / APAAR ID Field | 12-digit national student identity registry storage. | P0 | Admin, Student | `feat_apaar_id` |
| F098 | Student Photo Upload with Cropper | In-browser face detection cropper for passport photo compliance. | P0 | Admin, Student | `feat_photo_cropper` |
| F099 | Guardian & Parent Relationship Map | Link Mother, Father, Local Guardian with distinct contact and occupations. | P0 | Admin, Parent | `feat_guardian_mapping` |
| F100 | Sibling Linking Engine | Link brothers/sisters across different classes for automatic fee discounts. | P0 | Admin, Accounts | `feat_sibling_linking` |
| F101 | Document Vault (Birth Cert, Aadhaar) | Encrypted PDF/JPG storage of government IDs, transfer certs, marksheets. | P0 | Admin, Staff | `feat_document_vault` |
| F102 | Student Medical & Allergy Profile | Blood group, chronic medical conditions, emergency doctor contact. | P0 | Admin, Staff | `feat_medical_profile` |
| F103 | Category & Caste Quota Tracking | General, OBC (Creamy/Non-Creamy), SC, ST, EWS tracking for statutory quotas. | P0 | Admin | `feat_caste_quota` |
| F104 | RTE 25% Free Quota Admission Flag | Flag Right to Education students with automatic tuition fee waiver. | P0 | Admin, Accounts | `feat_rte_quota` |
| F105 | Student Status Lifecycle Manager | Active, Suspended, Graduated, Expelled, Transferred, Alumni. | P0 | Admin | `feat_student_lifecycle` |
| F106 | One-Click Section Re-allocation | Transfer student between sections while preserving academic history. | P0 | Admin | `feat_section_transfer` |
| F107 | End-of-Year Student Promotion Engine | Bulk promote qualified students to the next class based on marks criteria. | P0 | Admin | `feat_student_promotion` |
| F108 | Detained / Repeat Year Handling | Retain unpromoted students in the same standard without duplicate IDs. | P0 | Admin | `feat_detention_handling` |
| F109 | Transfer Certificate (TC) Generator | Automated official TC generation with school seal and conduct remarks. | P0 | Admin | `feat_tc_generator` |
| F110 | Character & Bonafide Certificate | 1-Click printing of bonafide certificate for passport/visa/scholarship. | P0 | Admin | `feat_bonafide_generator` |
| F111 | Digital Student ID Card Creator | Print-ready PVC card layout generator with dynamic barcode/QR. | P0 | Admin | `feat_id_card_creator` |
| F112 | Student Barcode & QR Scanner Support | Scan student ID card to pull up profile instantly in search bar. | P0 | Staff | `feat_student_qr_scan` |
| F113 | Student Timeline & Activity Feed | Chronological history of attendance, awards, disciplinary remarks, fees. | P0 | Admin, Staff | `feat_student_timeline` |
| F114 | Disciplinary Record & Incident Log | Log behavioral infractions, suspensions, and counseling notes securely. | P0 | Admin, Faculty | `feat_disciplinary_log` |
| F115 | Student Awards & Honors Roster | Record sports medals, Olympiad ranks, and academic commendations. | P0 | Staff, Student | `feat_student_awards` |
| F116 | Student Grievance Box | Private ticket portal for students to report bullying or academic issues. | P1 | Student, Admin | `feat_student_grievance` |
| F117 | Bulk Student Photo Uploader | ZIP upload with file names matching Admission No for auto-matching. | P0 | Admin | `feat_bulk_photo_upload` |
| F118 | Custom Student Field Extensibility | Add custom fields (e.g. "Mother Tongue", "Bus Route Stop") without code. | P0 | Admin | `feat_custom_student_fields` |
| F119 | Student Birthday Notification Engine | Daily dashboard widget and automated congratulatory SMS/WhatsApp. | P0 | Staff, All | `feat_birthday_alerts` |
| F120 | Alumni Network Directory | Lifelong tracking of graduated batches, higher education, employment. | P1 | Admin, Alumni | `feat_alumni_directory` |
| F121 | Student Attendance Summary Badge | Real-time % badge on profile (turns red if below institutional limit). | P0 | All | `feat_attendance_badge` |
| F122 | Student Fee Clearance Verification | Visual indicator showing whether student has paid dues before admit card. | P0 | Staff | `feat_fee_clearance_badge` |
| F123 | Duplicate Admission No Prevention | Real-time validation preventing duplicate scholar numbers in database. | P0 | System | `feat_duplicate_check` |
| F124 | Student Quick Search Modal | Global shortcut search by name, admission no, roll no, or phone. | P0 | Staff | `feat_student_quicksearch` |
| F125 | Student Data Export to Excel/PDF | Granular field-picker export complying with data privacy filters. | P0 | Admin | `feat_student_export` |

---

## Module 6: Indian Statutory Compliance (UDISE+, AISHE, CBSE) (Features 126 - 150)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F126 | UDISE+ School Profile Master | Maintain School UDISE Code, Latitude, Longitude, Rural/Urban tag. | P0 | Admin | `feat_udise_master` |
| F127 | UDISE+ Student Data Collection (SDMIS) | Export standard SDMIS CSV formatted exactly per Ministry specifications. | P0 | Admin | `feat_udise_sdmis_export` |
| F128 | AISHE College DCF-II Export | Higher Education institutional information report for Ministry of Ed. | P0 | Admin | `feat_aishe_export` |
| F129 | Social Category Statutory Roster | Real-time count of SC/ST/OBC/Minority/EWS for government tenders. | P0 | Admin | `feat_statutory_rosters` |
| F130 | Minority Institution Classification | Religious/Linguistic minority status tags for legal exemptions. | P0 | Admin | `feat_minority_status` |
| F131 | Differently Abled (CwSN) Tracking | Tag Divyangjan students with specific impairment codes for subsidies. | P0 | Admin | `feat_cwsn_tracking` |
| F132 | Free Uniform & Textbook Distribution Log | Track distribution of state-funded mid-day meals, uniforms, books. | P1 | Staff | `feat_welfare_distribution` |
| F133 | State Board Medium of Instruction | Regional language tags (Marathi, Hindi, Gujarati, Tamil, etc.). | P0 | Admin | `feat_medium_instruction` |
| F134 | CBSE LOC (List of Candidates) Formatter | Generate 10th/12th Board exam registration sheets in CBSE layout. | P0 | Admin | `feat_cbse_loc` |
| F135 | CBSE Subject Code Validation Rules | Automatic checks ensuring valid 5/6 subject combinations per CBSE. | P0 | Admin | `feat_cbse_validations` |
| F136 | State Board Transfer Certificate Counter-Sign | Dual-sign layout for Education Officer counter-signature on TCs. | P0 | Admin | `feat_tc_countersign` |
| F137 | APAAR DigiLocker Verification Hook | API hook placeholder for automated verification of National Student IDs. | P1 | Admin | `feat_apaar_verify` |
| F138 | Nirf Higher Ed Faculty Ratio Audit | Automatic calculation of Student-to-Faculty Ratio (SFR) for NIRF ranking. | P1 | Admin | `feat_nirf_sfr_audit` |
| F139 | NAAC Criteria 1-7 Data Aggregator | One-click aggregation of curriculum, research, and placement statistics. | P1 | Admin | `feat_naac_aggregator` |
| F140 | NBA Outcome Based Education (OBE) Audit | Program Educational Objectives (PEO) attainment calculation sheets. | P1 | Admin, Faculty | `feat_nba_obe_audit` |
| F141 | National Scholarship Portal (NSP) Export | Formatted applicant lists for Post-Matric & Pre-Matric Central Schemes. | P0 | Admin | `feat_nsp_export` |
| F142 | State E-Kalyan / MahaDBT Export | State scholarship data compilation for direct benefit transfer (DBT). | P0 | Admin | `feat_state_scholarship_export` |
| F143 | University Affiliation Return Form | Annual report submitted to affiliating university listing staff & seats. | P0 | Admin | `feat_university_return` |
| F144 | B.Ed / NCTE Compliance Records | Teacher qualification compliance tracking per NCTE mandate. | P1 | Admin | `feat_ncte_compliance` |
| F145 | AICTE Mandatory Disclosure Generator | Auto-compiles engineering college mandatory public disclosure PDF. | P1 | Admin | `feat_aicte_disclosure` |
| F146 | Pharmacy Council (PCI) SIF Formatter | Standard Inspection Format (SIF) report generator for pharmacy colleges. | P2 | Admin | `feat_pci_sif` |
| F147 | Medical Council / NMC Roster | Resident doctor and student clinical rotation compliance log. | P2 | Admin | `feat_nmc_roster` |
| F148 | Anti-Ragging Affidavit Tracking | Timestamped records of mandatory annual student/parent anti-ragging decs. | P0 | Admin, Student | `feat_anti_ragging` |
| F149 | POSH Committee Record Log | Sexual harassment committee constitution and grievance resolution log. | P0 | Admin | `feat_posh_compliance` |
| F150 | Right to Information (RTI) Dispatch Log | Tracking of institutional RTI application deadlines and responses. | P1 | Admin | `feat_rti_register` |

---

## Module 7: Staff, Faculty & Human Resources (Features 151 - 180)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F151 | Staff Employee Directory | Complete staff directory across Teaching, Admin, and Support workers. | P0 | Admin, Staff | `feat_staff_directory` |
| F152 | Unique Employee Code Generator | Auto-incrementing employee ID (e.g. `EMP-2026-008`). | P0 | Admin | `feat_emp_code` |
| F153 | Staff Profile & Credential Vault | Degree certificates, B.Ed/NET/SET qualifications, resume, photo. | P0 | Admin, Staff | `feat_staff_credentials` |
| F154 | Faculty Department & Designation Map | Professor, Assistant Professor, PGT, TGT, PRT, Lab Assistant. | P0 | Admin | `feat_designation_map` |
| F155 | Statutory Indian Payroll Numbers | Provident Fund (UAN), ESI IP number, PAN, and Aadhaar storage. | P0 | Admin, Accounts | `feat_payroll_ids` |
| F156 | Bank Account Direct Deposit Setup | Staff bank name, account number, and IFSC code for salary NEFT. | P0 | Admin, Accounts | `feat_staff_bank_details` |
| F157 | Faculty Workload Calculator | Real-time tracking of weekly lecture hours against UGC/CBSE maximums. | P0 | Admin, Faculty | `feat_workload_calculator` |
| F158 | Staff Daily Attendance Marking | Daily present/absent/half-day recording via web or mobile portal. | P0 | Admin, Staff | `feat_staff_attendance` |
| F159 | Biometric RFID/Fingerprint Device Sync | API endpoint to ingest attendance logs from Essl / ZKTeco machines. | P1 | Admin | `feat_biometric_sync` |
| F160 | Leave Entitlement Master | Casual Leave (CL), Medical Leave (ML), Earned Leave (EL), Maternity. | P0 | Admin, Staff | `feat_leave_types` |
| F161 | Digital Leave Application & Approval | Staff apply on portal; Principal/HOD approves with email notification. | P0 | Staff, Admin | `feat_leave_workflow` |
| F162 | Real-time Leave Balance Ledger | Live view of remaining leave quotas per employee. | P0 | Staff | `feat_leave_balance` |
| F163 | Teacher Substitution Recommender | Auto-identifies free faculty during same period to take substitute class. | P0 | Admin, Faculty | `feat_substitution_recommender` |
| F164 | Staff Salary Structure Definition | Basic, HRA, DA, Special Allowance, PF deduction, Professional Tax (PT). | P1 | Admin, Accounts | `feat_salary_structure` |
| F165 | Indian Professional Tax (PT) Slabs | State-specific PT deduction slabs (Maharashtra, Karnataka, etc.). | P1 | Accounts | `feat_pt_deduction` |
| F166 | Monthly Payslip Generator | 1-Click bulk generation of branded PDF salary slips with download link. | P1 | Accounts, Staff | `feat_payslip_generator` |
| F167 | TDS Income Tax Declaration Vault | Staff upload rent receipts and 80C investments for tax withholding. | P2 | Accounts, Staff | `feat_tds_declarations` |
| F168 | Performance Appraisal Scorecard | Annual confidential report (ACR) grading research, student pass rate. | P1 | Admin, Faculty | `feat_appraisal_scorecard` |
| F169 | Student-to-Teacher Feedback Portal | Anonymous student ratings of teacher pedagogical effectiveness. | P1 | Admin, Student | `feat_teacher_feedback` |
| F170 | Faculty Research & Publication Tracker | Journal publications, patents, conference presentations, citations. | P1 | Faculty, Admin | `feat_research_tracker` |
| F171 | Faculty Training (FDP / CPD) Log | Tracking 50 hours of mandatory continuous professional development. | P1 | Faculty, Admin | `feat_fdp_tracking` |
| F172 | Staff Experience Certificate Generator | Automated issuance of relieving and experience letters upon exit. | P0 | Admin | `feat_exp_certificate` |
| F173 | Staff Birthday & Anniversary Alerts | Community notifications celebrating staff milestones. | P0 | Staff | `feat_staff_milestones` |
| F174 | Emergency Contact Broadcast | Instant SMS to all staff in case of weather emergency or sudden closure. | P0 | Admin | `feat_staff_broadcast` |
| F175 | Visitor Pass & Gatekeeper Log | Digital logging of campus visitors with phone number and OTP verify. | P1 | Staff | `feat_visitor_pass` |
| F176 | Staff Resignation & No-Dues Clearance | Multi-department clearance workflow (Library, Accounts, Lab, HOD). | P1 | Admin, Staff | `feat_no_dues_clearance` |
| F177 | Contract vs Permanent Staff Tags | Distinct handling of ad-hoc guest lecturers and permanent cadres. | P0 | Admin | `feat_staff_cadre` |
| F178 | Staff Document Expiry Reminder | Alerts for expiring passport, visa (for foreign faculty), or contracts. | P1 | Admin | `feat_doc_expiry_alerts` |
| F179 | Staff Role Delegation (Acting Principal) | Temporary transfer of approval rights while key administrators travel. | P1 | Admin | `feat_role_delegation` |
| F180 | Staff Audit Log | History of profile updates, salary modifications, and leave approvals. | P0 | Admin | `feat_staff_audit` |

---

## Module 8: Attendance & Roll Call Engine (Offline-First) (Features 181 - 215)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F181 | Daily Classroom Roll Call | 1-Click "Mark All Present", tap to toggle Absent/Late with 0ms latency. | P0 | Faculty | `feat_daily_attendance` |
| F182 | True Offline Roll Call Sync | Mark attendance completely offline; auto-syncs via Outbox on reconnect. | P0 | Faculty | `feat_offline_rollcall` |
| F183 | Period / Subject-Wise Attendance | Higher-ed period-by-period roll call for individual lecture sessions. | P0 | Faculty | `feat_period_attendance` |
| F184 | Real-time Absent SMS to Parents | Auto-dispatches SMS/WhatsApp to guardian within 15 mins of absence. | P0 | System | `feat_absent_parent_sms` |
| F185 | Half-Day & Tardy / Late Status | Track 1st-half / 2nd-half presence and late arrival minutes. | P0 | Faculty, Staff | `feat_tardy_status` |
| F186 | Medical Leave Attendance Credit | Mark absence as "Duty Leave" or "Medical" so % is not penalized. | P0 | Admin, Faculty | `feat_duty_leave` |
| F187 | 75% Mandatory Attendance Rule | Automatic warning badges for students nearing exam debarment line. | P0 | Faculty, Student | `feat_attendance_threshold` |
| F188 | Debarred Student Hall Ticket Block | Prevents exam hall ticket printing if attendance is below threshold. | P0 | Admin | `feat_debarment_block` |
| F189 | Monthly Class Attendance Register | Classic Indian physical register view with P/A grid and monthly totals. | P0 | Faculty, Admin | `feat_monthly_register` |
| F190 | Attendance Aggregate Report Card | Embedded % in term report cards per CBSE/University mandates. | P0 | Faculty | `feat_attendance_marksheet` |
| F191 | Bulk Attendance Correction Utility | Principal/Admin override tool to correct wrongly marked roll-calls. | P0 | Admin | `feat_attendance_correction` |
| F192 | Teacher Self-Attendance Geofence | Faculty marks arrival via mobile GPS only when within campus perimeter. | P1 | Faculty | `feat_geofence_attendance` |
| F193 | Student QR / Barcode Card Scan | Staff scan student ID card camera/scanner at main gate for entry. | P1 | Staff | `feat_qr_gate_attendance` |
| F194 | RFID Bus Tap Attendance | Records student boarding bus and notifies parents automatically. | P2 | Staff | `feat_rfid_bus_tap` |
| F195 | Attendance Analytics Heatmap | Visual day-of-week heatmap showing highest absenteeism trends (e.g. Mon). | P0 | Admin | `feat_attendance_heatmap` |
| F196 | Continuous Absence Escalator | Automatic alert to Principal if a student is absent 3 consecutive days. | P0 | Admin, Staff | `feat_consecutive_absent_alert` |
| F197 | Attendance Exemption Certificates | Upload sports championship duty letter to grant attendance credit. | P0 | Admin, Faculty | `feat_sports_attendance_credit` |
| F198 | Class Attendance Percentage Leaderboard | Inter-section friendly competition highlighting best attendance class. | P1 | All | `feat_attendance_leaderboard` |
| F199 | Student Leave Request Portal | Parent/Student applies for 3-day sick leave; teacher reviews online. | P0 | Student, Parent, Faculty | `feat_student_leave_app` |
| F200 | Attendance Export to Government Format | 1-Click Excel export matching state education department muster roll. | P0 | Admin | `feat_attendance_muster_export` |
| F201 | Historical Attendance Archive | Retain multi-year attendance records for background check verification. | P0 | System | `feat_attendance_archive` |
| F202 | Fast Keyboard Grid Entry | Arrow-key navigation in desktop view (Space to toggle, Enter to advance). | P0 | Faculty | `feat_keyboard_rollcall` |
| F203 | Session Cancellation Logger | Records why a scheduled lecture did not occur (e.g. Faculty Sick). | P0 | Faculty | `feat_lecture_cancellation` |
| F204 | Extra Lecture Attendance Log | Record remedial class attendance outside regular timetable hours. | P0 | Faculty | `feat_remedial_attendance` |
| F205 | Substitute Teacher Roll Call Rights | Grants temporary roll call access to replacement teachers. | P0 | Faculty | `feat_substitute_rollcall` |
| F206 | Attendance Freeze Milestone | Lock attendance editing after 24 hours to prevent tampering. | P0 | Admin | `feat_attendance_lock` |
| F207 | Parent Absence Excuse Submission | Parent clicks WhatsApp link to submit reason for child's absence. | P1 | Parent | `feat_absence_excuse` |
| F208 | Faculty Period Attendance Compliance | Admin dashboard tracking teachers who forgot to submit roll call today. | P0 | Admin | `feat_teacher_compliance_audit` |
| F209 | Daily Morning Attendance Summary | Automated WhatsApp report to Principal at 10:00 AM with campus headcounts. | P0 | Admin | `feat_morning_headcount_sms` |
| F210 | Attendance Percentage Simulator | Student tool: "How many lectures can I miss and stay above 75%?". | P1 | Student | `feat_attendance_simulator` |
| F211 | Subject-wise Condonation Fee Form | Higher ed condonation fine calculation for students between 65-75%. | P1 | Accounts | `feat_condonation_fee` |
| F212 | Exam Hall Attendance Sheet | Pre-printed photo signature sheet for exam invigilators to record present. | P0 | Admin, Faculty | `feat_exam_invigilation_sheet` |
| F213 | Hostel Night Roll Call Register | Warden records student presence in dorm rooms at 9:00 PM curfew. | P0 | Staff | `feat_hostel_rollcall` |
| F214 | Lab Session Double Attendance | Separate recording for 2-hour continuous practical laboratory sessions. | P0 | Faculty | `feat_lab_double_attendance` |
| F215 | Attendance Audit Trail | Tamper-proof log of who marked or edited any student's attendance record. | P0 | Admin | `feat_attendance_audit_log` |

---

## Module 9: Timetable, Schedules & Substitutions (Features 216 - 245)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F216 | Master Class Timetable Grid | Weekly visual grid (Mon-Sat, Periods 1-8) with drag-and-drop slots. | P0 | Admin, Staff | `feat_timetable_grid` |
| F217 | Teacher Individual Timetable | Dedicated schedule view per teacher showing free periods and duty halls. | P0 | Faculty | `feat_teacher_timetable` |
| F218 | Student & Section Schedule View | Student view of daily subjects, teacher names, and room numbers. | P0 | Student, Parent | `feat_student_timetable` |
| F219 | Break & Assembly Time Slot Config | Define morning assembly, short recess, lunch break, and homeroom slots. | P0 | Admin | `feat_period_slots` |
| F220 | Timetable Conflict Detection Engine | Real-time validation preventing double-booking of teacher or classroom. | P0 | Admin | `feat_timetable_conflict_check` |
| F221 | 1-Click Substitution Engine | Suggests free eligible subject teachers when a colleague is on leave. | P0 | Admin, Staff | `feat_substitution_engine` |
| F222 | Instant Substitution Notification | Sends instant WhatsApp/Push alert to teacher assigned to proxy period. | P0 | Faculty | `feat_proxy_alert` |
| F223 | Printable Master Timetable PDF | Clean, high-resolution A3/A4 master schedule for staffroom noticeboard. | P0 | Admin | `feat_timetable_print` |
| F224 | Lab & Practical Multi-Period Block | Support for continuous 2 or 3 period blocks for Science/Computer labs. | P0 | Admin | `feat_multi_period_block` |
| F225 | Room & Lab Capacity Constraints | Warns if 60 students are scheduled in a 30-seater chemistry lab. | P0 | Admin | `feat_room_capacity_check` |
| F226 | Weekly Faculty Workload Balance | Visual bar chart ensuring teachers have balanced 24-28 periods/week. | P0 | Admin | `feat_workload_balance` |
| F227 | Day-Wise Rotational Timetables | Day 1 to Day 6 cycle (used in international/IB schools) vs Mon-Fri. | P1 | Admin | `feat_rotational_cycle` |
| F228 | Exam Special Timetable Overlay | Temporary timetable replacement during exam weeks (Exam Hall Shifts). | P0 | Admin, All | `feat_exam_timetable` |
| F229 | Bell Schedule Customization | Summer vs Winter timing adjustments with 1-click time shift. | P0 | Admin | `feat_bell_schedules` |
| F230 | Zero-Period & Remedial Scheduling | Schedule zero-period sports or after-school coaching classes. | P0 | Admin | `feat_zero_period` |
| F231 | Public Holidays Calendar Masking | Automatically blacks out public holidays on timetable schedule views. | P0 | All | `feat_holiday_masking` |
| F232 | Teacher Timetable Preference Settings | Staff can request preferred free periods (e.g. for feeding mothers). | P1 | Faculty | `feat_timetable_preferences` |
| F233 | Auto-Timetable Generator (Algorithm) | Algorithmic constraint-solver to generate clash-free master timetable. | P1 | Admin | `feat_auto_timetable_generator` |
| F234 | Room Utilization Analytics | Heatmap showing under-utilized lecture halls and computer labs. | P1 | Admin | `feat_room_analytics` |
| F235 | Today's Schedule Mobile Widget | Clean mobile card showing "Current Class" and "Up Next". | P0 | Faculty, Student | `feat_today_schedule_widget` |
| F236 | Timetable Change Announcement | Automated notification to parents when daily timetable is reshuffled. | P0 | System | `feat_timetable_change_alert` |
| F237 | Co-Teaching / Dual Faculty Slots | Assign 2 teachers simultaneously to a single class (Lab Demonstrators). | P0 | Admin | `feat_co_teaching` |
| F238 | Institutional Event Timetable Freeze | Suspend normal periods during Annual Day rehearsal with 1 click. | P0 | Admin | `feat_timetable_freeze` |
| F239 | Timetable Versioning & History | Archive Term 1 timetable while activating revised Term 2 schedule. | P0 | Admin | `feat_timetable_versioning` |
| F240 | Departmental Common Slot Booking | Reserve Wednesday Period 5 for all Mathematics teachers' meeting. | P1 | Admin | `feat_common_slot_booking` |
| F241 | Guest Lecturer Slot Scheduler | Allocate visiting professor lectures with external calendar invite. | P1 | Admin | `feat_guest_lecturer_slot` |
| F242 | Student Elective Conflict Solver | Validates that chosen elective subjects do not clash in schedule. | P0 | Admin | `feat_elective_clash_check` |
| F243 | iCal / Google Calendar Feed | Subscribe to school timetable on personal mobile phone calendar. | P1 | Staff, Student | `feat_ical_feed` |
| F244 | Daily Substitution Register Export | Download monthly log of all substitute classes taken for proxy pay. | P0 | Accounts | `feat_proxy_pay_register` |
| F245 | Timetable Audit Trail | Logs who altered classroom, period, or teacher assignments. | P0 | Admin | `feat_timetable_audit` |

---

## Module 10: Fee Structures, Concessions & Accounts (Features 246 - 280)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F246 | Flexible Fee Head Master | Define heads: Tuition, Admission, Term, Lab, Library, Transport, Gym. | P0 | Admin, Accounts | `feat_fee_heads` |
| F247 | Class & Category-Wise Fee Mapping | Map fee amounts to Class (e.g. Class 1: ₹30k, Class 10: ₹50k). | P0 | Accounts | `feat_fee_mapping` |
| F248 | Installment Schedule Configurator | Divide annual fee into Term 1, Term 2, or 12 Monthly installments. | P0 | Accounts | `feat_installment_schedules` |
| F249 | Due Date & Grace Period Slabs | Set cutoff dates (e.g. 10th of every month) with 5 days grace period. | P0 | Accounts | `feat_due_dates` |
| F250 | Automated Daily / Fixed Late Fines | Calculate ₹50/day late fine or 5% flat fine after due date passes. | P0 | Accounts | `feat_late_fines` |
| F251 | Sibling Concession Engine | Auto-apply 20% discount on 2nd child and 50% on 3rd child tuition fee. | P0 | Accounts | `feat_sibling_concession` |
| F252 | Staff Child Fee Waiver | Configure 100% tuition waiver for children of permanent school staff. | P0 | Accounts | `feat_staff_child_waiver` |
| F253 | Merit & Sports Scholarship Rules | Apply percentage or flat fee reductions based on entrance test ranks. | P0 | Accounts | `feat_merit_scholarships` |
| F254 | RTE 25% Statutory 100% Waiver | Automatic total tuition fee exemption for government quota students. | P0 | Accounts | `feat_rte_waiver` |
| F255 | Discretionary Management Concession | Principal applies custom fee waiver with mandatory reason and approval. | P0 | Admin, Accounts | `feat_custom_concession` |
| F256 | Indian GST Tax Invoice Support | Add 18% GST (CGST/SGST/IGST) on taxable commercial/coaching courses. | P0 | Accounts | `feat_gst_invoicing` |
| F257 | SAC Code Mapping (9992 Education) | Include official HSN/SAC code 9992 on printed tax invoices. | P0 | Accounts | `feat_sac_codes` |
| F258 | Optional Fee Head Selector | Parents opt-in/opt-out of optional fees (e.g. Annual Day Costume, Tour). | P0 | Parent, Accounts | `feat_optional_fees` |
| F259 | Security / Caution Deposit Ledger | Track refundable caution deposit collected at admission and refund it. | P0 | Accounts | `feat_caution_deposit` |
| F260 | Student Ledger Account (Khata) | Complete debit/credit financial ledger showing every invoice & payment. | P0 | Accounts | `feat_student_ledger` |
| F261 | Previous Year Fee Arrears Carryover | Automatically add unpaid balance from last academic year to new bill. | P0 | Accounts | `feat_arrears_carryover` |
| F262 | Advance Fee Deposit Wallet | Parents pre-load money into virtual school wallet to pay future terms. | P1 | Accounts, Parent | `feat_advance_wallet` |
| F263 | Fee Structure Cloner | 1-Click duplicate current year fee structure for next year with 10% hike. | P0 | Accounts | `feat_fee_structure_clone` |
| F264 | Student Transport Distance Slabs | Auto-calculate transport fee based on kilometers (0-5km, 5-10km). | P0 | Accounts | `feat_transport_slabs` |
| F265 | Hostel Room Category Fee Slabs | Ac vs Non-AC, Single vs Shared room boarding fee mappings. | P0 | Accounts | `feat_hostel_fee_slabs` |
| F266 | Fee Defaulter Aging Report | Filter overdue fees by: 1-30 Days, 31-60 Days, 90+ Days delinquent. | P0 | Admin, Accounts | `feat_defaulter_aging` |
| F267 | 1-Click WhatsApp Defaulter Reminder | Batch send personalized WhatsApp reminder with instant UPI pay link. | P0 | Accounts | `feat_whatsapp_fee_reminder` |
| F268 | Automated SMS DLT Fee Reminders | Scheduled SMS dispatched 3 days before and 1 day after fee due date. | P0 | System | `feat_dlt_fee_sms` |
| F269 | Fee Collection Daily Cashier Report | End-of-day summary balancing cash, cards, cheques, and online collections. | P0 | Accounts | `feat_cashier_reconciliation` |
| F270 | Bank Cheque Clearance Tracker | Mark cheque as Deposited, Cleared, or Bounced with cheque bounce fine. | P0 | Accounts | `feat_cheque_tracker` |
| F271 | Cheque Bounce Auto-Reversal | Automatically re-open invoice and assess ₹500 bounce charge on bounce. | P0 | Accounts | `feat_cheque_bounce_fine` |
| F272 | Fee Refund & Cancellation Workflow | Multi-step approval for student withdrawal fee refund calculation. | P0 | Admin, Accounts | `feat_fee_refund` |
| F273 | Partial & Part-Payment Acceptance | Allow parents to pay ₹10,000 against a ₹25,000 invoice installment. | P0 | Accounts | `feat_part_payments` |
| F274 | Fee Waiver Approval Hierarchy | Concession > ₹10,000 requires Trustee/Director OTP authorization. | P1 | Admin, Accounts | `feat_waiver_approval_matrix` |
| F275 | Fee Audit Trail | Immutable record of who modified fee structures, waived fines, or receipts. | P0 | Admin | `feat_fee_audit` |
| F276 | Category Fee Exemption Certificate | Print certificate of fee clearance for government scholarship schemes. | P0 | Accounts | `feat_fee_clearance_cert` |
| F277 | Bank Challan Slip Generator | Pre-printed 3-copy bank deposit slip (Bank, Student, School copy). | P0 | Accounts | `feat_bank_challan` |
| F278 | Fee Concession Quota Tracking | Cap total school concessions at ₹10 Lakhs/year with warning alerts. | P1 | Admin | `feat_concession_budget_cap` |
| F279 | Income / Expense Head Integration | Link fee heads to chart of accounts for export to Tally / QuickBooks. | P1 | Accounts | `feat_tally_integration` |
| F280 | Annual Fee Projection Dashboard | Real-time chart showing Expected vs Collected vs Outstanding revenue. | P0 | Admin, Accounts | `feat_fee_projection_chart` |

---

## Module 11: Payments, Gateways & Receipts (Features 281 - 315)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F281 | Fast POS Cash Counter Collection | 30-second receipt checkout: type roll no, select installments, print. | P0 | Accounts | `feat_pos_fee_counter` |
| F282 | Dynamic UPI QR Code on Invoices | Generate instant BharatPe/NPCI UPI QR code on student fee bill. | P0 | Accounts, Parent | `feat_dynamic_upi_qr` |
| F283 | Razorpay Payment Gateway Integration | Credit/Debit Cards, NetBanking, UPI, Wallets with automated webhooks. | P0 | Parent, Accounts | `feat_gateway_razorpay` |
| F284 | Cashfree Payments Gateway | High-reliability Indian gateway with instant settlement support. | P0 | Parent, Accounts | `feat_gateway_cashfree` |
| F285 | PayU India Integration | Multi-channel payment acceptance with automated refund APIs. | P1 | Parent, Accounts | `feat_gateway_payu` |
| F286 | Offline Fee Collection (Dexie Sync) | Cashier collects cash offline during power cut; receipts sync on net. | P0 | Accounts | `feat_offline_fee_collection` |
| F287 | Branded Thermal POS Receipt Print | 3-inch (80mm) thermal printer format with school logo and receipt no. | P0 | Accounts | `feat_thermal_receipt_print` |
| F288 | Standard A4 / A5 PDF Receipt | Elegant formal receipt with student details, fee breakdown, and signature. | P0 | All | `feat_pdf_receipt` |
| F289 | QR Code Verification on Receipts | Scan QR code on physical receipt to verify authenticity on portal. | P0 | Public, All | `feat_receipt_qr_verification` |
| F290 | Sequential Auto-Receipt Numbering | Unique tenant fiscal numbering (e.g. `DPS/RCP/2026/0491`). | P0 | Accounts | `feat_receipt_numbering` |
| F291 | Instant WhatsApp Receipt PDF Link | Send download link directly to parent WhatsApp immediately upon pay. | P0 | System | `feat_receipt_whatsapp_link` |
| F292 | Instant SMS Payment Confirmation | TRAI-compliant SMS notification: *"Received ₹15,000 for Aarav. Rec: 0491"*. | P0 | System | `feat_receipt_sms` |
| F293 | Split Payment Tender Recording | Pay ₹5,000 in Cash and ₹10,000 via Google Pay UPI in a single receipt. | P0 | Accounts | `feat_split_payment_tender` |
| F294 | Transaction Surcharge Configuration | Option to pass gateway 1.5% fee to parent or absorb by institute. | P0 | Accounts | `feat_gateway_surcharge` |
| F295 | Webhook Reconciliation Engine | Automatically marks invoice paid even if parent closes browser window. | P0 | System | `feat_webhook_reconciliation` |
| F296 | Failed Online Payment Recovery | Track abandoned checkouts and send 1-click retry payment links. | P0 | Accounts | `feat_abandoned_cart_recovery` |
| F297 | Duplicate Payment Prevention | Idempotency locks preventing double-charging of invoices. | P0 | System | `feat_payment_idempotency` |
| F298 | Multi-Terminal Cashier ID Tracking | Track which counter clerk collected which specific cash receipt. | P0 | Accounts | `feat_cashier_tracking` |
| F299 | Receipt Cancellation & Invalidation | Void mistaken receipt with mandatory supervisor password and log. | P0 | Admin, Accounts | `feat_receipt_cancellation` |
| F300 | Duplicate Receipt Copy Stamp | Watermark "DUPLICATE COPY" if reprinting a previously issued receipt. | P0 | Accounts | `feat_duplicate_receipt_stamp` |
| F301 | Bank NEFT / RTGS UTR Number Logging | Log bank transaction reference number for direct institutional wire. | P0 | Accounts | `feat_utr_logging` |
| F302 | POS Machine Reference Number | Record card terminal merchant swipe slip authorization code. | P0 | Accounts | `feat_pos_swipe_ref` |
| F303 | Daily Collection Mode Breakdown | Chart of Cash vs UPI vs NetBanking vs Cheque daily volume. | P0 | Admin, Accounts | `feat_collection_mode_chart` |
| F304 | Instant 1-Click Fee Receipt Email | Automated email attachment with PDF receipt sent to parent inbox. | P0 | System | `feat_receipt_email` |
| F305 | Student Portal Fee Payment Cart | Students/Parents select upcoming terms, click Pay, and finish in 10s. | P0 | Student, Parent | `feat_portal_pay_cart` |
| F306 | Saved Payment Methods (Tokenization) | Secure PCI-DSS compliant saved cards for 1-tap future tuition pay. | P1 | Parent | `feat_saved_cards` |
| F307 | Auto-Debit Recurring Mandate (eNACH) | Bank e-mandate for automatic monthly tuition deduction. | P1 | Accounts, Parent | `feat_enach_mandates` |
| F308 | Payment Gateway Settlement Ledger | Match gateway settlement payouts against bank account deposits. | P1 | Accounts | `feat_settlement_reconciliation` |
| F309 | Income Head Ledger Grouping | Auto-split receipt: ₹20k to Tuition Account, ₹3k to Transport Account. | P0 | Accounts | `feat_ledger_head_splitting` |
| F310 | Multi-Currency Acceptance | Accept international credit cards in USD/EUR for NRI students. | P1 | Accounts | `feat_multicurrency_pay` |
| F311 | Cash Drawer Limit Warning | Alert cashier when cash in drawer exceeds ₹1,00,000 for vault transfer. | P1 | Accounts | `feat_cash_drawer_limit` |
| F312 | In-App Payment Receipt Archive | Parents can download any past receipt from last 5 years in their app. | P0 | Parent | `feat_parent_receipt_archive` |
| F313 | Automated Payment Receipt SMS Resend | Resend lost receipt link to parent with single click. | P0 | Accounts | `feat_receipt_resend` |
| F314 | Payment Gateway Health Monitor | Auto-switches to backup gateway if primary gateway success rate drops. | P2 | System | `feat_gateway_failover` |
| F315 | Financial Audit Trail | Complete cryptographic trail of every rupee billed, collected, or waived. | P0 | Admin | `feat_financial_audit` |

---

## Module 12: Examination, Grading & Report Cards (Features 316 - 355)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F316 | Exam Term & Assessment Master | Define Formative (FA), Summative (SA), Mid-Term, Pre-Board, Finals. | P0 | Admin, Faculty | `feat_exam_master` |
| F317 | Subject Max & Min Passing Marks | Configure Theory (80), Practical (20), Internal (20), Passing (33%). | P0 | Admin | `feat_marks_grading_rules` |
| F318 | Fast Batch Mark Entry Table | Excel-like table: Enter key moves down, auto-tabulates total and grade. | P0 | Faculty | `feat_batch_marks_entry` |
| F319 | Offline Marksheet Entry Mode | Teachers enter scores offline in basement halls; syncs when online. | P0 | Faculty | `feat_offline_marks_entry` |
| F320 | CBSE 9-Point Grading Scale (A1 to E2) | Automatic calculation of CBSE grades based on score percentiles. | P0 | Faculty | `feat_cbse_grading` |
| F321 | University SGPA & CGPA Calculation | Semester Grade Point Average and Cumulative GPA per UGC 10-point scale. | P0 | Faculty, Admin | `feat_sgpa_cgpa_engine` |
| F322 | Grace Marks Awarding Engine | University rule: award up to 5 grace marks to clear student near margin. | P0 | Admin | `feat_grace_marks_engine` |
| F323 | Class Tabulation Sheet (Muster Marksheet) | Master A3 overview showing all students, all subjects, totals, and ranks. | P0 | Admin, Faculty | `feat_tabulation_sheet` |
| F324 | 1-Click Beautiful Report Card PDF | Branded term report card with student photo, grades, remarks, QR code. | P0 | All | `feat_report_card_generator` |
| F325 | Co-Scholastic & Life Skills Grading | Grade Work Education, Art, Health & Physical Education (A, B, C). | P0 | Faculty | `feat_co_scholastic_grading` |
| F326 | Class Teacher Remarks Template Bank | 50+ pre-written constructive remarks (e.g. "Excellent analytical mind"). | P0 | Faculty | `feat_remarks_bank` |
| F327 | Student Class Rank & Percentile Calc | Automatic calculation of overall class rank and subject rank. | P0 | Faculty, Admin | `feat_rank_calculation` |
| F328 | Highest, Lowest, Average Marks Benchmark | Display class average alongside student score for parent comparison. | P0 | Faculty, Parent | `feat_marks_benchmarks` |
| F329 | Exam Hall Ticket / Admit Card Creator | Print admit cards with student photo, exam timetable, and roll number. | P0 | Admin, Student | `feat_hall_ticket_creator` |
| F330 | Barcode / QR Code on Hall Tickets | Invigilators scan QR code to verify student identity at exam hall door. | P0 | Faculty, Staff | `feat_hall_ticket_qr` |
| F331 | Exam Seating Arrangement Planner | Auto-distribute students across rooms preventing neighbors in same class. | P0 | Admin | `feat_exam_seating_planner` |
| F332 | Invigilation Duty Roster Generator | Fair allocation of teacher supervision duties across exam sessions. | P0 | Admin | `feat_invigilation_roster` |
| F333 | Absent / Medically Exempt Mark Tagging | Tag student as "AB" (Absent) or "ML" (Medical) without skewing totals. | P0 | Faculty | `feat_absent_mark_tags` |
| F334 | Mark Entry Locking & Finalization | Lock subject marks once submitted so teachers cannot edit secretly. | P0 | Admin, Faculty | `feat_marks_lock` |
| F335 | Mark Moderation & Principal Review | Principal can review, moderate, and unlock submitted marksheets. | P0 | Admin | `feat_marks_moderation` |
| F336 | Student Backlog / Supplementary Exam Track | Track KT (Kept to Term) backlog papers and re-exam passing history. | P0 | Admin, Faculty | `feat_backlog_tracking` |
| F337 | Revaluation & Retotaling Request Workflow | Student applies online for paper re-checking; logs score delta. | P1 | Student, Admin | `feat_revaluation_workflow` |
| F338 | Online Report Card Release Scheduler | Schedule report card visibility to parents on Result Declaration Day. | P0 | Admin | `feat_result_publish_scheduler` |
| F339 | Instant Result Declaration SMS / WhatsApp | Automated alert to parents: *"Term 1 results out! Aarav secured 91%"*. | P0 | System | `feat_result_sms_broadcast` |
| F340 | Subject Pass/Fail Percentage Analytics | Visual bar chart showing % of students failing Math vs English. | P0 | Admin, Faculty | `feat_subject_analytics` |
| F341 | Top Performer Hall of Fame Widget | Highlights top 3 scorers per section on portal homepage. | P0 | All | `feat_hall_of_fame` |
| F342 | Progress Report Trend Line (Term 1 vs 2) | Graph showing whether a student is improving or declining over terms. | P0 | Student, Parent | `feat_student_progress_trend` |
| F343 | Continuous Assessment Rubric Builder | Define criteria (Creativity, Presentation, Research) with 1-5 stars. | P1 | Faculty | `feat_rubric_builder` |
| F344 | Question Paper Blueprint Creator | Blueprint builder matching marks to Knowledge, Understanding, App. | P1 | Faculty | `feat_question_blueprint` |
| F345 | College University Transcript Formatter | Official multi-semester academic transcript for foreign university app. | P0 | Admin | `feat_university_transcript` |
| F346 | Digital Certificate with Blockchain Hash | Verifiable graduate degree certificate with SHA-256 tamper hash. | P2 | Admin | `feat_digital_degree_hash` |
| F347 | Weightage Consolidation Engine | Combine Term 1 (30%) + Term 2 (70%) into single final consolidated grade. | P0 | Faculty, Admin | `feat_weightage_consolidation` |
| F348 | Bulk Report Card ZIP Downloader | 1-Click download of 500 individual student report card PDFs in a ZIP. | P0 | Admin | `feat_bulk_report_card_zip` |
| F349 | Parent Digital Signature Confirmation | Parent reviews report card in mobile portal and clicks "Acknowledge". | P0 | Parent | `feat_report_parent_ack` |
| F350 | Examination Scratch Card / PIN System | Support scratch card PIN entry for viewing results (legacy board model). | P0 | Admin, Student | `feat_exam_pins` |
| F351 | OMR Sheet Scanner Integration | Import optical mark recognition CSV results directly into gradebook. | P1 | Admin | `feat_omr_import` |
| F352 | Remedial Class Student Flagging | Auto-tag students scoring below 40% for mandatory extra coaching. | P0 | Faculty | `feat_remedial_flagging` |
| F353 | Exam Disciplinary (Malpractice) Log | Record students caught with cheat sheets and disciplinary hearing notes. | P0 | Admin | `feat_malpractice_log` |
| F354 | Grade Point Equivalence Certificate | Auto-generate certificate converting CGPA to percentage per formula. | P0 | Admin | `feat_cgpa_percentage_cert` |
| F355 | Examination Audit Trail | Cryptographic log of every mark alteration with before/after values. | P0 | Admin | `feat_marks_audit` |

---

## Module 13: Learning Management & Study Material (Features 356 - 380)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F356 | Digital Homework & Assignment Creator | Teacher posts task with description, attachments, and due date. | P0 | Faculty | `feat_homework_creator` |
| F357 | Student Online Assignment Submission | Students upload PDF / photos of written homework before deadline. | P0 | Student | `feat_student_submission` |
| F358 | Fast Homework Evaluation & Grading | Teacher views submission, marks as Checked/Returned with remarks. | P0 | Faculty | `feat_homework_grading` |
| F359 | Class Study Material & PDF Notes Vault | Organize notes by Subject, Chapter, and Unit with instant preview. | P0 | Faculty, Student | `feat_study_material_vault` |
| F360 | Video Lesson & Lecture Link Embed | Embed YouTube, Vimeo, or Google Drive classroom video links. | P0 | Faculty, Student | `feat_video_lesson_embed` |
| F361 | Class Question & Doubt Forum | Students post questions on a lesson; teachers and classmates reply. | P0 | Faculty, Student | `feat_doubt_forum` |
| F362 | Multiple Choice Quiz Creator | Auto-graded online MCQ tests with timer and instant answer review. | P0 | Faculty | `feat_mcq_quizzes` |
| F363 | Randomized Question Shuffling | Shuffles question order and options to prevent student cheating. | P0 | Faculty | `feat_quiz_shuffling` |
| F364 | Instant Quiz Scorecard & Leaderboard | Immediate marks calculation with rank list upon quiz submission. | P0 | Student, Faculty | `feat_quiz_leaderboard` |
| F365 | Live Classroom Meeting Link Hub | Integrate Zoom, Google Meet, or Microsoft Teams 1-click launch links. | P0 | All | `feat_live_class_links` |
| F366 | Homework Completion Notification to Parents | Automated alert if student fails to submit homework by deadline. | P0 | System | `feat_homework_overdue_alert` |
| F367 | Past Year Question Paper (PYQ) Bank | Repository of previous 5 years examination papers for revision. | P0 | Student | `feat_pyq_bank` |
| F368 | Audio Pronunciation & Voice Note Notes | Teachers upload short 60s voice explanations for language classes. | P1 | Faculty | `feat_voice_notes` |
| F369 | Interactive Flashcard Decks | Flashcard revision tools for vocabulary, formulas, and history dates. | P1 | Student | `feat_flashcards` |
| F370 | Plagiarism Checker Integration | Webhook integration placeholder for student essay similarity checks. | P2 | Faculty | `feat_plagiarism_check` |
| F371 | Assignment Late Submission Penalties | Deduct 10% score per day for homework submitted past deadline. | P1 | Faculty | `feat_late_submission_penalty` |
| F372 | Student Peer Review Assignments | Students anonymously grade 2 classmates' projects against a rubric. | P2 | Faculty, Student | `feat_peer_review` |
| F373 | Subject Resource Download Tracker | Teacher analytics showing which students actually downloaded notes. | P1 | Faculty | `feat_resource_analytics` |
| F374 | Offline Study Material Caching | Students can save notes in app to read offline while traveling. | P0 | Student | `feat_offline_study_notes` |
| F375 | Student Project Work Milestone Tracker | Track phases of Science Exhibition or capstone projects over months. | P1 | Faculty, Student | `feat_project_milestones` |
| F376 | Teacher Curriculum Resource Sharing | Teachers share high-scoring worksheets with colleagues in same trust. | P1 | Faculty | `feat_resource_sharing` |
| F377 | Adaptive Quiz Difficulty Scaling | Next question becomes harder if student answers correctly (P2). | P2 | System | `feat_adaptive_quizzing` |
| F378 | Audio / Video Homework Submissions | Language students record French/English speaking test via mic. | P1 | Student | `feat_audio_submission` |
| F379 | Homework Print Friendly Format | 1-Click print clean PDF worksheet for offline classroom distribution. | P0 | Faculty | `feat_worksheet_print` |
| F380 | LMS Activity Audit Log | Track who created quizzes, altered scores, or removed study materials. | P0 | Admin | `feat_lms_audit` |

---

## Module 14: Omnichannel Communication & Notices (Features 381 - 410)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F381 | Institutional Digital Noticeboard | Categorized announcements: Academic, Sports, Holidays, Urgent. | P0 | All | `feat_digital_noticeboard` |
| F382 | Targeted Notice Audience Filtering | Send circular only to: Class 10 Parents, or High School Teachers. | P0 | Admin, Staff | `feat_notice_targeting` |
| F383 | Official WhatsApp Business API Broadcast | Send template notifications with verified green tick brand trust. | P0 | Admin | `feat_whatsapp_broadcast` |
| F384 | TRAI DLT Compliant SMS Engine | Multi-gateway routing (MSG91, Gupshup, Textlocal) with Template IDs. | P0 | System | `feat_dlt_sms_engine` |
| F385 | Automated Email Circular Dispatch | Send HTML newsletter with school letterhead and PDF attachment. | P0 | Admin | `feat_email_circulars` |
| F386 | Mobile In-App Push Notifications | Real-time push alerts on mobile devices and browser service workers. | P0 | All | `feat_push_notifications` |
| F387 | Parent-Teacher 1-on-1 Direct Chat | Controlled messaging between parent and class teacher with quiet hours. | P0 | Faculty, Parent | `feat_pt_chat` |
| F388 | Teacher Privacy Protection Mode | Parents cannot see teacher's private personal phone number in chat. | P0 | Faculty | `feat_teacher_privacy` |
| F389 | Chat Hours & DND (Do Not Disturb) | Automatically disable inbound parent chats after 6:00 PM and Sundays. | P0 | Faculty | `feat_chat_dnd` |
| F390 | Emergency Flash Alert Banner | Red screen-takeover banner for sudden school closure (e.g. Heavy Rain). | P0 | Admin, All | `feat_flash_emergency_banner` |
| F391 | Parent Acknowledgement Tracking | Track which parents have clicked "Read" on an important circular. | P0 | Admin, Faculty | `feat_circular_read_receipts` |
| F392 | Multilingual Notice Translation | Write in English; auto-translates to Hindi & Marathi via Google API. | P1 | Admin | `feat_notice_translation` |
| F393 | School Event Photo Gallery | Secure photo albums of Sports Day and Annual Fest with privacy blur. | P0 | All | `feat_event_gallery` |
| F394 | Digital School Magazine / Newsletter | Quarterly PDF flipbook magazine published to student portals. | P1 | All | `feat_digital_magazine` |
| F395 | Scheduled Message Dispatcher | Compose announcement at 8:00 PM; auto-fires tomorrow at 7:30 AM. | P0 | Admin | `feat_scheduled_messages` |
| F396 | SMS & WhatsApp Delivery Analytics | Dashboard showing Sent, Delivered, Failed, and Read message counts. | P0 | Admin | `feat_msg_delivery_analytics` |
| F397 | Parent Feedback & Poll Engine | Conduct 1-click surveys (e.g. "Support for revised summer uniform?"). | P0 | Admin, Parent | `feat_parent_polls` |
| F398 | PTA (Parent Teacher Association) Hub | Dedicated portal section for elected PTA committee members. | P1 | Parent, Admin | `feat_pta_hub` |
| F399 | Automated Fee Reminder Sequence | Automated D-7, D-3, D-day, D+3 multi-channel reminder cadence. | P0 | System | `feat_auto_fee_reminders` |
| F400 | Automated Attendance Alert Trigger | Fires immediately when roll call is submitted without human intervention. | P0 | System | `feat_auto_attendance_alert` |
| F401 | Birthday Greeting Automation | Auto-sends personalized warm birthday card to student on morning of birth. | P0 | System | `feat_auto_birthday_card` |
| F402 | Two-Way SMS Fallback Engine | Falls back to SMS if WhatsApp message delivery fails or times out. | P1 | System | `feat_sms_fallback` |
| F403 | Audio Voice Broadcast (OBD) Calls | Outbound dialer pre-recorded voice call to parents for urgent alerts. | P2 | Admin | `feat_voice_obd_broadcast` |
| F404 | Parent Meeting Appointment Scheduler | Parents select available 15-minute slot on PTM (Parent Teacher Meeting) day. | P0 | Parent, Faculty | `feat_ptm_scheduler` |
| F405 | Principal Weekly Video Message | Embed weekly video address from head of school directly in dashboard. | P1 | Admin | `feat_principal_video` |
| F406 | Internal Staff Memo Channel | Private communication channel between management and teachers only. | P0 | Admin, Staff | `feat_internal_staff_memos` |
| F407 | Digital Circular Signature Form | Parents type full name to digitally consent to out-of-station picnic. | P0 | Parent | `feat_picnic_consent_form` |
| F408 | Unsubscribe / Opt-Out Compliance | Respect DND preference for non-essential promotional communications. | P0 | System | `feat_dnd_compliance` |
| F409 | Message Credit Low Balance Alert | Email to admin when SMS credits fall below 500 units. | P0 | Admin | `feat_msg_credit_alert` |
| F410 | Communication Audit Log | Permanent log of every message sent, timestamp, and recipient phone. | P0 | Admin | `feat_communication_audit` |

---

## Module 15: Library Management System (Features 411 - 430)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F411 | Book Catalog & Accession Master | ISBN, Title, Author, Publisher, Edition, Subject, Rack Number. | P0 | Staff | `feat_library_catalog` |
| F412 | Barcode & QR Code Label Generator | Print self-adhesive barcode labels for book spines directly from app. | P0 | Staff | `feat_book_barcode_gen` |
| F413 | 10-Second Book Issue & Return | Scan student ID card, scan book barcode; checkout complete in seconds. | P0 | Staff | `feat_book_checkout` |
| F414 | Overdue Fine Calculation Engine | Automatically charges ₹2/day for books returned past the due date. | P0 | Staff, Accounts | `feat_library_fines` |
| F415 | Automated Overdue Book WhatsApp Alert | Notifies student 1 day before due date and when overdue. | P0 | System | `feat_library_overdue_sms` |
| F416 | Student Online Book Reservation | Students browse library OPAC and reserve books from their portal. | P0 | Student | `feat_book_reservation` |
| F417 | Digital OPAC (Online Public Access Catalog) | Search library by title, author, keyword with live available copy count. | P0 | All | `feat_opac_search` |
| F418 | Lost Book Penalty & Damaged Asset Log | Record lost books, assess replacement cost, and update catalog counts. | P0 | Staff, Accounts | `feat_lost_book_penalty` |
| F419 | Periodical, Magazine & Journal Tracker | Track daily newspaper arrivals and monthly magazine subscriptions. | P1 | Staff | `feat_periodical_tracker` |
| F420 | E-Book & Digital PDF Library Vault | Upload open-access educational e-books for students to read online. | P0 | All | `feat_ebook_vault` |
| F421 | Member Borrowing Quota Configuration | Students max 2 books for 14 days; Faculty max 5 books for 30 days. | P0 | Staff | `feat_borrowing_quotas` |
| F422 | Library Clearance (No-Dues) Certificate | Instant validation that student has returned all books before TC issue. | P0 | Staff | `feat_library_no_dues` |
| F423 | Most Popular Books Analytics | Dashboard ranking the most borrowed books and reading trends by class. | P1 | Staff | `feat_library_analytics` |
| F424 | Physical Stock Verification Scanner | Scan all books on shelf to identify missing or misplaced titles. | P1 | Staff | `feat_stock_verification` |
| F425 | Dewey Decimal Classification (DDC) Tagging | Support standard library classification call numbers. | P1 | Staff | `feat_ddc_tagging` |
| F426 | Library Reading Room Footfall Logger | Log student entries into reading hall for library accreditation metrics. | P1 | Staff | `feat_reading_room_footfall` |
| F427 | Library Book Purchase Requisition | Teachers suggest new titles; Librarian approves and tracks purchase. | P1 | Faculty, Staff | `feat_book_requisition` |
| F428 | Multi-Copy Inventory Tracking | Track Copy 1, Copy 2, Copy 3 status (Issued, Available, Binding). | P0 | Staff | `feat_multicopy_tracking` |
| F429 | Rare Book & Reference Only Tags | Mark encyclopedias as non-issuable reference reading room only. | P0 | Staff | `feat_reference_only_tags` |
| F430 | Library Module Audit Log | Complete history of book additions, write-offs, and fine collections. | P0 | Admin | `feat_library_audit` |

---

## Module 16: Transport & Vehicle Fleet Management (Features 431 - 450)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F431 | Vehicle Fleet Master | Bus/Van registration number, chassis no, seat capacity, fuel type. | P0 | Staff | `feat_transport_fleet` |
| F432 | Route & Bus Stop Master | Define routes (Route 1 - North) with ordered stops and pickup times. | P0 | Staff | `feat_transport_routes` |
| F433 | Student Bus Stop Allocation | Link student to specific pickup/drop point with auto-fee calculation. | P0 | Staff, Accounts | `feat_student_bus_allocation` |
| F434 | Driver & Conductor Directory | License number, police verification certificate, mobile phone. | P0 | Staff | `feat_driver_directory` |
| F435 | Vehicle Fitness & Insurance Expiry Tracker | Automated alerts 30 days before RTO fitness or insurance expires. | P0 | Staff | `feat_vehicle_compliance_alerts` |
| F436 | Live GPS Bus Tracking Integration | Webhook integration for GPS tracking device vendor APIs. | P1 | Parent, Staff | `feat_gps_bus_tracking` |
| F437 | Bus Delay WhatsApp Notification | Send instant alert: *"Bus Route 4 running 20 mins late due to traffic"*. | P0 | Staff | `feat_bus_delay_broadcast` |
| F438 | Student Transport Manifest / Roll List | Print-ready list of students per bus stop for driver/conductor. | P0 | Staff | `feat_bus_manifest` |
| F439 | Seat Capacity Exceeded Warning | Prevents assigning 60 students to a 40-seater bus. | P0 | Staff | `feat_bus_capacity_check` |
| F440 | Pollution Under Control (PUC) Monitor | Track quarterly emission certificate renewals per vehicle. | P0 | Staff | `feat_puc_tracking` |
| F441 | Fuel Log & Mileage Fuel Efficiency Calculator | Log diesel liters and odometer reading to track km/liter mileage. | P1 | Staff | `feat_fuel_log` |
| F442 | Vehicle Repair & Maintenance Work Orders | Track tire replacements, engine service, and annual overhaul bills. | P1 | Staff, Accounts | `feat_vehicle_maintenance` |
| F443 | Bus Proximity Parent Alert (Geofence) | Alert parent phone when school bus is 1km away from pickup stop. | P1 | Parent | `feat_bus_proximity_alert` |
| F444 | Temporary Stop Change Request | Parent requests child drop at grandmother's stop for one evening. | P1 | Parent, Staff | `feat_temp_stop_change` |
| F445 | Speed Limit Violation Monitor | Alerts management if bus exceeds school safety speed limit (40 km/h). | P2 | Staff | `feat_speed_violation_alert` |
| F446 | Driver Alcohol / Medical Test Log | Periodic mandatory eye test and breathalyzer compliance records. | P1 | Staff | `feat_driver_medical_log` |
| F447 | Transport Fee Distance Slab Engine | Link stop distance (km) directly to student fee installment ledger. | P0 | Accounts | `feat_transport_distance_fee` |
| F448 | Transport Staff Attendance | Daily roll call of drivers and lady attendants on duty. | P0 | Staff | `feat_transport_staff_attendance` |
| F449 | First Aid Box & CCTV Verification Check | Monthly safety checklist for Supreme Court school bus guidelines. | P0 | Staff | `feat_bus_safety_checklist` |
| F450 | Transport Module Audit Log | Track changes to routes, driver assignments, and vehicle registrations. | P0 | Admin | `feat_transport_audit` |

---

## Module 17: Hostel & Dormitory Management (Features 451 - 470)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F451 | Hostel Building & Block Master | Define Boys Hostel, Girls Hostel, Junior Block, Warden Residence. | P0 | Staff | `feat_hostel_master` |
| F452 | Floor, Room & Bed Allocation Engine | Manage room numbers, AC/Non-AC, Bed A/B/C/D with availability tags. | P0 | Staff | `feat_hostel_room_allocation` |
| F453 | Student Room Allotment Slip | Official room assignment certificate with inventory handover list. | P0 | Student, Staff | `feat_room_allotment_slip` |
| F454 | Digital Out-Pass & Leave Request | Student applies for weekend home pass; Warden & Parent approve online. | P0 | Student, Parent, Staff | `feat_hostel_outpass` |
| F455 | Out-Pass Gatekeeper QR Verification | Security guard scans QR code on student phone at main gate before exit. | P0 | Staff | `feat_gate_pass_qr_scan` |
| F456 | Night Curfew Roll Call Register | Warden records presence at 9:00 PM; alerts warden of missing borders. | P0 | Staff | `feat_hostel_curfew_rollcall` |
| F457 | Hostel Mess Menu Calendar | Weekly rotating meal schedule (Breakfast, Lunch, Snacks, Dinner). | P0 | Student, Staff | `feat_mess_menu` |
| F458 | Student Dietary Preference Tracking | Record Vegetarian, Jain, Non-Veg, or gluten allergy preferences. | P0 | Staff | `feat_dietary_preferences` |
| F459 | Hostel Disciplinary Infraction Log | Record room inspection warnings, contraband, noise violations. | P0 | Staff, Admin | `feat_hostel_disciplinary_log` |
| F460 | Room Asset Handover Checklist | Bed, mattress, study desk, chair, wardrobe key condition checklist. | P0 | Staff | `feat_room_asset_checklist` |
| F461 | Room Maintenance Request Tracker | Students log broken fan, plumbing leak, or fused bulb for repair. | P0 | Student, Staff | `feat_room_maintenance_tickets` |
| F462 | Visitor / Parent Hostel Visit Log | Record parent visits to hostel premises with time in/time out. | P1 | Staff | `feat_hostel_visitor_log` |
| F463 | Hostel Fee Automatic Billing | Links room category (Single/Sharing) directly to student fee invoice. | P0 | Accounts | `feat_hostel_billing` |
| F464 | Vacation Room Vacation & Storage | Manage luggage cloakroom storage during summer/winter vacations. | P1 | Staff | `feat_vacation_storage` |
| F465 | Laundry & Wash Schedule Tracker | Schedule weekly clothes washing quotas and dry-cleaning pickup. | P1 | Staff | `feat_laundry_tracker` |
| F466 | Warden Shift Roster | Rotation of resident wardens and night superintendents on campus. | P1 | Staff | `feat_warden_roster` |
| F467 | Sick Bay & Medical Isolation Tracker | Log students admitted to hostel infirmary with doctor prescription. | P0 | Staff | `feat_infirmary_tracker` |
| F468 | Inter-Room Transfer Workflow | Transfer student to different room with inventory reassignment. | P0 | Staff | `feat_room_transfer` |
| F469 | Hostel No-Dues Clearance Certificate | Verifies room key return and damage assessment before student departure. | P0 | Staff | `feat_hostel_no_dues` |
| F470 | Hostel Module Audit Log | Immutable record of bed allocations, disciplinary actions, and out-passes. | P0 | Admin | `feat_hostel_audit` |

---

## Module 18: Inventory, Procurement & Physical Assets (Features 471 - 490)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F471 | Item Category & Master Catalog | Science Lab chemicals, Stationery, Uniforms, Sports gear, Furniture. | P0 | Staff | `feat_inventory_catalog` |
| F472 | Vendor & Supplier Directory | Vendor GSTIN, contact person, bank details, payment terms. | P0 | Staff, Accounts | `feat_vendor_directory` |
| F473 | Purchase Order (PO) Generator | Formal branded PO generation with line items, tax, and delivery date. | P0 | Accounts, Staff | `feat_purchase_orders` |
| F474 | Goods Received Note (GRN) Inspector | Compare received physical goods against PO before approving invoice. | P0 | Staff | `feat_grn_inspection` |
| F475 | Stock Issue to Department / Teacher | Issue 5 reams of paper to Math Department with digital signature. | P0 | Staff | `feat_stock_issue` |
| F476 | Real-time Stock Balance & Low-Stock Alerts | Notifies storekeeper when A4 paper stock drops below 10 boxes. | P0 | Staff | `feat_low_stock_alerts` |
| F477 | School Uniform & Book Sale Counter | Direct retail counter to sell branded uniforms and books to students. | P0 | Staff, Accounts | `feat_store_point_of_sale` |
| F478 | Physical Asset Tagging (Barcode / QR) | Affix metallic QR stickers on computers, projectors, lab microscopes. | P0 | Staff | `feat_asset_qr_tagging` |
| F479 | Asset Depreciation Calculator | Straight-line / WDV depreciation calculation for annual financial audit. | P1 | Accounts | `feat_asset_depreciation` |
| F480 | Lab Equipment Calibration & AMC Tracker | Track Annual Maintenance Contracts (AMC) for ACs, lab spectrometers. | P1 | Staff | `feat_amc_contracts` |
| F481 | Scrap & Obsolete Asset Write-off | De-commission broken furniture with board condemnation approval log. | P1 | Staff, Admin | `feat_asset_writeoff` |
| F482 | Annual Physical Stock Audit Sheet | Compare physical counted stock against digital ledger quantities. | P0 | Staff | `feat_physical_stock_audit` |
| F483 | Departmental Budget Allocation & Spend | Allocate ₹2 Lakhs budget to Science Dept; track purchase deductions. | P1 | Accounts | `feat_dept_budgets` |
| F484 | Uniform Size Exchange Log | Process student size replacements (Size 32 to Size 34) with stock adj. | P0 | Staff | `feat_uniform_exchange` |
| F485 | Returnable Gate Pass for Asset Repair | Issue pass when shipping a broken projector off-campus for repair. | P0 | Staff | `feat_returnable_gate_pass` |
| F486 | Chemistry Lab Hazardous Chemical Log | Mandatory government register of acid/hazardous chemical quantities. | P1 | Staff | `feat_hazardous_chemical_log` |
| F487 | Supplier Rate Contract Comparison | Compare quotes from 3 vendors before awarding annual printing contract. | P1 | Accounts | `feat_supplier_quotations` |
| F488 | Multi-Store Warehouse Management | Main Store vs Science Lab Store vs Sports Room sub-inventories. | P1 | Staff | `feat_multi_store` |
| F489 | Asset Maintenance Ticketing | Teachers scan QR code on classroom projector to report lamp failure. | P0 | Faculty, Staff | `feat_asset_maintenance_ticket` |
| F490 | Inventory Module Audit Log | Complete ledger of stock receipts, issues, scrap adjustments, and POs. | P0 | Admin | `feat_inventory_audit` |

---

## Module 19: Student & Parent Dedicated Portals (Features 491 - 515)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F491 | Responsive Student Dashboard | Overview of today's classes, attendance %, pending tasks, notifications. | P0 | Student | `feat_student_portal` |
| F492 | Multi-Child Parent Switcher | Parents with 2 or 3 kids in the school switch children with 1 tap. | P0 | Parent | `feat_multichild_parent` |
| F493 | 1-Tap Fee Payment from Dashboard | Pay pending dues directly from home screen using UPI / Card. | P0 | Parent | `feat_parent_1tap_pay` |
| F494 | Live Attendance Calendar View | Visual monthly calendar with green dots (Present) and red dots (Absent). | P0 | Student, Parent | `feat_parent_attendance_view` |
| F495 | Digital Marksheet & Report Card Download | Download signed PDF report cards with QR verification watermark. | P0 | Student, Parent | `feat_parent_marksheet_view` |
| F496 | Daily Homework & Classwork Stream | See daily assignments with teacher instructions and attached PDFs. | P0 | Student, Parent | `feat_parent_homework_view` |
| F497 | Timetable & Bell Schedule Viewer | Weekly schedule showing period times and subject teachers. | P0 | Student, Parent | `feat_portal_timetable_view` |
| F498 | Teacher Contact & Message Thread | Secure messaging with class teacher with file attachment support. | P0 | Parent | `feat_parent_teacher_msg` |
| F499 | School Circulars & Digital Diary | View all official circulars, permissions, and school calendar events. | P0 | Student, Parent | `feat_portal_circulars` |
| F500 | Library Book Borrowing Status | View currently checked-out books and days remaining before overdue. | P0 | Student | `feat_portal_library_view` |
| F501 | Bus Route Stop & Driver Phone Info | View bus number, route name, driver name, and emergency phone. | P0 | Parent | `feat_portal_transport_info` |
| F502 | Hostel Room & Mess Menu Viewer | Check current room allocation, roommate names, and weekly meals. | P0 | Student, Parent | `feat_portal_hostel_view` |
| F503 | Student Profile Update Request | Parent submits address/phone correction with document proof upload. | P0 | Parent | `feat_profile_update_request` |
| F504 | Student Leave Application Form | Apply for sick leave directly from app with medical slip attachment. | P0 | Parent | `feat_portal_leave_apply` |
| F505 | PTM Slot Booking Interface | Pick preferred 15-minute time slot to meet teacher during conference. | P0 | Parent | `feat_portal_ptm_booking` |
| F506 | Student ID Card Digital Pass | Digital ID card with barcode displayed on phone screen for campus entry. | P0 | Student | `feat_digital_id_pass` |
| F507 | Birthday Wish Notification Banner | Warm celebration card displayed on student's birthday in their portal. | P0 | Student | `feat_portal_birthday_banner` |
| F508 | Academic Progress Comparison Chart | Radar chart showing performance across Science vs Math vs English. | P1 | Student, Parent | `feat_performance_radar` |
| F509 | Student Achievement Showcase | Digital trophy cabinet showing badges, medals, and certificates earned. | P0 | Student, Parent | `feat_trophy_cabinet` |
| F510 | Document Download Vault | Download Bonafide certificate, Fee Receipts, and Term Marksheets anytime. | P0 | Student, Parent | `feat_portal_document_vault` |
| F511 | Push Notification Center | Notification history drawer grouping all alerts from past 30 days. | P0 | Student, Parent | `feat_portal_notification_drawer` |
| F512 | School Contact & Emergency Directory | 1-tap call button to School Reception, Bursar, and Transport Head. | P0 | Parent | `feat_emergency_call_directory` |
| F513 | Anonymous Suggestion Box | Submit constructive improvement suggestions to school management. | P1 | Parent, Student | `feat_suggestion_box` |
| F514 | Multi-Language Interface Toggle | Switch portal language between English, हिन्दी (Hindi), and मराठी (Marathi). | P0 | Student, Parent | `feat_portal_i18n` |
| F515 | Dark Mode / Light Mode Preference | User toggleable high-contrast sleek dark theme or clean light theme. | P0 | All | `feat_theme_preference` |

---

## Module 20: Teacher Portal & Classroom Command Center (Features 516 - 535)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F516 | Teacher Morning Classroom Dashboard | Next class countdown, quick attendance button, substitution notices. | P0 | Faculty | `feat_teacher_dashboard` |
| F517 | 1-Tap Class Roll Call Launch | Instant jump directly into today's active period attendance screen. | P0 | Faculty | `feat_quick_rollcall_launch` |
| F518 | Student Behavior Notes & Merits | Award positive points or disciplinary flags to students in real-time. | P0 | Faculty | `feat_behavior_merits` |
| F519 | Quick Mark Entry Launcher | Direct jump to open test gradebooks with auto-save indicator. | P0 | Faculty | `feat_quick_marks_launch` |
| F520 | Today's Homework Posting Widget | Post assignment in under 60 seconds from mobile phone interface. | P0 | Faculty | `feat_quick_homework_post` |
| F521 | Personal Teacher Timetable View | Weekly grid highlighting free periods, library duties, and lab hours. | P0 | Faculty | `feat_teacher_personal_timetable` |
| F522 | My Leave Balances & Apply Form | Check CL/ML remaining and submit digital leave application in 2 taps. | P0 | Faculty | `feat_teacher_leave_portal` |
| F523 | Assigned Substitution Class Alerts | Alert card showing proxy classes assigned for the day with room no. | P0 | Faculty | `feat_proxy_class_card` |
| F524 | Class Roster & Parent Contact Book | Alphabetical list of students with 1-tap call to registered parent. | P0 | Faculty | `feat_class_contact_book` |
| F525 | Student Birthday Reminders Today | Notification of students in teacher's class celebrating birthday today. | P0 | Faculty | `feat_classroom_birthday_alerts` |
| F526 | Student Medical Alert Warnings | Red badge next to student name alerting teacher of severe asthma/allergy. | P0 | Faculty | `feat_medical_alert_badge` |
| F527 | Teacher Salary Slip Downloader | View and download monthly payslips directly from mobile portal. | P1 | Faculty | `feat_teacher_payslip_view` |
| F528 | Syllabus Progress Checklist | Check off completed topics against academic year lesson plan. | P1 | Faculty | `feat_syllabus_checklist` |
| F529 | Rapid Keyboard Navigation Mode | Full keyboard shortcut support for fast mark and attendance entry. | P0 | Faculty | `feat_fast_keyboard_mode` |
| F530 | Offline Attendance Mode Status | Clear visual banner: "Working Offline - 2 class registers ready to sync". | P0 | Faculty | `feat_offline_sync_banner` |
| F531 | Teacher Document Upload Vault | Upload B.Ed degree, refresher certificates, and publication PDFs. | P0 | Faculty | `feat_teacher_doc_vault` |
| F532 | Quick Broadcast to My Class | Send urgent message to all parents of teacher's specific section. | P0 | Faculty | `feat_class_broadcast_msg` |
| F533 | PTM Schedule & Notes Recorder | View booked parent slots and write meeting action items online. | P0 | Faculty | `feat_ptm_notes_recorder` |
| F534 | Teacher Workload Summary Stat | Live counter showing periods taught this week vs contract workload. | P0 | Faculty | `feat_workload_stat` |
| F535 | Classroom Seating Plan Viewer | View or customize student desk arrangements (front vs back bench). | P1 | Faculty | `feat_seating_plan_viewer` |

---

## Module 21: Security, RBAC & Audit Trails (Features 536 - 550)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F536 | Granular Role-Based Access Control (RBAC) | Create custom roles (e.g. "Junior Accountant", "Lab In-charge"). | P0 | Admin | `feat_granular_rbac` |
| F537 | Permission Matrix Editor | Visual grid of 120+ granular permissions (View, Create, Edit, Delete). | P0 | Admin | `feat_permission_matrix` |
| F538 | Multi-Factor Authentication (MFA / 2FA) | TOTP (Google Authenticator) enforcement for Super Admin and Principals. | P0 | SuperAdmin, Admin | `feat_mfa_totp` |
| F539 | Immutable System Audit Trail | Records every create, update, delete with User ID, Timestamp, and IP. | P0 | SuperAdmin, Admin | `feat_system_audit_log` |
| F540 | Field-Level Diff Tracking | Audit log shows exact before/after value changes (e.g. Fee ₹5k -> ₹4k). | P0 | Admin | `feat_field_diff_audit` |
| F541 | Session Inactivity Timeout | Auto-logout idle sessions after 30 minutes of inactivity. | P0 | All | `feat_session_timeout` |
| F542 | Single Active Session Enforcement | Prevents sharing of administrative credentials across multiple PCs. | P1 | Admin | `feat_single_session` |
| F543 | Suspicious Login Alert | Email alert when account is accessed from a new device or IP address. | P0 | All | `feat_suspicious_login_alert` |
| F544 | Password Strength & Expiry Policies | Enforce 8+ characters, symbols, numbers, and 90-day password renewal. | P0 | Admin | `feat_password_policies` |
| F545 | Row-Level Security (Postgres RLS) | Database-level cryptographic barrier preventing cross-tenant access. | P0 | System | `feat_db_rls` |
| F546 | Sensitive Data Masking | Masks parent credit card and Aadhaar numbers (e.g. `XXXX-XXXX-1234`). | P0 | All | `feat_data_masking` |
| F547 | Automated Daily Database Backups | Automated pg_dump snapshot to encrypted S3 with 30-day retention. | P0 | SuperAdmin | `feat_automated_backups` |
| F548 | 1-Click Point-in-Time Recovery | Restore tenant database to any specific hour in case of catastrophic error. | P1 | SuperAdmin | `feat_point_in_time_recovery` |
| F549 | DPDPA (India Privacy Law) Compliance | Data erasure and "Right to be Forgotten" workflow for student records. | P0 | Admin | `feat_dpdpa_compliance` |
| F550 | API Rate Limiting & DDoS Shield | Protects login endpoints from brute-force password guessing attacks. | P0 | System | `feat_rate_limiting` |

---

## Module 22: Offline-First Sync & PWA Infrastructure (Features 551 - 565)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F551 | Progressive Web App (PWA) Manifest | Installable on Windows, macOS, Android, iOS with native app icon. | P0 | All | `feat_pwa_install` |
| F552 | Client-Side Database (Dexie.js IndexedDB) | Stores working datasets locally in browser for 0ms read latency. | P0 | System | `feat_indexeddb_core` |
| F553 | Durable Outbox Mutation Queue | Queues offline writes (attendance, marks, receipts) until reconnected. | P0 | System | `feat_outbox_queue` |
| F554 | Automatic Online Event Listener | Fires background sync immediately upon detecting network restoration. | P0 | System | `feat_online_sync_listener` |
| F555 | Offline Status Bar & Pending Badge | Real-time visual pill: 🟢 Online vs 🟠 Offline (3 actions queued). | P0 | All | `feat_network_status_pill` |
| F556 | Idempotent Sync Endpoints | Server checks UUID idempotency keys to prevent duplicate record writes. | P0 | System | `feat_idempotent_sync` |
| F557 | Conflict Resolution (Timestamp LWW) | Server-authoritative resolution for simultaneous edits. | P0 | System | `feat_conflict_resolution` |
| F558 | Optimistic UI Updates | Client UI updates immediately without waiting for server response. | P0 | All | `feat_optimistic_ui` |
| F559 | Service Worker App Shell Pre-Caching | Pre-caches CSS, JavaScript, and fonts for instant offline startup. | P0 | System | `feat_service_worker` |
| F560 | Manual "Sync Now" Button | User can force instant synchronization when connectivity feels sluggish. | P0 | Staff | `feat_manual_sync_trigger` |
| F561 | Sync Failure Toast with Retry | Informs user if a record failed validation with clear retry instructions. | P0 | All | `feat_sync_error_toast` |
| F562 | Offline Storage Usage Meter | Settings widget displaying MB of IndexedDB storage consumed on device. | P1 | Staff | `feat_offline_storage_meter` |
| F563 | Selective Cache Invalidation | Intelligently refreshes local cache when server records are updated. | P0 | System | `feat_cache_invalidation` |
| F564 | Low-Bandwidth Mode Toggle | Strips heavy images and charts when operating over slow 2G connections. | P1 | All | `feat_low_bandwidth_mode` |
| F565 | Background Sync API Registration | Native browser background sync for Chrome/Android even if tab is closed. | P1 | System | `feat_background_sync_api` |

---

## Module 23: Global Search, Tours & Analytics (Features 566 - 580)

| ID | Feature Name | Description | Priority | Roles | Feature Flag Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F566 | Universal Command Palette (Ctrl + K) | Instant search jump to any student, class, invoice, or setting. | P0 | All | `feat_command_palette` |
| F567 | Role-Based Interactive Guided Tours | Step-by-step Driver.js spotlight walkthrough tailored to user's role. | P0 | All | `feat_guided_tours` |
| F568 | In-App Contextual Help & Tooltips | Helpful explanation tooltips next to complex settings and forms. | P0 | All | `feat_contextual_help` |
| F569 | Empty State Action Guides | Beautiful illustrations with clear "Add Your First Student" buttons. | P0 | All | `feat_empty_state_guides` |
| F570 | Executive KPI Dashboard Cards | Real-time counters: Active Students, Fee Collected, Attendance Today. | P0 | Admin | `feat_kpi_dashboard` |
| F571 | Custom Report Builder | Select columns, apply filters, and export customized tabular data. | P0 | Admin | `feat_custom_report_builder` |
| F572 | Scheduled Email Reports | Weekly PDF executive summary sent to Principal every Sunday evening. | P0 | Admin | `feat_scheduled_reports` |
| F573 | Multi-Format Data Exporter | 1-Click export of any table to Excel (.xlsx), CSV, and PDF. | P0 | Staff | `feat_multi_exporter` |
| F574 | Interactive Data Charts (Recharts) | Smooth responsive charts for fee collections, attendance, and grades. | P0 | All | `feat_data_charts` |
| F575 | Dark / Light Theme System | Flawless contrast adhering to WCAG AA accessibility standards. | P0 | All | `feat_theme_system` |
| F576 | Keyboard Shortcut Cheatsheet | Press `?` to open overlay of all available keyboard navigation shortcuts. | P0 | All | `feat_keyboard_cheatsheet` |
| F577 | In-App Feature Announcement Modal | Informs staff of newly released ERP updates with feature highlights. | P0 | All | `feat_release_notes_modal` |
| F578 | Action Undo Toast (Sonner) | 5-second "Undo" snackbar when deleting a record to prevent mistakes. | P0 | All | `feat_action_undo` |
| F579 | Performance Audit Telemetry | Client-side tracking of page transition times (targeting sub-100ms). | P0 | System | `feat_telemetry` |
| F580 | Integrated Feedback Submission | Built-in widget for staff to send bugs and feature suggestions. | P0 | All | `feat_feedback_widget` |
