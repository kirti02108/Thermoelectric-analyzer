import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Plot from 'react-plotly.js';
import axios from 'axios';

function TLMProcessor({ plotData, setPlotData }) {
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [outputCSV, setOutputCSV] = useState([]);
  const [fileName, setFileName] = useState('');

  const processData = () => {
    if (!rawData.length) return;
    const groups = {};
    rawData.forEach(row => {
      const key = `${row['Probe Position'] || row['Position'] || row['pos']}`;
      if (!groups[key]) groups[key] = { position: key, currents: {} };
      const current = Math.abs(parseFloat(row['Current (A)'] || row['Current'] || row['I']));
      if (!groups[key].currents[current]) groups[key].currents[current] = [];
      groups[key].currents[current].push(parseFloat(row['Cal. Resis. (Ω)'] || row['Resistance'] || row['R']));
    });

    const output = [];
    Object.keys(groups).forEach(pos => {
      const group = groups[pos];
      const row = { 'Probe Position': group.position };
      Object.keys(group.currents).forEach(current => {
        const values = group.currents[current];
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        row[`Avg. I=${current}A`] = avg.toFixed(6);
      });
      output.push(row);
    });

    setProcessedData(output);

    const csvData = output.map(row => ({
      'Probe Position': row['Probe Position'],
      ...Object.fromEntries(
        Object.entries(row).filter(([k]) => k.startsWith('Avg. I='))
      )
    }));
    setOutputCSV(csvData);

    const plotData = output.map(row => ({
      x: Object.keys(row).filter(k => k.startsWith('Avg. I=')).map(k => parseFloat(k.split('=')[1].replace('A', ''))),
      y: Object.keys(row).filter(k => k.startsWith('Avg. I=')).map(k => parseFloat(row[k])),
      type: 'scatter',
      mode: 'lines+markers',
      name: `Position ${row['Probe Position']}`
    }));
    setPlotData(plotData);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          setRawData(results.data);
        }
      });
    }
    else if (file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setRawData(json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const saveToHistory = async () => {
    if (!processedData.length) return;
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/data/save-tlm',
        {
          userId,
          inputs: rawData,
          outputs: processedData,
          chartData: plotData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('TLM analysis saved to history!');
    } catch (error) {
      console.error('Error saving TLM analysis:', error);
    }
  };

  useEffect(() => {
    if (rawData.length) processData();
  }, [rawData]);

  return (
    <div className="tlm-processor">
      <input type="file" accept=".csv,.xlsx" onChange={handleFile} />
      {fileName && <p>Loaded: {fileName}</p>}
      {processedData.length > 0 && (
        <>
          <table style={{ margin: '1rem 0', border: '1px solid #ccc' }}>
            <thead>
              <tr>
                <th>Probe Position</th>
                {Object.keys(processedData[0]).filter(k => k.startsWith('Avg. I=')).map(k => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((row, i) => (
                <tr key={i}>
                  <td>{row['Probe Position']}</td>
                  {Object.keys(row).filter(k => k.startsWith('Avg. I=')).map(k => (
                    <td key={k}>{row[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {plotData.length > 0 && (
            <Plot
              data={plotData}
              layout={{
                width: 600,
                height: 400,
                title: 'Average Resistance vs Current',
                xaxis: { title: 'Current (A)' },
                yaxis: { title: 'Resistance (Ω)' }
              }}
            />
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              onClick={saveToHistory}
              style={{
                padding: '0.5rem 1rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save to History
            </button>
            <CSVLink
              data={outputCSV}
              filename="tlm_results.csv"
              style={{
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Download Excel (CSV)
            </CSVLink>
          </div>
        </>
      )}
    </div>
  );
}

export default TLMProcessor;
