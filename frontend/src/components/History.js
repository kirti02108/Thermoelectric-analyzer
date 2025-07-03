import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function History() {
  const [calculations, setCalculations] = useState([]);
  const [tlmCalculations, setTlmCalculations] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(
          `http://localhost:5000/api/data/history/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCalculations(res.data.calculations || []);
        setTlmCalculations(res.data.tlmCalculations || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="history">
      <h3>Your Calculation History</h3>
      <h4>TEC Calculations</h4>
      {calculations.length === 0 ? (
        <p>No TEC calculations saved yet.</p>
      ) : (
        calculations.map((calc, index) => (
          <div key={index} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h5>Calculation on {new Date(calc.date).toLocaleString()}</h5>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h6>Inputs</h6>
                <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                  {JSON.stringify(calc.inputs, null, 2)}
                </pre>
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h6>Outputs</h6>
                <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                  {JSON.stringify(calc.outputs, null, 2)}
                </pre>
              </div>
            </div>
            {calc.chartData && (
              <div style={{ marginTop: '1rem' }}>
                <h6>Chart</h6>
                <Plot
                  data={calc.chartData}
                  layout={{ width: 600, height: 400, title: 'Temperature vs Time', xaxis: { title: 'Time (s)' }, yaxis: { title: 'Temperature (°C)' } }}
                />
              </div>
            )}
          </div>
        ))
      )}
      <h4>TLM Calculations</h4>
      {tlmCalculations.length === 0 ? (
        <p>No TLM calculations saved yet.</p>
      ) : (
        tlmCalculations.map((calc, index) => (
          <div key={index} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h5>TLM Analysis on {new Date(calc.date).toLocaleString()}</h5>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h6>Inputs (Sample)</h6>
                <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                  {JSON.stringify(calc.inputs.slice(0, 3), null, 2)}...
                </pre>
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h6>Outputs</h6>
                <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                  {JSON.stringify(calc.outputs, null, 2)}
                </pre>
              </div>
            </div>
            {calc.chartData && (
              <div style={{ marginTop: '1rem' }}>
                <h6>Chart</h6>
                <Plot
                  data={calc.chartData}
                  layout={{ width: 600, height: 400, title: 'Average Resistance vs Current', xaxis: { title: 'Current (A)' }, yaxis: { title: 'Resistance (Ω)' } }}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default History;
