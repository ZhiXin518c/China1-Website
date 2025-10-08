import React from 'react';
import { Printer } from 'lucide-react';

const PrintReceipt = ({ order, orderItems }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${order.id.slice(0, 8)}</title>
          <style>
            @media print {
              @page { margin: 0.5cm; }
              body { margin: 0; }
            }
            body {
              font-family: 'Courier New', monospace;
              max-width: 80mm;
              margin: 0 auto;
              padding: 10px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .info {
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .items {
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .item {
              margin: 8px 0;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
            }
            .item-details {
              font-size: 10px;
              color: #666;
              margin-left: 10px;
            }
            .totals {
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .total-row.grand {
              font-size: 14px;
              font-weight: bold;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              font-size: 11px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">CHINA 1</div>
            <div>1831 Skibo Rd, Fayetteville</div>
            <div>910-849-3232</div>
          </div>

          <div class="info">
            <div class="info-row">
              <span>Order #:</span>
              <strong>${order.id.slice(0, 8).toUpperCase()}</strong>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span>Customer:</span>
              <span>${order.customer_name}</span>
            </div>
            <div class="info-row">
              <span>Phone:</span>
              <span>${order.customer_phone}</span>
            </div>
            <div class="info-row">
              <span>Type:</span>
              <strong>${order.order_type.toUpperCase()}</strong>
            </div>
            <div class="info-row">
              <span>Payment:</span>
              <span>${order.payment_method.toUpperCase()}</span>
            </div>
          </div>

          <div class="items">
            <strong>ITEMS:</strong>
            ${orderItems.map(item => `
              <div class="item">
                <div class="item-header">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>$${(parseFloat(item.final_price) * item.quantity).toFixed(2)}</span>
                </div>
                ${item.customizations && Object.keys(item.customizations).length > 0 ? `
                  <div class="item-details">
                    ${Object.entries(item.customizations).map(([key, value]) =>
                      `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
                    ).join(' | ')}
                  </div>
                ` : ''}
                ${item.special_instructions ? `
                  <div class="item-details">Note: ${item.special_instructions}</div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          ${order.special_instructions ? `
            <div style="border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
              <strong>SPECIAL INSTRUCTIONS:</strong>
              <div style="margin-top: 5px;">${order.special_instructions}</div>
            </div>
          ` : ''}

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>$${parseFloat(order.tax).toFixed(2)}</span>
            </div>
            ${parseFloat(order.delivery_fee) > 0 ? `
              <div class="total-row">
                <span>Delivery Fee:</span>
                <span>$${parseFloat(order.delivery_fee).toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row grand">
              <span>TOTAL:</span>
              <span>$${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <div>Thank you for your order!</div>
            <div style="margin-top: 5px;">www.china1fayetteville.com</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
    >
      <Printer className="h-4 w-4" />
      Print Receipt
    </button>
  );
};

export default PrintReceipt;
