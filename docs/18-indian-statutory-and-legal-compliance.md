# Indian Statutory, Regulatory & Legal Compliance Framework

> **Mandatory Legal Baseline for Education ERP in India**  
> Covers K-12 Schools, Colleges, Universities, Coaching Centers, EdTech SaaS, Taxation, and Telecommunications.

---

## 1. Digital Personal Data Protection Act, 2023 (DPDPA 2023) Compliance

Because the platform processes data of minor students (under 18 years of age), compliance with DPDPA 2023 is non-negotiable.

### 1.1 Section 9: Specific Protections for Children
1. **Verifiable Parental Consent (VPC)**:
   - Before any student account (under 18) is activated, verifiable consent of the parent or lawful guardian is legally required.
   - Flow: System dispatches an OTP/Digital Consent link to the parent's registered mobile number/email. Account activation timestamp is logged with parent Aadhaar/ID verification token.
2. **Absolute Ban on Behavioral Monitoring & Tracking of Children**:
   - **Section 9(2)**: No data fiduciary shall undertake tracking or behavioral monitoring of children or targeted advertising directed at children.
   - Platform guarantee: The ERP contains **zero tracking pixels**, zero third-party commercial analytics (e.g., no Google AdSense, no Facebook Pixels, no marketing cookies).
3. **No Detrimental Processing**:
   - **Section 9(3)**: Processing that causes detrimental effect on the well-being of a child is strictly barred.

### 1.2 Data Fiduciary Obligations & Rights
- **Section 5 (Notice)**: Plain-language notice available in English, Hindi, and regional Eighth Schedule languages detailing the exact purpose of data collection.
- **Section 12 (Right to Correction & Erasure)**: Parents have the statutory right to request correction of inaccurate data or deletion of non-statutory data upon student withdrawal.
- **Data Protection Officer (DPO)**: Institutional contact card must publish the designated Grievance Officer name, email, and 30-day response SLA.

---

## 2. CERT-In Cyber Security Directions (April 2022 Mandate)

Under Section 70B of the Information Technology Act, 2000:
1. **Mandatory 180-Day Log Retention**:
   - All server access logs, firewall logs, user authentication logs, and database mutation audit logs must be securely retained within Indian jurisdiction for **at least 180 consecutive days**.
2. **NTP Time Synchronization**:
   - All servers and database containers must synchronize their system clocks using the National Physical Laboratory (NPL) or National Informatics Centre (NIC) NTP servers.
3. **6-Hour Security Incident Reporting**:
   - Any confirmed cybersecurity breach or unauthorized student data access must be reported to CERT-In within 6 hours of detection.

---

## 3. Right to Education (RTE) Act, 2009 & K-12 Statutory Rules

1. **Section 12(1)(c) - 25% Disadvantaged & EWS Quota**:
   - System must provide a dedicated `is_rte_quota` flag.
   - For RTE students: **100% automated tuition and mandatory fee waiver** is enforced. The billing engine legally bars generating tuition fee invoices for RTE quota seats.
2. **Section 16 - Prohibition of Detention & Expulsion**:
   - Strict adherence to state-specific detention norms for elementary education (Class 1 to 8).
3. **Transfer Certificate (TC) Rules**:
   - Under Section 5 of RTE, a school cannot deny or delay the issuance of a Transfer Certificate to any child moving to another school.
4. **Supreme Court Guidelines on School Bus Safety (M.C. Mehta Mandate)**:
   - Supreme Court guidelines mandate that all school transport features include:
     - Mandatory speed limiter tracking (capped at 40 km/h).
     - GPS tracking and emergency panic button logs.
     - Lady attendant roster tracking for buses carrying female students.
     - Verification of driver commercial driving license (minimum 5 years experience) and zero history of drink-and-drive infractions.

---

## 4. Ministry of Education Guidelines for Coaching Centers (January 2024)

For tenants registered as Coaching Academies, Test Prep Institutes, or Tuition Centers:

1. **Age Restriction Compliance**:
   - **Rule 4(a)**: Coaching institutes are **prohibited from enrolling students below 16 years of age** or students who have not completed secondary school examination (Class 10).
   - Platform constraint: System automatically rejects admission registration for regular coaching batches if student age < 16 based on validated Date of Birth.
