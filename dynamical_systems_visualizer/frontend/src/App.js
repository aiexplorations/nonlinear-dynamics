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

  const renderPlot = () => {
    if (!data) return null;

    switch (system) {
      case 'lorenz':
      case 'rossler':
        return (
          <Plot
            data={[
              {
                x: data.x,
                y: data.y,
                z: data.z,
                type: 'scatter3d',
                mode: 'lines',
              },
            ]}
            layout={{ title: `${system.charAt(0).toUpperCase() + system.slice(1)} System` }}
          />
        );
      case 'henon':
        return (
          <Plot
            data={[
              {
                x: data.x,
                y: data.y,
                type: 'scatter',
                mode: 'markers',
              },
            ]}
            layout={{ title: 'Hénon Map' }}
          />
        );
      case 'logistic':
        return (
          <Plot
            data={[
              {
                x: Array.from({ length: data.x.length }, (_, i) => i),
                y: data.x,
                type: 'scatter',
                mode: 'lines',
              },
            ]}
            layout={{ title: 'Logistic Map' }}
          />
        );
      default:
        return null;
    }
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
        {Object.keys(params[system]).map(param => (
          <div key={param}>
            <label>{param}:</label>
            <input
              type="number"
              name={param}
              value={params[system][param]}
              onChange={handleParamChange}
            />
          </div>
        ))}
      </div>
      {renderPlot()}
    </div>                
  );
};

export default App;
