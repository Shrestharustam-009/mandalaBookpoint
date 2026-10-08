const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

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

// Insert right before the closing flex div for buttons
content = content.replace(
  /<div style=\{\{ display: 'flex', justifyContent: 'flex-end', gap: '10px'/,
  uiCode + "\n\n              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px'"
);

fs.writeFileSync(file, content, 'utf8');
console.log('UI Box added successfully');
