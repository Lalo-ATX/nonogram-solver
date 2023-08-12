import React, { useState, useEffect } from 'react';
import Grid from './Grid';
import NonogramSolver from './NonogramSolver';

//var NonogramInitialized = false;

function App() {
  
  const defaultDimension = 15;
  const initialDimension = NonogramSolver.gridDimension || defaultDimension;

  const initialRowHints = NonogramSolver.hintRows
    ? NonogramSolver.hintRows.map(row => row.join(' '))
    : Array.from({ length: initialDimension }, () => "");

  const initialColHints = NonogramSolver.hintCols
    ? NonogramSolver.hintCols.map(row => row.join(' '))
    : Array.from({ length: initialDimension }, () => "");

  const [nonogramInitialized, setNonogramInitialized] = useState(false);
  const [dimension, setDimension] = useState(initialDimension);
  const [data, setData] = useState(Array.from({ length: dimension }, () => Array(dimension).fill(NonogramSolver.squareUnknown)));
  const [rowHints, setRowHints] = useState(initialRowHints);
  const [colHints, setColHints] = useState(initialColHints);

  useEffect(() => {
    // reset our initialized status if an input changes
    setNonogramInitialized(false);
  }, [dimension, rowHints, colHints]);

  const handleDimensionChange = (event) => {
    const newDimension = Number(event.target.value);
    setDimension(newDimension);
    setData(Array.from({ length: newDimension }, () => Array(newDimension).fill(NonogramSolver.squareUnknown)));
    setRowHints(Array.from({ length: newDimension }, () => ""));
    setColHints(Array.from({ length: newDimension }, () => ""));
  };

  const handleRowHintChange = (index, event) => {
    const newRowHints = [...rowHints];
    newRowHints[index] = event.target.value;
    setRowHints(newRowHints);
  };

  const handleColHintChange = (index, event) => {
    const newColHints = [...colHints];
    newColHints[index] = event.target.value;
    setColHints(newColHints);
  };

  const solveNonogram = () => {
    const parsedRowHints = rowHints.map(hint => hint.split(' ').map(Number));
    const parsedColHints = colHints.map(hint => hint.split(' ').map(Number));
    NonogramSolver.initialize(parsedRowHints, parsedColHints); // Pass the dimension and parsed hints
    setData(NonogramSolver.solve());
  };
  
  const solveNonogramOneStep = () => {
    if ( !nonogramInitialized ) {
      const parsedRowHints = rowHints.map(hint => hint.split(' ').map(Number));
      const parsedColHints = colHints.map(hint => hint.split(' ').map(Number));
      NonogramSolver.initialize(parsedRowHints, parsedColHints); // Pass the dimension and parsed hints
      setNonogramInitialized(true);
    }
    setData(NonogramSolver.solveOneStep());
  };
  
  const startOver = () => {
    setData(Array.from({ length: dimension }, () => Array(dimension).fill(NonogramSolver.squareUnknown)));
    setNonogramInitialized(false);
  }

  return (
    <div>
      <label>Dimension: </label>
      <input type="number" value={dimension} onChange={handleDimensionChange} style={{width:35, textAlign:'right'}}/> 
      <button onClick={solveNonogramOneStep}>Solve Next</button>
      <button onClick={solveNonogram}>Solve All</button> 
      <button onClick={startOver}>Reset</button>
      <Grid data={data} rowHints={rowHints} colHints={colHints} onRowHintChange={handleRowHintChange} onColHintChange={handleColHintChange} />
    </div>
  );
}

export default App;