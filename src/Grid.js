import './Grid.css';

function Grid({ data, rowHints, colHints, onRowHintChange, onColHintChange }) {
  const cellSize = 27;
  const rowHeight = cellSize; // Set as needed
  const rowHintWidth = 90; // Set as needed
  const colHintHeight = 90; // Set as needed
  const cellWidth = cellSize; // Set as needed

  return (
    <div className="grid-container" style={{ position: 'relative' }}>
      <div className="col-hints" style={{ position: 'absolute', left: rowHintWidth-cellSize-3, top: cellSize+3 }}>
        {colHints.map((hint, index) => (
          <input
            key={index}
            type="text"
            className="col-hint-input"
            style={{ position: 'absolute', left: index * cellWidth, top: 0 }}
            value={hint}
            onChange={(event) => onColHintChange(index, event)}
            placeholder="Enter col hints"
          />
        ))}
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