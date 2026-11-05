import { PrismaClient, TenantType, UserRole, Gender } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log("Seeding PostgreSQL occocore_db...");

  // 1. Create or update Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "apexacademy" },
    update: {
      name: "Apex International Global Academy",
      type: TenantType.K12_SCHOOL,
      primary_color: "#DC2626",
      secondary_color: "#091D17",
      motto: "Excellence in Academics & Moral Leadership",
    },
    create: {
      name: "Apex International Global Academy",
      slug: "apexacademy",
      type: TenantType.K12_SCHOOL,
      primary_color: "#DC2626",
      secondary_color: "#091D17",
      motto: "Excellence in Academics & Moral Leadership",
      udise_code: "07010200301",
      affiliation_no: "CBSE/AFF/2026/0491",
    },
  });

  // 2. Create Master Admin User
  await prisma.user.upsert({
    where: {
      tenant_id_email: {
        tenant_id: tenant.id,
        email: "principal@apexacademy.edu",
      },
    },
    update: {
      first_name: "Super",
      last_name: "Admin",
      role: UserRole.ADMIN,
      password_hash: "AdminPass@2026",
      pin_hash: "2468",
      is_active: true,
    },
    create: {
      tenant_id: tenant.id,
      email: "principal@apexacademy.edu",
      first_name: "Super",
      last_name: "Admin",
      role: UserRole.ADMIN,
      password_hash: "AdminPass@2026",
      pin_hash: "2468",
      is_active: true,
    },
  });

  // 3. Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: {
      tenant_id_title: {
        tenant_id: tenant.id,
        title: "2026-2027",
      },
    },
    update: { is_current: true },
    create: {
      tenant_id: tenant.id,
      title: "2026-2027",
      start_date: new Date("2026-04-01"),
      end_date: new Date("2027-03-31"),
      is_current: true,
    },
  });

  // 4. Class and Section
  let class10 = await prisma.class.findFirst({
    where: { tenant_id: tenant.id, name: "Class 10" },
  });
  if (!class10) {
    class10 = await prisma.class.create({
      data: {
        tenant_id: tenant.id,
        academic_year_id: academicYear.id,
        name: "Class 10",
        numeric_level: 10,
      },
    });
  }

  let sectionA = await prisma.section.findFirst({
    where: { tenant_id: tenant.id, class_id: class10.id, name: "Section A" },
  });
  if (!sectionA) {
    sectionA = await prisma.section.create({
      data: {
        tenant_id: tenant.id,
        class_id: class10.id,
        name: "Section A",
        capacity: 40,
      },
    });
  }

  // 5. Sample Students
  const sampleStudents = [
    { adm: "SCH/2026/0491", roll: 14, fn: "Aarav", ln: "Sharma", gen: Gender.MALE, cat: "GENERAL" },
    { adm: "SCH/2026/0492", roll: 18, fn: "Ananya", ln: "Deshmukh", gen: Gender.FEMALE, cat: "OBC_NCL" },
    { adm: "SCH/2026/0493", roll: 23, fn: "Rohan", ln: "Kulkarni", gen: Gender.MALE, cat: "GENERAL" },
    { adm: "SCH/2026/0494", roll: 29, fn: "Ishaan", ln: "Verma", gen: Gender.MALE, cat: "SC" },
    { adm: "SCH/2026/0495", roll: 35, fn: "Tanvi", ln: "Patil", gen: Gender.FEMALE, cat: "GENERAL" },
  ];

  for (const s of sampleStudents) {
    await prisma.student.upsert({
      where: {
        tenant_id_admission_no: {
          tenant_id: tenant.id,
          admission_no: s.adm,
        },
      },
      update: {
        roll_no: s.roll,
        first_name: s.fn,
        last_name: s.ln,
        category: s.cat,
      },
      create: {
        tenant_id: tenant.id,
        section_id: sectionA.id,
        admission_no: s.adm,
        roll_no: s.roll,
        first_name: s.fn,
        last_name: s.ln,
        gender: s.gen,
        dob: new Date("2011-05-15"),
        category: s.cat,
        is_rte_quota: false,
        emergency_phone: "9820011223",
      },
    });
  }

  console.log("Seeding complete! Tenant ID:", tenant.id);
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
