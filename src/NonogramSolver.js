const squareFilled  = "️■" // "O" // "█" "▮" "■";
const squareEmpty   = "⨉" // "x" // "⨉";
const squareUnknown = " " // "_" // "▢";
const maxLoops = 100;

const NonogramSolver = new function() {
  this.solutionStatus = "unsolved";

  // default hints, useful for testing
  this.hintRows = [
    [ [1,2,1], [2,1,1,3], [3,2,2], [3,1], [3,1,1], [3,5], [1,6], [3], [3,1], [1] ],
    [ [7], [3,2], [2,2], [1,1,3,2], [2,1,2,1,2], [1,1,1,1,1,1], [1,2,2,1], [1,2,3,2,1], [1,1,2], [4,1,1], [2,8,2], [1,1,2,2], [3,1], [3,3], [6] ],
    [ [3,3], [1,3,3,1], [3,10,2], [3,2,2,2], [5,4], [3,2], [1,1], [1,1], [2,1], [2,1,1,1], [3,3,3,1], [1,1,1,1,1,1,1], [1,1,3,3,1], [1,2,2,1], [1,2,2], [1,2,3,2], [1,2,3,3], [1,2,1,4], [1,1,2,4], [3,1,10] ],
    [ [1], [1,2], [2,4], [7], [1,3], [2,1], [2,1], [1,1,1], [1,1,1], [2,2,1] ]
  ];

  this.hintCols = [
    [ [5,2], [6,1], [5,1], [2], [1,1,1], [2,3], [5], [1,3], [2,2], [7] ],
    [ [7], [3,4], [2,1,1,1,1], [1,1,1,2], [2,1,1,1], [1,3,1,2,2], [1,1,2,1,1], [1,1,1,1,1], [1,2,2,2,1], [1,3,2,2], [2,1,1,2], [2,2,1,1,1], [2,1,2], [2,1,2], [7] ],
    [ [2,1,1,2], [1,1,1,1], [4,7,1], [1,4,4,2,1], [1,5,2,1], [2,2,2], [4,2], [3,4,1], [1,2,2,1], [1,3,1], [1,2,1], [1,3,1], [1,2,1], [1,3,1], [3,2,2,2], [5,4,3], [2,2,4], [1,5,5], [4,4,4], [4] ],
    [ [1,2,3], [2,2,1], [1,2,2], [3,2], [2,1,1], [1,2], [2,1], [2], [2], [3] ]
  ];

  this.initialize = (hintRowsInput, hintColsInput) => {
    console.log("NonogramSolver.initialize() called");

    const allOptions = {
      rows: [],
      cols: []
    };

    const solutionGrid = Array.from({ length: hintRowsInput.length }, () => Array(hintColsInput.length).fill(squareUnknown));
    this.solutionSequence = [copyGrid(solutionGrid)]; // every step of the solution; starting with blank

    // first generate all the possible options
    for ( var colNum in hintColsInput ) {
      const options = genOptions( hintColsInput[colNum], hintRowsInput.length, [] );
      allOptions.cols.push( options );
    }

    for ( var rowNum in hintRowsInput ) {
      const options = genOptions( hintRowsInput[rowNum], hintColsInput.length, [] );
      allOptions.rows.push( options );
    }

    // now solve it
    this.solutionStatus = solveGrid(allOptions, solutionGrid, this.solutionSequence)
  }

  this.solutionsStepCount = () => {
    return this.solutionSequence.length;
  }

  this.solutionStepByIndex = (stepIndex) => {
    return copyGrid(this.solutionSequence[stepIndex]); // copy of this entry
  }

}();

