-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'ATTEMPTED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND');

-- CreateEnum
CREATE TYPE "ReceiptType" AS ENUM ('PAYMENT_RECEIPT', 'REFUND_RECEIPT', 'CANCELLATION_RECEIPT');

-- CreateTable
CREATE TABLE "school_payments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT,
    "razorpay_signature" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "failure_reason" TEXT,
    "receipt" VARCHAR(40),
    "notes" JSONB,
    "payment_method" VARCHAR(50),
    "payment_method_details" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_logs" (
    "id" TEXT NOT NULL,
    "school_payment_id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "receipt_type" "ReceiptType" NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_url" TEXT,
    "file_size" INTEGER,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_sent_at" TIMESTAMP(3),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "last_downloaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhooks" (
    "id" TEXT NOT NULL,
    "razorpay_event_id" TEXT NOT NULL,
    "event" VARCHAR(100) NOT NULL,
    "account_id" TEXT NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_payments_razorpay_order_id_key" ON "school_payments"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_logs_receipt_number_key" ON "receipt_logs"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhooks_razorpay_event_id_key" ON "payment_webhooks"("razorpay_event_id");

-- AddForeignKey
ALTER TABLE "receipt_logs" ADD CONSTRAINT "receipt_logs_school_payment_id_fkey" FOREIGN KEY ("school_payment_id") REFERENCES "school_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
