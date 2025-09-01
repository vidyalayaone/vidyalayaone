import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import config from '@/config/config';
import { SchoolPayment } from '../generated/client';

interface GenerateReceiptParams {
  payment: SchoolPayment;
  receiptNumber: string;
}

interface GenerateRefundReceiptParams {
  payment: SchoolPayment;
  refund: any;
  receiptNumber: string;
}

class ReceiptService {
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Generate payment receipt PDF
   */
  async generatePaymentReceipt(params: GenerateReceiptParams): Promise<{
    filePath: string;
    fileUrl?: string;
    fileSize: number;
  }> {
    try {
      const { payment, receiptNumber } = params;
      
      // Create receipts directory if it doesn't exist
      await this.ensureDirectoryExists(config.pdf.storagePath);
      
      const fileName = `${receiptNumber}.pdf`;
      const filePath = path.join(config.pdf.storagePath, fileName);

      // Generate PDF content
      const htmlContent = this.generatePaymentReceiptHTML(payment, receiptNumber);
      
      // Generate PDF
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      
      await browser.close();
      
      // Save PDF to file
      await fs.writeFile(filePath, pdfBuffer);
      
      // Get file size
      const stats = await fs.stat(filePath);
      
      return {
        filePath,
        fileSize: stats.size,
      };
    } catch (error) {
      console.error('Error generating payment receipt:', error);
      throw new Error(`Failed to generate payment receipt: ${error}`);
    }
  }

  /**
   * Generate refund receipt PDF
   */
  async generateRefundReceipt(params: GenerateRefundReceiptParams): Promise<{
    filePath: string;
    fileUrl?: string;
    fileSize: number;
  }> {
    try {
      const { payment, refund, receiptNumber } = params;
      
      // Create receipts directory if it doesn't exist
      await this.ensureDirectoryExists(config.pdf.storagePath);
      
      const fileName = `${receiptNumber}.pdf`;
      const filePath = path.join(config.pdf.storagePath, fileName);

      // Generate PDF content
      const htmlContent = this.generateRefundReceiptHTML(payment, refund, receiptNumber);
      
      // Generate PDF
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      
      await browser.close();
      
      // Save PDF to file
      await fs.writeFile(filePath, pdfBuffer);
      
      // Get file size
      const stats = await fs.stat(filePath);
      
      return {
        filePath,
        fileSize: stats.size,
      };
    } catch (error) {
      console.error('Error generating refund receipt:', error);
      throw new Error(`Failed to generate refund receipt: ${error}`);
    }
  }

  /**
   * Generate HTML content for payment receipt
   */
  private generatePaymentReceiptHTML(payment: SchoolPayment, receiptNumber: string): string {
    const amount = (payment.amount / 100).toFixed(2);
    const paidDate = payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN') : 'N/A';
    const createdDate = new Date(payment.createdAt).toLocaleDateString('en-IN');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt - ${receiptNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #4CAF50;
            margin-bottom: 5px;
          }
          .company-details {
            font-size: 12px;
            color: #666;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            color: #2c3e50;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .receipt-number {
            font-weight: bold;
            color: #4CAF50;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .details-table th,
          .details-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .details-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
          }
          .amount-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .amount-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #4CAF50;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-paid {
            background-color: #d4edda;
            color: #155724;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${config.pdf.company.name}</div>
          <div class="company-details">
            ${config.pdf.company.address}<br>
            Email: ${config.pdf.company.email} | Phone: ${config.pdf.company.phone}
          </div>
        </div>

        <div class="receipt-title">PAYMENT RECEIPT</div>

        <div class="receipt-info">
          <div>
            <strong>Receipt Number:</strong><br>
            <span class="receipt-number">${receiptNumber}</span>
          </div>
          <div>
            <strong>Date:</strong><br>
            ${paidDate}
          </div>
        </div>

        <table class="details-table">
          <tr>
            <th>Description</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>School ID</td>
            <td>${payment.schoolId}</td>
          </tr>
          <tr>
            <td>Payment ID</td>
            <td>${payment.razorpayPaymentId || 'N/A'}</td>
          </tr>
          <tr>
            <td>Order ID</td>
            <td>${payment.razorpayOrderId}</td>
          </tr>
          <tr>
            <td>Payment Method</td>
            <td>${payment.paymentMethod || 'N/A'}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td><span class="status-badge status-paid">${payment.status}</span></td>
          </tr>
          <tr>
            <td>Transaction Date</td>
            <td>${createdDate}</td>
          </tr>
        </table>

        <div class="amount-section">
          <div class="amount-row">
            <span>Purpose:</span>
            <span>School Registration</span>
          </div>
          <div class="amount-row">
            <span>Currency:</span>
            <span>${payment.currency}</span>
          </div>
          <div class="amount-row total-amount">
            <span>Total Amount Paid:</span>
            <span>₹${amount}</span>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p>Thank you for choosing ${config.pdf.company.name}!</p>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for refund receipt
   */
  private generateRefundReceiptHTML(payment: SchoolPayment, refund: any, receiptNumber: string): string {
    const originalAmount = (payment.amount / 100).toFixed(2);
    const refundAmount = (refund.amount / 100).toFixed(2);
    const refundDate = new Date(refund.created_at * 1000).toLocaleDateString('en-IN');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Refund Receipt - ${receiptNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #f39c12;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #f39c12;
            margin-bottom: 5px;
          }
          .company-details {
            font-size: 12px;
            color: #666;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            color: #e74c3c;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .receipt-number {
            font-weight: bold;
            color: #f39c12;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .details-table th,
          .details-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .details-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
          }
          .amount-section {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px solid #ffeaa7;
          }
          .amount-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .refund-amount {
            font-size: 20px;
            font-weight: bold;
            color: #e74c3c;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-refunded {
            background-color: #f8d7da;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${config.pdf.company.name}</div>
          <div class="company-details">
            ${config.pdf.company.address}<br>
            Email: ${config.pdf.company.email} | Phone: ${config.pdf.company.phone}
          </div>
        </div>

        <div class="receipt-title">REFUND RECEIPT</div>

        <div class="receipt-info">
          <div>
            <strong>Receipt Number:</strong><br>
            <span class="receipt-number">${receiptNumber}</span>
          </div>
          <div>
            <strong>Refund Date:</strong><br>
            ${refundDate}
          </div>
        </div>

        <table class="details-table">
          <tr>
            <th>Description</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>School ID</td>
            <td>${payment.schoolId}</td>
          </tr>
          <tr>
            <td>Original Payment ID</td>
            <td>${payment.razorpayPaymentId || 'N/A'}</td>
          </tr>
          <tr>
            <td>Refund ID</td>
            <td>${refund.id}</td>
          </tr>
          <tr>
            <td>Original Order ID</td>
            <td>${payment.razorpayOrderId}</td>
          </tr>
          <tr>
            <td>Refund Status</td>
            <td><span class="status-badge status-refunded">${refund.status}</span></td>
          </tr>
        </table>

        <div class="amount-section">
          <div class="amount-row">
            <span>Original Amount:</span>
            <span>₹${originalAmount}</span>
          </div>
          <div class="amount-row">
            <span>Currency:</span>
            <span>${payment.currency}</span>
          </div>
          <div class="amount-row refund-amount">
            <span>Refund Amount:</span>
            <span>₹${refundAmount}</span>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated refund receipt.</p>
          <p>The refund amount will be credited to your original payment method within 5-7 business days.</p>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </body>
      </html>
    `;
  }
}

export default ReceiptService;
