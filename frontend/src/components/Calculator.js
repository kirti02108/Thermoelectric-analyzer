import React, { useState } from 'react';
import axios from 'axios';

function Calculator({ plotData }) {
  const [inputs, setInputs] = useState({
    voltage: '',
    current: '',
    th: '',
    tc: '',
    seebeck: '',
    thermalConductivity: '',
    electricalConductivity: ''
  });
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const calculate = () => {
    const voltage = parseFloat(inputs.voltage);
    const current = parseFloat(inputs.current);
    const th = parseFloat(inputs.th);
    const tc = parseFloat(inputs.tc);
    const seebeck = parseFloat(inputs.seebeck);
    const thermalConductivity = parseFloat(inputs.thermalConductivity);
    const electricalConductivity = parseFloat(inputs.electricalConductivity);

    if ([voltage, current, th, tc, seebeck, thermalConductivity, electricalConductivity].some(isNaN)) return;

    const deltaT = th - tc;
    const power = voltage * current;
    const Qc = seebeck * current * tc - 0.5 * current ** 2 * electricalConductivity - thermalConductivity * deltaT;
    const ZT = thermalConductivity !== 0 
      ? (seebeck ** 2) * electricalConductivity * ((th + tc) / 2) / thermalConductivity 
      : 0;
    const COP = power !== 0 ? Qc / power : 0;

    setResults({ deltaT, Qc, COP, power, ZT });
  };

  const saveCalculation = async () => {
    if (!results) return;
    try {
    
    
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/data/save-calculation',
        {
          userId,
          inputs: {
            voltage: parseFloat(inputs.voltage),
            current: parseFloat(inputs.current),
            th: parseFloat(inputs.th),
            tc: parseFloat(inputs.tc),
            seebeck: parseFloat(inputs.seebeck),
            thermalConductivity: parseFloat(inputs.thermalConductivity),
            electricalConductivity: parseFloat(inputs.electricalConductivity),},
          outputs: {
            deltaT: results.deltaT,
            Qc: results.Qc,
            COP: results.COP,
            power: results.power,
            ZT: results.ZT,},
          chartData: plotData},{
          headers: {
            Authorization: `Bearer ${token}`
        }
      }
    );
      alert('Calculation and chart saved to history!');
  }   catch (error) {
      console.error('Error saving calculation:', error);
  }
};




  return (
    <div className="calculator">
      <h3>TEC Performance Calculator</h3>
      <input name="voltage" type="number" placeholder="Voltage (V)" value={inputs.voltage} onChange={handleChange} />
      <input name="current" type="number" placeholder="Current (A)" value={inputs.current} onChange={handleChange} />
      <input name="th" type="number" placeholder="Hot Side Temp (°C)" value={inputs.th} onChange={handleChange} />
      <input name="tc" type="number" placeholder="Cold Side Temp (°C)" value={inputs.tc} onChange={handleChange} />
      <input name="seebeck" type="number" placeholder="Seebeck Coeff (V/K)" value={inputs.seebeck} onChange={handleChange} />
      <input name="thermalConductivity" type="number" placeholder="Thermal Conductivity (W/mK)" value={inputs.thermalConductivity} onChange={handleChange} />
      <input name="electricalConductivity" type="number" placeholder="Electrical Conductivity (S/m)" value={inputs.electricalConductivity} onChange={handleChange} />
      <button onClick={calculate}>Calculate</button>
      {results && (
        <table style={{ marginTop: '1rem', border: '1px solid #ccc' }}>
          <tbody>
            <tr><td>ΔT</td><td>{results.deltaT.toFixed(2)} K</td></tr>
            <tr><td>Cooling Power (Qc)</td><td>{results.Qc.toFixed(2)} W</td></tr>
            <tr><td>COP</td><td>{results.COP.toFixed(2)}</td></tr>
            <tr><td>Power Consumed</td><td>{results.power.toFixed(2)} W</td></tr>
            <tr><td>ZT (Figure of Merit)</td><td>{results.ZT.toFixed(4)}</td></tr>
          </tbody>
        </table>
      )}
      {results && <button onClick={saveCalculation}>Save to History</button>}
    </div>
  );
}

export default Calculator;
