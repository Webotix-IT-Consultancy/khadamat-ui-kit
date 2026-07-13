/**
 * Receipt Generator Utility
 * Generates and downloads receipt as PDF
 */

interface ReceiptData {
  transactionId: string;
  date: string;
  amount: number;
  processingFee: number;
  paymentMethod: string;
  userName?: string;
  userEmail?: string;
  previousBalance?: number;
}

/**
 * Generate a receipt and trigger download
 */
export const generateAndDownloadReceipt = (data: ReceiptData) => {
  const {
    transactionId,
    date,
    amount,
    processingFee,
    paymentMethod,
    userName = 'Valued Customer',
    userEmail = '',
    previousBalance = 0,
  } = data;

  const totalAmount = amount;
  const newBalance = previousBalance + amount;
  const receiptContent = generateReceiptHTML(
    transactionId,
    date,
    amount,
    processingFee,
    paymentMethod,
    userName,
    userEmail,
    previousBalance,
    newBalance
  );

  downloadAsHTML(receiptContent, transactionId);
};

/**
 * Generate HTML content for the receipt
 */
const generateReceiptHTML = (
  transactionId: string,
  date: string,
  amount: number,
  processingFee: number,
  paymentMethod: string,
  userName: string,
  userEmail: string,
  previousBalance: number,
  newBalance: number
): string => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wallet Recharge Receipt - ${transactionId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        
        .receipt-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .receipt-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
        }
        
        .receipt-logo {
          font-size: 28px;
          font-weight: 600;
          color: #016937;
          margin-bottom: 10px;
        }
        
        .receipt-title {
          font-size: 24px;
          font-weight: 600;
          color: #000;
          margin-bottom: 5px;
        }
        
        .receipt-subtitle {
          font-size: 14px;
          color: #666;
        }
        
        .success-badge {
          display: inline-block;
          background-color: #d4edda;
          color: #155724;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 10px;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f9f9f9;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
        
        .detail-value {
          font-size: 13px;
          color: #000;
          font-weight: 600;
          text-align: right;
        }
        
        .customer-info {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
        }
        
        .customer-info .detail-row {
          border-bottom: none;
          padding: 6px 0;
        }
        
        .transaction-summary {
          background-color: #fbefdc;
          padding: 15px;
          border-radius: 12px;
          margin-top: 15px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        
        .summary-label {
          font-size: 13px;
          color: #666;
        }
        
        .summary-value {
          font-size: 16px;
          font-weight: 600;
          color: #000;
        }
        
        .total-row {
          border-top: 2px solid #ddd;
          padding-top: 10px;
          margin-top: 10px;
        }
        
        .total-label {
          font-size: 16px;
          font-weight: 600;
          color: #000;
        }
        
        .total-value {
          font-size: 20px;
          font-weight: 700;
          color: #016937;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          font-size: 12px;
          color: #999;
        }
        
        .footer-link {
          color: #016937;
          text-decoration: none;
          font-weight: 600;
        }
        
        .footer-link:hover {
          text-decoration: underline;
        }
        
        @media print {
          body {
            background-color: #fff;
            padding: 0;
          }
          
          .receipt-container {
            box-shadow: none;
            max-width: 100%;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <!-- Header -->
        <div class="receipt-header">
          <div class="receipt-logo">Khadamat</div>
          <div class="receipt-title">Wallet Recharge Receipt</div>
          <div class="receipt-subtitle">Successful Transaction</div>
          <div class="success-badge">✓ COMPLETED</div>
        </div>
        
        <!-- Customer Info -->
        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="customer-info">
            <div class="detail-row">
              <span class="detail-label">Name</span>
              <span class="detail-value">${userName}</span>
            </div>
            ${userEmail ? `<div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">${userEmail}</span>
            </div>` : ''}
          </div>
        </div>
        
        <!-- Transaction Details -->
        <div class="section">
          <div class="section-title">Transaction Details</div>
          <div class="detail-row">
            <span class="detail-label">Transaction ID</span>
            <span class="detail-value">${transactionId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method</span>
            <span class="detail-value">${paymentMethod}</span>
          </div>
        </div>
        
        <!-- Amount Summary -->
        <div class="section">
          <div class="section-title">Amount Summary</div>
          <div class="transaction-summary">
            <div class="summary-row">
              <span class="summary-label">Recharge Amount</span>
              <span class="summary-value">AED ${amount.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Processing Fee</span>
              <span class="summary-value">AED ${processingFee.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
              <span class="total-label">Total Amount</span>
              <span class="total-value">AED ${(amount + processingFee).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <!-- Wallet Balance -->
        <div class="section">
          <div class="section-title">Wallet Balance Update</div>
          <div class="detail-row">
            <span class="detail-label">Previous Balance</span>
            <span class="detail-value">AED ${previousBalance.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Added</span>
            <span class="detail-value">AED ${amount.toFixed(2)}</span>
          </div>
          <div class="detail-row" style="background-color: #f0f8f5; padding: 10px 8px; border-radius: 6px; border: 1px solid #d4edda;">
            <span class="detail-label" style="font-weight: 600; color: #016937;">New Balance</span>
            <span class="detail-value" style="color: #016937; font-size: 16px;">AED ${newBalance.toFixed(2)}</span>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p style="margin-bottom: 10px;">Thank you for using Khadamat Wallet</p>
          <p>For support, please contact: <a href="mailto:support@khadamat.ae" class="footer-link">support@khadamat.ae</a></p>
          <p style="margin-top: 10px; font-size: 11px; color: #ccc;">This is an electronically generated receipt and is valid without signature</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Download HTML as a file
 */
const downloadAsHTML = (htmlContent: string, fileName: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Receipt_${fileName}_${new Date().getTime()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Alternative: Generate PDF (requires jsPDF library)
 * Uncomment and use if jsPDF is added to dependencies
 */
export const generateAndDownloadReceiptPDF = async (data: ReceiptData) => {
  try {
    // Dynamic import to avoid adding jsPDF to bundle if not used
    const { jsPDF } = await import('jspdf');
    const { html2canvas } = await import('html2canvas');

    const element = document.createElement('div');
    element.innerHTML = generateReceiptHTML(
      data.transactionId,
      data.date,
      data.amount,
      data.processingFee,
      data.paymentMethod,
      data.userName || 'Valued Customer',
      data.userEmail || '',
      data.previousBalance || 0,
      (data.previousBalance || 0) + data.amount
    );

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Receipt_${data.transactionId}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to HTML download
    generateAndDownloadReceipt(data);
  }
};
