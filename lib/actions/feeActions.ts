"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface RealFeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentUuid: string;
  studentName: string;
  cohort: string;
  heads: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue" | "Partial";
  paymentMode?: string;
  paidOn?: string;
  guardianPhone: string;
  receiptNo?: string;
  transactionRef?: string;
}

export interface RealFeeStructure {
  id: string;
  headName: string;
  frequency: "Annual" | "Per Semester" | "Quarterly" | "Monthly";
  amount: number;
  isOptional: boolean;
  concessionAllowed: boolean;
}

export async function getFeeInvoicesAction(): Promise<{ success: boolean; invoices: RealFeeInvoice[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, invoices: [] };
    const tenantId = tenantRes.rows[0].id;

    const res = await query<{
      id: string;
      invoice_no: string;
      title: string;
      amount: string;
      paid_amount: string;
      due_date: string;
      status: string;
      student_uuid: string;
      student_admission_no: string;
      first_name: string;
      last_name: string;
      emergency_phone: string | null;
      class_name: string;
      section_name: string;
      receipt_no: string | null;
      payment_method: string | null;
      transaction_ref: string | null;
      receipt_created_at: Date | null;
    }>(
      `SELECT i.id, i.invoice_no, i.title, i.amount, i.paid_amount,
              to_char(i.due_date, 'YYYY-MM-DD') AS due_date,
              i.status,
              s.id AS student_uuid,
              s.admission_no AS student_admission_no,
              s.first_name, s.last_name, s.emergency_phone,
              c.name AS class_name, sec.name AS section_name,
              r.receipt_no, r.payment_method, r.transaction_ref,
              r.created_at AS receipt_created_at
       FROM invoices i
       JOIN students s ON i.student_id = s.id
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       LEFT JOIN LATERAL (
          SELECT receipt_no, payment_method, transaction_ref, created_at
          FROM receipts
          WHERE invoice_id = i.id
          ORDER BY created_at DESC
          LIMIT 1
       ) r ON true
       WHERE i.tenant_id = $1
       ORDER BY i.created_at DESC`,
      [tenantId]
    );

    const invoices: RealFeeInvoice[] = res.rows.map((row) => {
      const amt = Number(row.amount);
      const paidAmt = Number(row.paid_amount);
      let status: "Paid" | "Pending" | "Overdue" | "Partial" = "Pending";
      const dueDateObj = new Date(row.due_date);
      const today = new Date();

      if (row.status === "PAID" || paidAmt >= amt) {
        status = "Paid";
      } else if (paidAmt > 0 && paidAmt < amt) {
        status = "Partial";
      } else if (dueDateObj < today && row.status !== "PAID") {
        status = "Overdue";
      } else {
        status = "Pending";
      }

      return {
        id: row.id,
        invoiceNo: row.invoice_no,
        studentId: row.student_admission_no,
        studentUuid: row.student_uuid,
        studentName: `${row.first_name} ${row.last_name}`,
        cohort: `${row.class_name} - ${row.section_name}`,
        heads: row.title,
        amount: amt,
        paidAmount: paidAmt,
        dueDate: row.due_date,
        status,
        paymentMode: row.payment_method
          ? row.payment_method === "UPI_QR"
            ? "Dynamic UPI QR"
            : row.payment_method === "BANK_TRANSFER"
            ? "NetBanking / NEFT"
            : row.payment_method
          : undefined,
        paidOn: row.receipt_created_at
          ? new Date(row.receipt_created_at).toLocaleDateString([], {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : undefined,
        guardianPhone: row.emergency_phone || "9876543210",
        receiptNo: row.receipt_no || undefined,
        transactionRef: row.transaction_ref || undefined,
      };
    });

    return { success: true, invoices };
  } catch (error) {
    console.error("Failed to load fee invoices from PostgreSQL:", error);
    return { success: false, invoices: [] };
  }
}

export async function getFeeStructuresAction(): Promise<{ success: boolean; structures: RealFeeStructure[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, structures: [] };
    const tenantId = tenantRes.rows[0].id;

    const res = await query<{
      id: string;
      title: string;
      total_fee: string;
    }>(
      `SELECT id, title, total_fee
       FROM fee_structures
       WHERE tenant_id = $1
       ORDER BY title ASC`,
      [tenantId]
    );

    const structures: RealFeeStructure[] = res.rows.map((row) => ({
      id: row.id,
      headName: row.title,
      frequency: "Quarterly",
      amount: Number(row.total_fee),
      isOptional: false,
      concessionAllowed: true,
    }));

    return { success: true, structures };
  } catch (error) {
    console.error("Failed to load fee structures from PostgreSQL:", error);
    return { success: false, structures: [] };
  }
}

