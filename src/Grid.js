import React, { useState, useRef, useEffect } from 'react';
import './Grid.css';

function Grid({ data, rowHints, colHints, onRowHintChange, onColHintChange }) {
  const cellSize = 27;
  const rowHeight = cellSize; // Set as needed
  const rowHintWidth = 90; // Set as needed
  const colHintHeight = 90; // Set as needed
  const cellWidth = cellSize; // Set as needed

  const [editingColHint, setEditingColHint] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingColHint !== null) {
      inputRef.current.focus();
    }
  }, [editingColHint]);

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
          ref={inputRef}
          style={style}
          className="col-hint-input"
          value={hint}
          onChange={(e) => onColHintChange(index, e)}
          onBlur={(e) => setEditingColHint(null)}
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
  return (
    <div className="grid-container" style={{ position: 'relative' }}>
      <div className="col-hints" style={{ position: 'absolute', left: rowHintWidth, top: 2 }}>
        {colHints.map(renderColHint)}
      </div>
      <div className="grid">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="row" style={{ position: 'absolute', left: 0, top: rowIndex * rowHeight + colHintHeight }}>
            <input
              type="text"
              className="row-hint-input"
              value={rowHints[rowIndex]}
              onChange={(event) => onRowHintChange(rowIndex, event)}
              placeholder="Enter row hints"
            />
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