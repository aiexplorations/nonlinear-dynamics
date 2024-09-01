import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const App = () => {
  const [data, setData] = useState(null);
  const [system, setSystem] = useState('lorenz');
  const [params, setParams] = useState({
    lorenz: { sigma: 10, rho: 28, beta: 8/3 },
    rossler: { a: 0.2, b: 0.2, c: 5.7 },
    henon: { a: 1.4, b: 0.3 },
    logistic: { r: 3.8, x0: 0.1 }
  });

  useEffect(() => {
    fetchData();
  }, [system, params]);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/generate_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: system,
          params: params[system]
        }),
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prevParams => ({
      ...prevParams,
      [system]: {
        ...prevParams[system],
        [name]: parseFloat(value)
      }
    }));
  };

  return (
    <div className="App">
      <h1>Dynamical Systems Visualizer</h1>
      <select value={system} onChange={(e) => setSystem(e.target.value)}>
        <option value="lorenz">Lorenz System</option>
        <option value="rossler">Rössler System</option>
        <option value="henon">Hénon Map</option>
        <option value="logistic">Logistic Map</option>
      </select>
      <div>
        {Object.entries(params[system]).map(([key, value]) => (
          <div key={key}>
            <label>{key}: </label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleParamChange}
              step="0.1"
            />
          </div>
        ))}
      </div>
      {data && (
        <Plot
          data={[
            {
              type: 'scatter3d',
              mode: 'lines',
              x: data.x,
              y: data.y,
              z: data.z,
              opacity: 0.8,
              line: {
                width: 2,
                color: data.x.map((_, i) => i),
                colorscale: 'Viridis'
              }
            }
          ]}
          layout={{
            width: 800,
            height: 600,
            title: `${system.charAt(0).toUpperCase() + system.slice(1)} System`,
            scene: {
              xaxis: { title: 'X' },
              yaxis: { title: 'Y' },
              zaxis: { title: 'Z' }
            }
          }}
        />
      )}
    </div>
  );
};

export default App;