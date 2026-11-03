# Institutional Fees, Dynamic UPI QR, Payment Gateways & Invoicing

This document provides technical and functional specifications for the financial ledger, Indian fee rules, payment gateway integrations, and cashier POS systems.

---

## 1. Fee Architecture & Ledger Rules

The financial system follows a double-entry ledger design tailored for Indian educational institutions:
- **Debit Entry**: Generated when an invoice installment is issued (Student owes Institute).
- **Credit Entry**: Generated when a receipt is issued (Cash, Card, UPI, Cheque received).
- **Current Balance**: $\sum(\text{Invoices}) - \sum(\text{Receipts}) - \sum(\text{Concessions})$.

---

## 2. Dynamic NPCI UPI QR Code Generation

To eliminate expensive gateway processing charges (1.5% - 2%) for budget schools, every invoice and counter screen renders an instant **dynamic NPCI UPI QR code**:

```
upi://pay?pa={institute_vpa}&pn={institute_name}&am={amount}&tr={invoice_no}&cu=INR&tn=School+Fees
```

### Flow:
1. Student / Parent arrives at cash counter or views digital invoice.
2. System computes due balance (e.g. ₹18,500).
3. Server generates dynamic QR code encoding the exact rupee value and invoice reference.
4. Parent scans using Google Pay / PhonePe / Paytm / BHIM.
5. Transaction settles directly into the school's bank account with 0% MDR.
6. Cashier inputs UTR / Bank reference or webhook auto-marks invoice as settled.

---

## 3. Payment Gateway Webhook Reconciliation Engine

For online portal checkouts via Razorpay, Cashfree, or PayU:

```typescript
// app/api/webhooks/razorpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  // 1. Verify Cryptographic Signature
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expectedSig !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const invoiceId = payment.notes.invoice_id;
    const tenantId = payment.notes.tenant_id;

    // 2. Atomic Transaction: Settle Invoice & Issue Receipt
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice || invoice.status === 'PAID') return; // Idempotency check

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paid_amount: invoice.amount },
      });

      await tx.receipt.create({
        data: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          student_id: invoice.student_id,
          receipt_no: `RCP-${Date.now()}`,
          amount: invoice.amount,
          payment_method: 'ONLINE_GATEWAY',
          transaction_ref: payment.id,
        },
      });
    });
  }

  return NextResponse.json({ received: true });
}
```

---

## 4. Cashier POS Counter & Thermal Receipt Output

- **Speed Benchmark**: Sub-30 second transaction completion.
- **Hardware Compatibility**: Standard 80mm ESC/POS USB and Bluetooth thermal receipt printers.
- **Receipt Template**:
  ```text
  ================================================
              APEX INTERNATIONAL ACADEMY
         Affiliation No: CBSE/AFF/2026/01
  ================================================
  Receipt No: AIA/RCP/2026/0491    Date: 27-Oct-2026
  Student:    Aarav Sharma         Adm No: 10491
  Class:      Class 10-A           Roll No: 14
  ------------------------------------------------
  Fee Description                         Amount
  ------------------------------------------------
  Term 2 Tuition Fee                    12,000.00
  Science Lab Charges                    2,500.00
  Late Payment Fine                        500.00
  ------------------------------------------------
  Total Received (UPI):                ₹15,000.00
  Balance Due:                              ₹0.00
  ------------------------------------------------
  Ref: UPI/20261027/987123  Cashier: Rajesh M.
  Scan to Verify: [QR Code]
  ================================================
  ```