function solveGrid(options, solutionGrid, solutionSequence) {
  console.log("NonogramSolver.solve() called");
  var loop = 0;
  do {
    loop++;
    var actionCount = 0;

    var solveResponse = solveSeries( options.rows, solutionGrid, "row");
    if ( solveResponse.errorCells > 0 ) {
      return "unsolveable";
    }
    if ( solveResponse.solvedCells > 0 ) {
      solutionSequence.push(copyGrid(solutionGrid));
      actionCount += solveResponse.solvedCells;
      const filterResponse = filterSeries(options.cols, solutionGrid, "col");
      if ( filterResponse.errors > 0 ) {
        return "unsolveable";
      }
      actionCount += filterResponse.filteredOptions;
    }

    solveResponse = solveSeries(options.cols, solutionGrid, "col");
    if ( solveResponse.errorCells > 0 ) {
      return "unsolveable";
    }
    if ( solveResponse.solvedCells > 0 ) {
      solutionSequence.push(copyGrid(solutionGrid));
      actionCount += solveResponse.solvedCells;
      const filterResponse = filterSeries(options.rows, solutionGrid, "row");
      if ( filterResponse.errors > 0 ) {
        return "unsolveable";
      }
      actionCount += filterResponse.filteredOptions;
    }

    if ( loop >= maxLoops ) {
      console.log("Error: maximum loops exceeded",maxLoops);
      break;
    }
  } while (actionCount > 0);
  
  const isSolved = checkIfSolved( solutionGrid );
  
  if ( isSolved ) {
    console.log("nonogram solved after",loop,"loops");
    return "solved";
  } // else this is unsolved. Now we start probing.
//  console.log("nonogram NOT solved after",loop,"loops");

  const probeOption = genProbeOption( options );
  
//  console.log("generated probe option",probeOption);

//  console.log("all options in this probe",probeOption.direction,probeOption.index,":",options[probeOption.direction][probeOption.index]);
  for ( const sequenceOption of options[probeOption.direction][probeOption.index] ) {
    if ( sequenceOption === undefined ) { // for ... of is supposed to skip undefined entries
      continue; // this shouldn't be happening, but it is, so we handle it
    }
    const subOptions = copyOptions( options );
    subOptions[probeOption.direction][probeOption.index] = [ sequenceOption ];
    const subSolutionSequence = [];
    const subSolutionGrid = copyGrid( solutionGrid );
//    console.log("calling sub solveGrid replacing",probeOption.direction,probeOption.index,"with",sequenceOption);
    const response = solveGrid( subOptions, subSolutionGrid, subSolutionSequence );
    if ( response === "solved" ) {
      // copy subSolutionGrid into solutionGrid -- OR NOT? THIS IS SOLVED, WHY DO I CARE?
      for ( var i in solutionGrid ) {
        for ( var j in solutionGrid[i] ) {
          solutionGrid[i][j] = subSolutionGrid[i][j];
        }
      }
      // append subSolutionSequence to solutionSequence
      solutionSequence.push(...subSolutionSequence);
      return "solved";
    }
    // presumably response === unsolveable, try the next option for this sequence
  }
  return "unsolveable"
}

function copyOptions( options ) {
  return {
    rows: options.rows.map(row => row.map(subRow => [...subRow])),
    cols: options.cols.map(col => col.map(subCol => [...subCol]))
  }
}

function genProbeOption( options ) {
  const probeOptions = [];
  for ( var direction in options ) {
    for ( var i in options[direction] ) {
      const entries = countEntries( options[direction][i] );
      if ( entries > 1 ) {
        probeOptions.push( {
          direction: direction,
          index: i,
          optionsCount: entries
        } );
      }
    }
  }
  return probeOptions.sort( (a,b) => { return a.optionsCount - b.optionsCount || a.index - b.index; } )[0]; // all we care about is the #1 entry
}

function checkIfSolved( solutionGrid ) {
  var isSolved = true; // assume it's solved unless it's not
  rowLoop: for ( const row of solutionGrid ) {
    for ( const cell of row ) {
      if ( cell === squareUnknown ) {
        isSolved = false;
        break rowLoop;
      }
    }
  }
  return isSolved;
}

function copyGrid (grid) {
  return grid.map(row => [...row]);
}

