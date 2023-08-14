import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const cellSize = 28;
const cellBorder = 1;
const cellBorderColor = 'lightgrey';
const hintDisplayLength = 88;
const hintDisplayPadding = 6;
const hintDisplayBorder = 1;
const hintDisplayBorderColor = 'lightgrey';
const hintGridPadding = 2;

const ColHintDisplay = styled.div`
  width: ${cellSize - 2*hintDisplayBorder - 2*hintDisplayPadding}px;
  height: ${hintDisplayLength - 2*hintDisplayBorder - 2*hintDisplayPadding}px;
  border: ${hintDisplayBorder}px solid ${hintDisplayBorderColor};
  line-height: 14px; // line height is related to font size
  padding: ${hintDisplayPadding}px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-size: small;`;

const RowHintDisplay = styled.div`
  text-align: right;
  width: ${hintDisplayLength - 2*hintDisplayBorder - 1*hintDisplayPadding}px;
  height: ${cellSize - 2*hintDisplayBorder}px;
  line-height: ${cellSize - 2*hintDisplayBorder}px;
  padding-right: ${hintDisplayPadding}px;
  border: ${hintDisplayBorder}px solid ${hintDisplayBorderColor};
  font-size: small;`

const HintInput = styled.input`
  width: ${hintDisplayLength - 2*hintDisplayBorder - 1*hintDisplayPadding}px;
  height: ${cellSize - 2*hintDisplayPadding}px;
  line-height: ${cellSize - 2*hintDisplayBorder - 2*hintDisplayPadding}px;
  background-color: lightcyan;
  border-color: cyan;
  text-align: center;
  z-index: 100;`;

const Cell = styled.div`
  width: ${cellSize - 2*cellBorder}px;
  height: ${cellSize - 2*cellBorder}px;
  border: ${cellBorder}px solid ${cellBorderColor};
  text-align: center;
  line-height: ${cellSize - 2*cellBorder}px;`

function Grid({ data, rowHints, colHints, onRowHintChange, onColHintChange }) {

  const [editingColHint, setEditingColHint] = useState(null);
  const [editingRowHint, setEditingRowHint] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [gridPosX, setGridPosX ] = useState(0);
  const [gridPosY, setGridPosY ] = useState(0);

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
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  const renderColHint = (hint, index) => {
    const style = {
      position: 'absolute',
      top: `${(hintDisplayLength-cellSize)/2}px`,
      left: `${index * (cellSize-cellBorder) - (hintDisplayLength-(cellSize-cellBorder))/2}px` // Adjust as needed
    };
    // If this hint is being edited, render an input field
    if (editingColHint === index) {
      return (
        <HintInput
          key={index}
          ref={inputColRef}
          style={style}
          value={hint}
          onChange={(e) => onColHintChange(index, e)}
          onBlur={() => setEditingColHint(null)}
          onKeyDown={(e) => handleColHintKeyDown(e, index)}
        />
      );
    }

    // Otherwise, render a div with the hint text
    return (
      <ColHintDisplay
        key={index}
        style={{position: 'absolute', top: 0, left: `${index * (cellSize-cellBorder)}px`}}
        onClick={() => setEditingColHint(index)}
      >
        {hint}
      </ColHintDisplay>
    );
  };

  const renderRowHint = (hint, index) => {
    if (editingRowHint === index) {
      return (
        <HintInput
          ref={inputRowRef}
          value={hint}
          onChange={(e) => onRowHintChange(index, e)}
          onBlur={() => setEditingRowHint(null)}
          onKeyDown={(e) => handleRowHintKeyDown(e, index)}
        />
      );
    }

    // Otherwise render a div with the hint text
    return (
      <RowHintDisplay
        onClick={() => setEditingRowHint(index)}
      >
        {hint}
      </RowHintDisplay>
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

  const handleResize = () => {
    const minPadding = 30;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const gridWidth = hintDisplayLength + hintGridPadding + colHints.length*(cellSize - cellBorder);
    const widthScale = Math.min(1, screenWidth / (gridWidth + 2*minPadding));
    const heightScale = Math.min(1, screenHeight / (gridWidth + 2*minPadding));
    const scale = Math.min(widthScale, heightScale);
    setScaleFactor(scale);
    const newGridWidth = gridWidth * scale;
    setGridPosX( (screenWidth  - newGridWidth)/2 );
    setGridPosY( (screenHeight - newGridWidth)/2 );
//    console.log("scale",scale,"scale factor",scaleFactor,"grid X Y", gridPosX, gridPosY);
  };

  return (
    <div
      className="grid-container"
      style={{ position: 'absolute', left: gridPosX, top: gridPosY, transform: `scale(${scaleFactor})` }}
    >
      <div className="col-hints" style={{ position: 'absolute', left: hintDisplayLength+hintGridPadding }}>
        {colHints.map(renderColHint)}
      </div>
      <div className="grid">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="row" style={{ position: 'absolute', left: 0, top: rowIndex * (cellSize-cellBorder) + hintDisplayLength + hintGridPadding }}>
            {renderRowHint(rowHints[rowIndex],rowIndex)}
            {row.map((cell, cellIndex) => (
              <Cell key={cellIndex} style={{ position: 'absolute', left: cellIndex * (cellSize-cellBorder) + hintDisplayLength+hintGridPadding, top: 0 }}>
                {cell}
              </Cell>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Grid;