2. **Pro-Rata Fee Refund Rule (Mandatory)**:
   - If a student leaves the course midway having paid the full fee upfront, the institute is legally bound to **refund the pro-rata fee within 10 days** for the remaining duration.
   - The ERP features an automated **"Statutory Coaching Refund Calculator"**:
     $$\text{Refund Amount} = \text{Total Fee} - \left( \frac{\text{Classes Conducted}}{\text{Total Classes}} \times \text{Total Fee} \right) - \text{Non-refundable Registration Fee (Capped at 10\%)}$$
3. **No Misleading Rank / Selection Guarantees**:
   - Promotional announcements and banners generated on the portal are legally prohibited from publishing guaranteed rank claims or misleading testimonials.
4. **Classroom Space & Fire Safety Norms**:
   - System enforces classroom capacity checks based on mandatory minimum 1 square meter floor area per enrolled student.

---

## 5. NEP 2020 & UGC / AICTE Higher Education Regulations

1. **UGC Academic Bank of Credits (ABC) Regulations, 2021**:
   - Mandatory field for 12-digit student **APAAR / ABC ID** linked to DigiLocker.
   - Semester transcripts must export credits in standard format for deposit into the National Academic Depository (NAD).
2. **Multiple Entry & Multiple Exit Tracking**:
   - System supports flexible qualification awards:
     - Exit after Year 1 (40-44 credits): **Undergraduate Certificate**
     - Exit after Year 2 (80-88 credits): **Undergraduate Diploma**
     - Exit after Year 3 (120-132 credits): **Bachelor's Degree**
     - Exit after Year 4 (160-176 credits): **Bachelor's Degree (Honours / Research)**
3. **Choice Based Credit System (CBCS) & Relative Grading**:
   - Automatic conversion of percentage to Letter Grades (O, A+, A, B+, B, C, P, F) and Semester Grade Point Average (SGPA) / Cumulative Grade Point Average (CGPA) per UGC 10-point scale formula.

---

## 6. Taxation & Financial Compliance (GST & Income Tax)

1. **GST Exemption for Educational Services**:
   - Under **Notification No. 12/2017 - Central Tax (Rate)**, entry no. 66:
     - Services provided by an educational institution to its students, faculty, and staff are **EXEMPT** from GST (Tuition fees, admission fees, exam fees, hostel, and school transport).
     - Applicable SAC Code: **9992** (Educational Services).
2. **Taxable Commercial Services (18% GST)**:
   - Coaching institutes and private commercial training academies are **NOT EXEMPT** and must levy **18% GST** (9% CGST + 9% SGST or 18% IGST).
   - Invoices generated for coaching tenants automatically compute and display statutory tax breakdowns, Institute GSTIN, and Student State Code.
3. **RBI Guidelines on Payment Gateways & Card Tokenization**:
   - No raw credit/debit card numbers (PAN) or CVVs are ever stored in the database.
   - Integration exclusively with RBI-authorized Payment Aggregators (Razorpay, Cashfree, PayU).
   - Dynamic UPI QR codes adhere strictly to NPCI Merchant Specifications.

---

## 7. TRAI DLT Regulations (Telecom Commercial Communications, 2018)

Every SMS dispatched from the platform must comply with the Telecom Regulatory Authority of India (TRAI) Distributed Ledger Technology (DLT) mandate:
1. **Principal Entity Registration**: Institute must be registered as a Business Entity on telecom portals (Jio, Airtel, Vil, BSNL) with a unique **PE ID**.
2. **Header / Sender ID**: 6-character alpha sender ID (e.g. `APEXAC`, `OXFORD`).
3. **Template ID Verification**: Every automated transactional SMS (OTP, Attendance Alert, Fee Receipt) must match an exact registered **DLT Template ID**. Variable values are sanitized to prevent telecom gateway rejections.
4. **Commercial Timing Restrictions**: Promotional bulk circulars can legally only be transmitted between 9:00 AM and 9:00 PM IST. Urgent transactional emergency alerts (e.g. school closure, student absence) are routed through the 24x7 Service Implicit route.

---

## 8. POCSO Act 2012 & POSH Act 2013 Workplace Compliance

1. **Staff Background & Police Verification Ledger**:
   - Staff onboarding module includes mandatory verification fields: Police Verification Certificate Number, issuing Police Station, and date of clearance.
2. **POSH Internal Complaints Committee (ICC)**:
   - System provides an administrative registry recording the constitution of the mandatory Internal Committee (minimum 50% women members, external NGO representative).
   - Secure, confidential grievance reporting channel.
