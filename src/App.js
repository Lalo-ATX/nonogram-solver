import React, { useState, useEffect, useRef } from 'react';
import Grid from './Grid';
import NonogramSolver from './NonogramSolver';

function App() {
  const defaultDimension = 15;
  const defaultHint = 2;

  const initialDimension = NonogramSolver.hintRows[defaultHint].length || defaultDimension;

  const initialRowHints = NonogramSolver.hintRows[defaultHint]
    ? NonogramSolver.hintRows[defaultHint].map(row => row.join(' '))
    : Array.from({ length: initialDimension }, () => "");

  const initialColHints = NonogramSolver.hintCols[defaultHint]
    ? NonogramSolver.hintCols[defaultHint].map(row => row.join(' '))
    : Array.from({ length: initialDimension }, () => "");

  const [nonogramInitialized, setNonogramInitialized] = useState(false);
  const [dimension, setDimension] = useState(initialDimension);
  const [data, setData] = useState(Array.from({ length: dimension }, () => Array(dimension).fill(NonogramSolver.squareUnknown)));
  const [rowHints, setRowHints] = useState(initialRowHints);
  const [colHints, setColHints] = useState(initialColHints);

  const solutionStepIndex = useRef(0);
  const solutionsStepCount = useRef(0);

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

  const startOver = () => {
    ensureInitialized();
    solutionStepIndex.current = 0;
    setData(NonogramSolver.solutionStepByIndex(solutionStepIndex.current));
  };

  const changeStep = (step) => {
    ensureInitialized();
    solutionStepIndex.current =
      Math.max( Math.min( solutionStepIndex.current + step, solutionsStepCount.current - 1 ), 0 );
    setData(NonogramSolver.solutionStepByIndex(solutionStepIndex.current));
  };

  const finalSolution = () => {
    ensureInitialized();
    solutionStepIndex.current = solutionsStepCount.current - 1;
    setData(NonogramSolver.solutionStepByIndex(solutionStepIndex.current));
  }

  const ensureInitialized = () => {
    if ( nonogramInitialized ) {
      return;
    }
    // else ...
    const parsedRowHints = rowHints.map(hint => hint.split(' ').map(Number));
    const parsedColHints = colHints.map(hint => hint.split(' ').map(Number));
    NonogramSolver.initialize(parsedRowHints, parsedColHints); // Pass the dimension and parsed hints
    solutionsStepCount.current = NonogramSolver.solutionsStepCount();
    setNonogramInitialized(true);
  }

  return (
    <div>
      <label>Size: </label>
      <input type="number" value={dimension} onChange={handleDimensionChange} style={{width:35, textAlign:'right'}}/>
      <button onClick={() => changeStep(-1)}>Step Backward</button>
      <button onClick={() => changeStep(+1)}>Step Forward</button>
      <button onClick={finalSolution}>Finished Grid</button>
      <button onClick={startOver}>Reset</button>
      <div>Step {solutionStepIndex.current} of {nonogramInitialized ? solutionsStepCount.current-1 : "?"}</div><br />
      <Grid data={data} rowHints={rowHints} colHints={colHints} onRowHintChange={handleRowHintChange} onColHintChange={handleColHintChange} />
    </div>
  );
}

export default App;