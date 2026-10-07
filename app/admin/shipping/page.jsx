'use client';

import { useState, useEffect } from 'react';

export default function ShippingAdmin() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCountry, setNewCountry] = useState('');
  const [newRate, setNewRate] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/shipping');
      const data = await res.json();
      setRates(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCountry || !newRate) return;
    
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: newCountry, ratePerKg: parseFloat(newRate) })
      });
      if (res.ok) {
        setNewCountry('');
        setNewRate('');
        fetchRates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading shipping rates...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Shipping Rates Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Country Rate</h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Country Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded px-3 py-2" 
              value={newCountry} 
              onChange={e => setNewCountry(e.target.value)} 
              placeholder="e.g. Canada" 
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate per KG (Rs.)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded px-3 py-2" 
              value={newRate} 
              onChange={e => setNewRate(e.target.value)} 
              placeholder="e.g. 1500" 
              required
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors">
            Add Rate
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 font-semibold text-gray-600">Country / Region</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Rate per KG</th>
            </tr>
          </thead>
          <tbody>
            {rates.map(rate => (
              <tr key={rate.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">{rate.country}</td>
                <td className="px-6 py-4 font-medium text-green-700">Rs. {rate.ratePerKg}</td>
              </tr>
            ))}
            {rates.length === 0 && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-500">No shipping rates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
