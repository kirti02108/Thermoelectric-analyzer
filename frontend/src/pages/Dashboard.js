import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import Calculator from '../components/Calculator';
import Plot from 'react-plotly.js';
import History from '../components/History';
import TLMProcessor from '../components/TLMProcessor';

function Dashboard() {
  const [expPlotData, setExpPlotData] = useState([]);
  const [tlmPlotData, setTlmPlotData] = useState([]);

  const handleData = (data) => {
    setExpPlotData([
      {
        x: data.map(row => row.Time),
        y: data.map(row => row.Temperature),
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'blue' },
        name: 'Temperature vs Time'
      }
    ]);
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <h3>Upload Experimental Data</h3>
      <FileUpload onData={handleData} />
      {expPlotData.length > 0 && (
        <Plot
          data={expPlotData}
          layout={{
            width: 600,
            height: 400,
            title: 'Temperature vs Time',
            xaxis: { title: 'Time (s)' },
            yaxis: { title: 'Temperature (°C)' }
          }}
        />
      )}
      <Calculator plotData={expPlotData} />
      <h3>TLM Contact Resistance Analyzer</h3>
      <TLMProcessor plotData={tlmPlotData} setPlotData={setTlmPlotData} />
      <History />
    </div>
  );
}

export default Dashboard;
