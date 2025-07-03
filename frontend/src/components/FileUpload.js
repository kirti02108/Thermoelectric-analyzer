import React, { useState } from 'react';
import Papa from 'papaparse';

function FileUpload({ onData }) {
  const [fileName, setFileName] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        onData(results.data);
      }
    });
  };

  return (
    <div className="file-upload">
      <input type="file" accept=".csv" onChange={handleFile} />
      {fileName && <p>Loaded: {fileName}</p>}
    </div>
  );
}

export default FileUpload;
