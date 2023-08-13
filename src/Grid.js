import React, { useState, useRef, useEffect } from 'react';
import './Grid.css';

function Grid({ data, rowHints, colHints, onRowHintChange, onColHintChange }) {
  const cellSize = 27;
  const rowHeight = cellSize; // Set as needed
  const rowHintWidth = 90; // Set as needed
  const colHintHeight = 90; // Set as needed
  const cellWidth = cellSize; // Set as needed

  const [editingColHint, setEditingColHint] = useState(null);
  const [editingRowHint, setEditingRowHint] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  const inputColRef = useRef(null);
  const inputRowRef = useRef(null);

  useEffect(() => {
    if (editingColHint !== null) {
      inputColRef.current.focus();
    }
  }, [editingColHint]);
  
  useEffect(() => {
    if (editingRowHint !== null) {
      inputRowRef.current.focus();
    }
  }, [editingRowHint]);

  useEffect(() => {
    updateScaleFactor();
    window.addEventListener('resize', updateScaleFactor);
    return () => window.removeEventListener('resize', updateScaleFactor);
  }, []);

  const renderColHint = (hint, index) => {
    const style = {
      position: 'absolute',
      top: `${(colHintHeight-cellSize)/2}px`,
      left: `${index * cellWidth - (rowHintWidth-cellWidth)/2}px`, // Adjust as needed
      width: rowHintWidth,
      textAlign: 'center'
    };
    // If this hint is being edited, render an input field
    if (editingColHint === index) {
      return (
        <input
          ref={inputColRef}
          style={style}
          className="col-hint-input"
          value={hint}
          onChange={(e) => onColHintChange(index, e)}
          onBlur={() => setEditingColHint(null)}
          onKeyDown={(e) => handleColHintKeyDown(e, index)}
        />
      );
    }

    // Otherwise, render a div with the hint text
    return (
      <div
        style={{position: 'absolute', top: 0, left: `${index * cellWidth}px`}}
        className="col-hint-display"
        onClick={() => setEditingColHint(index)}
      >
        {hint}
      </div>
    );
  };

  const renderRowHint = (hint, index) => {
    if (editingRowHint === index) {
      return (
        <input
          ref={inputRowRef}
          className="row-hint-input"
          value={hint}
          onChange={(e) => onRowHintChange(index, e)}
          onBlur={() => setEditingRowHint(null)}
          onKeyDown={(e) => handleRowHintKeyDown(e, index)}
        />
      );
    }

    // Otherwise render a div with the hint text
    return (
      <div
        className="row-hint-display"
        onClick={() => setEditingRowHint(index)}
      >
        {hint}
      </div>
    );
  };

  const handleColHintKeyDown = (e, index) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextIndex = (index + ( e.shiftKey ? -1 + colHints.length : +1 )) % colHints.length;
      setEditingColHint(nextIndex);
    }
  };

  const handleRowHintKeyDown = (e, index) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextIndex = (index + ( e.shiftKey ? -1 + rowHints.length : +1 )) % rowHints.length;
      setEditingRowHint(nextIndex);
    }
  };

  const updateScaleFactor = () => {
//    console.log("updateScaleFactor called");
    const screenWidth = window.innerWidth;
    const gridWidth = colHints.length * 28 + 86 + 44;
    const scale = Math.min(1, screenWidth / gridWidth);
    setScaleFactor(scale);
  };

  return (
    <div
      className="grid-container"
      style={{ position: 'relative', transform: `scale(${scaleFactor})` }}
    >
      <div className="col-hints" style={{ position: 'absolute', left: rowHintWidth, top: 2 }}>
        {colHints.map(renderColHint)}
      </div>
      <div className="grid">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="row" style={{ position: 'absolute', left: 0, top: rowIndex * rowHeight + colHintHeight }}>
            {renderRowHint(rowHints[rowIndex],rowIndex)}
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="cell" style={{ position: 'absolute', left: cellIndex * cellWidth + rowHintWidth, top: 0 }}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Grid;