function solveSeries( optionsSeries, solutionGrid, seriesType ) {
  var errorCount = 0;
  var solvedCount = 0;
  for ( var i in optionsSeries ) {
    const options = optionsSeries[i]; // this is a reference
    var optionsCount = 0; // can't use options.length because options is a sparse array
    var aggregate = Array(optionsSeries.length).fill(0);
    for ( var j in options ) {
      // since we're looping through options anyway, just count here, instead of adding a reduce method or whatever
      optionsCount++;
      for ( var k in options[j] ) {
        aggregate[k] += options[j][k];
      }
    }

    for ( var j in aggregate ) {
      if ( aggregate[j] === optionsCount ) {
        if ( seriesType === "col" ) {
          if ( solutionGrid[j][i] === squareUnknown ) {
            solvedCount++;
            solutionGrid[j][i] = squareFilled;
          } else if ( solutionGrid[j][i] === squareEmpty ) {
            errorCount ++;
//            console.log("Error: tried to toggle empty square at",j,i) // this should trigger an error that the grid is unsolveable
          }
        } else if (seriesType === "row" ) {
          if ( solutionGrid[i][j] === squareUnknown ) {
            solvedCount++;
            solutionGrid[i][j] = squareFilled;
          } else if ( solutionGrid[i][j] === squareEmpty ) {
            errorCount ++;
//            console.log("Error: tried to toggle empty square at",i,j); // unsolveable grid
          }
        }
      } else if ( aggregate[j] === 0 ) {
        if ( seriesType === "col" ) {
          if ( solutionGrid[j][i] === squareUnknown ) {
            solvedCount++;
            solutionGrid[j][i] = squareEmpty;
          } else if ( solutionGrid[j][i] === squareFilled ) {
            errorCount ++;
//            console.log("Error: tried to toggle filled square at",j,i); // unsolveable grid
          }
        } else if (seriesType === "row" ) {
          if ( solutionGrid[i][j] === squareUnknown ) {
            solvedCount++;
            solutionGrid[i][j] = squareEmpty;
          } else if ( solutionGrid[i][j] === squareFilled ) {
            errorCount ++;
//            console.log("tried to toggle filled square at",i,j); // unsolveable grid
          }
        }
      } // else, do nothing
    }
  }
  return {solvedCells:solvedCount, errorCells:errorCount};
}

function filterSeries( optionsSeries, solutionGrid, seriesType ) {
  var filteredCount = 0;
  var errorCount = 0;
  for ( var i in optionsSeries ) {
    const options = optionsSeries[i];
    for ( var j in options ) {
      for ( var k in options[j] ) {
        const testField = seriesType === "row" ? solutionGrid[i][k] : solutionGrid[k][i];
        if ( testField === squareUnknown ) {
          // compatible with anything
          continue;
        }
        // else
        if ( (testField === squareFilled && options[j][k] === 0) ||
             (testField === squareEmpty  && options[j][k] === 1)) {
          // failed test, this option must be eliminated
          if ( countEntries(options[j]) === 1 ) {
            console.log("Error: attempt to eliminate the last remaining option for",seriesType,i);
            errorCount++;
          } else {
            delete options[j];
            filteredCount++;
          }
          break;
        }
      }
    }
  }
  return {filteredOptions:filteredCount, errors:errorCount};
}

function countEntries(array) {
  return array.reduce((acc, value) => {
    return value !== undefined ? acc + 1 : acc;
  }, 0);
}

function genOptions( hintInputList, dimension, options ) {
  // copy the contents of the hints array so that we don't change our calling function's hints array
  const hintList = [...hintInputList];
  var returnOptions = [];
  const hintInput = hintList.shift();
  
  const remainingSum = hintList.reduce((a,b) => a+b, 0) // sum
  const mySeriesLen = dimension - remainingSum - hintList.length;
  
  const numOfOptions = mySeriesLen - hintInput;
  for ( var i = 0; i <= numOfOptions; i++ ) {
    var thisOption = [ ...options, ...Array(i).fill(0), ...Array(hintInput).fill(1) ];
    if ( hintList.length === 0 ) {
      // no more options, so zero pad it
      thisOption = [ ...thisOption, ...Array(dimension - i - hintInput).fill(0) ];
      returnOptions.push(thisOption);
    } else {
      thisOption.push(0);
      const recurseDimension = dimension - hintInput - 1 - i;
      returnOptions = [ ...returnOptions, ...genOptions( hintList, recurseDimension, thisOption ) ];
    }
  }
  return returnOptions;
}

export default NonogramSolver;