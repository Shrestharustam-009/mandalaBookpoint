const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

const oldUseEffect = `  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.orders.getAll();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);`;

const newCode = `  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);`;

content = content.replace(oldUseEffect, newCode);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed fetchOrders scope');