export async function recordFeePaymentAction(payload: {
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: "CASH" | "UPI_QR" | "CARD_POS" | "ONLINE_GATEWAY" | "BANK_TRANSFER" | "CHEQUE";
  transactionRef?: string;
  notes?: string;
}) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    // Fetch the target invoice
    const invRes = await query<{ id: string; amount: string; paid_amount: string; student_id: string }>(
      `SELECT id, amount, paid_amount, student_id FROM invoices WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [payload.invoiceId, tenantId]
    );
    if (invRes.rows.length === 0) return { success: false, error: "Invoice not found" };
    const inv = invRes.rows[0];

    const receiptNo = `RCP/${new Date().getFullYear()}/${String(Math.floor(1000 + Math.random() * 9000))}`;
    const transactionRef = payload.transactionRef || `UPI/NPCI/${Date.now().toString().slice(-8)}`;

    // 1. Insert into receipts table
    const rcpRes = await query<{ id: string }>(
      `INSERT INTO receipts (
          tenant_id,
          invoice_id,
          student_id,
          receipt_no,
          amount,
          payment_method,
          transaction_ref,
          notes,
          created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        tenantId,
        inv.id,
        inv.student_id,
        receiptNo,
        payload.amount,
        payload.paymentMethod,
        transactionRef,
        payload.notes || "Instant payment collected via Dynamic UPI / Counter POS",
      ]
    );

    // 2. Update invoice paid amount and status
    const newPaidAmount = Number(inv.paid_amount) + payload.amount;
    const totalAmount = Number(inv.amount);
    const newStatus = newPaidAmount >= totalAmount ? "PAID" : "PARTIAL";

    await query(
      `UPDATE invoices
       SET paid_amount = $1,
           status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND tenant_id = $4`,
      [newPaidAmount, newStatus, inv.id, tenantId]
    );

    // 3. Log to audit trail
    await query(
      `INSERT INTO audit_logs (
          tenant_id,
          action,
          entity,
          entity_id,
          new_values,
          created_at
       ) VALUES ($1, 'FEE_PAYMENT_RECORDED', 'RECEIPT', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        rcpRes.rows[0].id,
        JSON.stringify({
          receiptNo,
          invoiceId: inv.id,
          amount: payload.amount,
          paymentMethod: payload.paymentMethod,
          transactionRef,
          status: newStatus,
        }),
      ]
    );

    try {
      revalidatePath("/admin");
    } catch {
      // outside request context
    }

    return {
      success: true,
      receiptNo,
      transactionRef,
      newStatus,
      receiptId: rcpRes.rows[0].id,
    };
  } catch (error) {
    console.error("Failed to record fee payment in PostgreSQL:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to record payment" };
  }
}

export async function createFeeInvoiceAction(payload: {
  studentId: string;
  title: string;
  amount: number;
  dueDate: string;
}) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    const invoiceNo = `INV/${new Date().getFullYear()}/${String(Math.floor(100 + Math.random() * 900))}`;

    const res = await query<{ id: string }>(
      `INSERT INTO invoices (
          tenant_id,
          student_id,
          invoice_no,
          title,
          amount,
          paid_amount,
          due_date,
          status,
          created_at,
          updated_at
       ) VALUES ($1, $2, $3, $4, $5, 0.00, $6::date, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        tenantId,
        payload.studentId,
        invoiceNo,
        payload.title.trim(),
        payload.amount,
        payload.dueDate,
      ]
    );

    try {
      revalidatePath("/admin");
    } catch {
      // outside request context
    }

    return { success: true, invoiceId: res.rows[0].id, invoiceNo };
  } catch (error) {
    console.error("Failed to create invoice in PostgreSQL:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create invoice" };
  }
}

