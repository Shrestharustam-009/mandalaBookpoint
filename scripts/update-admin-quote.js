const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Inject state variables at the beginning of the component
content = content.replace(
  "const [selectedOrder, setSelectedOrder] = useState(null);",
  "const [selectedOrder, setSelectedOrder] = useState(null);\n  const [customShipping, setCustomShipping] = useState('');\n  const [sendingQuote, setSendingQuote] = useState(false);"
);

// 2. Add the handleSendQuote function
const handleSendQuoteCode = `
  const handleSendQuote = async () => {
    if (!customShipping || isNaN(customShipping) || customShipping < 0) {
      alert('Please enter a valid shipping cost');
      return;
    }
    setSendingQuote(true);
    try {
      const res = await fetch(\`/api/orders/\${selectedOrder.id}/send-quote\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingCost: parseFloat(customShipping) })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Shipping cost updated and email sent successfully!');
        setSelectedOrder(data.order);
        setCustomShipping('');
        fetchOrders(); // Refresh table
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to send quote');
    } finally {
      setSendingQuote(false);
    }
  };
`;

content = content.replace(
  "const handlePrint = (order) => {",
  handleSendQuoteCode + "\n\n  const handlePrint = (order) => {"
);

// 3. Inject the UI in the Modal, right under the Items Purchased table closing div
const uiCode = `
              {selectedOrder.paymentMethod === 'Pending Quote' && selectedOrder.status === 'pending' && (
                <div style={{ marginBottom: '25px', backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a' }}>Action Required: Set Shipping Quote</h4>
                  <p style={{ fontSize: '13px', color: '#1e40af', marginBottom: '10px' }}>
                    This order requires a custom shipping quote. Enter the delivery cost below to automatically update the invoice and email the customer a payment link.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #93c5fd', borderRadius: '6px', padding: '0 10px' }}>
                      <span style={{ color: '#6b7280', fontWeight: 'bold', marginRight: '5px' }}>NPR</span>
                      <input 
                        type="number" 
                        value={customShipping}
                        onChange={(e) => setCustomShipping(e.target.value)}
                        placeholder="Enter shipping cost"
                        style={{ border: 'none', outline: 'none', padding: '8px 0', width: '150px' }}
                      />
                    </div>
                    <button 
                      onClick={handleSendQuote}
                      disabled={sendingQuote}
                      style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0 15px', fontWeight: 'bold', cursor: sendingQuote ? 'not-allowed' : 'pointer', opacity: sendingQuote ? 0.7 : 1 }}
                    >
                      {sendingQuote ? 'Sending Email...' : 'Update & Email Customer'}
                    </button>
                  </div>
                </div>
              )}
`;

content = content.replace(
  /Grand Total: NPR \{parseFloat\(selectedOrder\.totalAmount\)\.toFixed\(2\)\}\n\s*<\/div>\n\s*<\/div>/,
  "Grand Total: NPR {parseFloat(selectedOrder.totalAmount).toFixed(2)}\n                </div>\n              </div>\n" + uiCode
);

// We should also display the shipping_cost in the order summary if it's set
content = content.replace(
  /Grand Total: NPR \{parseFloat\(selectedOrder\.totalAmount\)\.toFixed\(2\)\}/,
  `{parseFloat(selectedOrder.shipping_cost || 0) > 0 && (
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'normal', marginBottom: '4px' }}>
                      Includes Shipping: NPR {parseFloat(selectedOrder.shipping_cost).toFixed(2)}
                    </div>
                  )}
                  Grand Total: NPR {parseFloat(selectedOrder.totalAmount).toFixed(2)}`
);


fs.writeFileSync(file, content, 'utf8');
console.log('Admin modal quote UI injected');
