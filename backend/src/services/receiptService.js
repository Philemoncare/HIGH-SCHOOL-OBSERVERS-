const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReceiptService {
  /**
   * Generate a PDF receipt for a payment
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.reference - Payment reference number
   * @param {string} paymentData.type - Payment type (donation, membership, shop, events)
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (default: GHS)
   * @param {string} paymentData.customerName - Customer name
   * @param {string} paymentData.customerEmail - Customer email
   * @param {string} paymentData.customerPhone - Customer phone (optional)
   * @param {Date} paymentData.paymentDate - Payment date
   * @param {Object} paymentData.details - Additional payment details (type-specific)
   * @returns {Promise<string>} - Path to the generated PDF file
   */
  async generateReceipt(paymentData) {
    return new Promise((resolve, reject) => {
      try {
        // Create receipts directory if it doesn't exist
        const receiptsDir = path.join(__dirname, '../../receipts');
        if (!fs.existsSync(receiptsDir)) {
          fs.mkdirSync(receiptsDir, { recursive: true });
        }

        // Generate unique filename
        const filename = `receipt_${paymentData.reference}_${Date.now()}.pdf`;
        const filepath = path.join(receiptsDir, filename);

        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Pipe PDF to file
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(24)
           .fillColor('#d32f2f')
           .text('HSO Platform', { align: 'center' });
        
        doc.fontSize(14)
           .fillColor('#666666')
           .text('High School Observer', { align: 'center' })
           .moveDown(2);

        // Receipt Title
        doc.fontSize(20)
           .fillColor('#000000')
           .text('PAYMENT RECEIPT', { align: 'center', underline: true })
           .moveDown(1);

        // Receipt Number
        doc.fontSize(12)
           .fillColor('#333333')
           .text(`Receipt No: ${paymentData.reference}`, { align: 'right' })
           .text(`Date: ${paymentData.paymentDate.toLocaleDateString('en-GB', { 
             day: '2-digit', 
             month: 'long', 
             year: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
           })}`, { align: 'right' })
           .moveDown(2);

        // Customer Information
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Customer Information', { underline: true })
           .moveDown(0.5);

        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Name: ${paymentData.customerName}`)
           .text(`Email: ${paymentData.customerEmail}`);
        
        if (paymentData.customerPhone) {
          doc.text(`Phone: ${paymentData.customerPhone}`);
        }
        doc.moveDown(1);

        // Payment Details
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Payment Details', { underline: true })
           .moveDown(0.5);

        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Payment Type: ${this.getPaymentTypeLabel(paymentData.type)}`)
           .text(`Amount: ${paymentData.currency || 'GHS'} ${paymentData.amount.toFixed(2)}`)
           .text(`Status: Paid`)
           .moveDown(1);

        // Type-specific details
        if (paymentData.details) {
          doc.fontSize(14)
             .fillColor('#000000')
             .text('Transaction Details', { underline: true })
             .moveDown(0.5);

          doc.fontSize(11)
             .fillColor('#333333');

          if (paymentData.type === 'donation' && paymentData.details.campaignTitle) {
            doc.text(`Campaign: ${paymentData.details.campaignTitle}`);
            if (paymentData.details.message) {
              doc.text(`Message: ${paymentData.details.message}`);
            }
          } else if (paymentData.type === 'membership' && paymentData.details.membershipType) {
            doc.text(`Membership Type: ${paymentData.details.membershipType}`);
            doc.text(`Membership Status: Active`);
            if (paymentData.details.expiryDate) {
              doc.text(`Valid Until: ${new Date(paymentData.details.expiryDate).toLocaleDateString('en-GB')}`);
            }
          } else if (paymentData.type === 'shop' && paymentData.details.productName) {
            doc.text(`Product: ${paymentData.details.productName}`);
            doc.text(`Quantity: ${paymentData.details.quantity || 1}`);
            if (paymentData.details.orderId) {
              doc.text(`Order ID: ${paymentData.details.orderId}`);
            }
          } else if (paymentData.type === 'events' && paymentData.details.eventTitle) {
            doc.text(`Event: ${paymentData.details.eventTitle}`);
            doc.text(`Registration Status: Confirmed`);
          }

          doc.moveDown(1);
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Thank you for your payment!', { align: 'center' })
           .moveDown(0.5)
           .text('This is an official receipt from HSO Platform.', { align: 'center' })
           .text('Please keep this receipt for your records.', { align: 'center' })
           .moveDown(1)
           .text('For inquiries, please contact us at support@hso-platform.com', { align: 'center' })
           .text('HSO Platform - High School Observer', { align: 'center' });

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get human-readable label for payment type
   */
  getPaymentTypeLabel(type) {
    const labels = {
      'donation': 'Donation',
      'membership': 'Membership Payment',
      'shop': 'Product Purchase',
      'events': 'Event Registration'
    };
    return labels[type] || 'Payment';
  }

  /**
   * Clean up old receipt files (older than 30 days)
   */
  async cleanupOldReceipts() {
    try {
      const receiptsDir = path.join(__dirname, '../../receipts');
      if (!fs.existsSync(receiptsDir)) {
        return;
      }

      const files = fs.readdirSync(receiptsDir);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filepath = path.join(receiptsDir, file);
        const stats = fs.statSync(filepath);
        
        if (stats.mtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(filepath);
          console.log(`Deleted old receipt: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning up receipts:', error);
    }
  }
}

module.exports = new ReceiptService();

