const squareFilled  = "️■" // "O" // "█" "▮" "■";
const squareEmpty   = " " // "x" // "⨉";
const squareUnknown = "?" // "_" // "▢";
const maxLoops = 50;

const orientation = ["col","row"];

const NonogramSolver = new function() {
  this.optionsColumns = [];
  this.optionsRows = [];

  // default hints, useful for testing
  this.hintRows = [
    [7],
    [2,3],
    [2,2],
    [1,1,3,2],
    [2,1,2,1,2],
    [1,1,1,1,1,1],
    [1,2,2,1],
    [1,2,3,2,1],
    [1,1,2],
    [4,1,1],
    [2,8,2],
    [1,1,2,2],
    [3,1],
    [3,3],
    [6] ];

  this.hintCols = [
    [7],
    [3,4],
    [2,1,1,1,1],
    [1,1,1,2],
    [2,1,1,1],
    [1,3,1,2,2],
    [1,1,2,1,1],
    [1,1,1,1,1],
    [1,2,2,2,1],
    [1,3,2,2],
    [2,1,1,2],
    [2,2,1,1,1],
    [2,1,2],
    [2,1,2],
    [7] ];

  this.initialize = (hintRowsInput, hintColsInput) => {
    console.log("NonogramSolver.initialize() called");

    const gridDimension = hintRowsInput.length;

    this.optionsColumns = [];
    this.optionsRows = [];
    this.solutionGrid = Array.from({ length: gridDimension }, () => Array(gridDimension).fill(squareUnknown));
    this.oneStepNext = 0;
    this.oneStepCount = 0;

    // first generate all the possible options
    for ( var colNum in hintColsInput ) {
      const options = genOptions( hintColsInput[colNum], gridDimension, [] );
      this.optionsColumns.push( options );
    }

    for ( var rowNum in hintRowsInput ) {
      const options = genOptions( hintRowsInput[rowNum], gridDimension, [] );
      this.optionsRows.push( options );
    }
  }

  this.solveOneStep = () => {
    this.oneStepCount++;
    console.log("NonogramSolver.solveOneStep() called",this.oneStepCount);
    var actionCount = 0;

    var solveOptions;
    var filterOptions;

    if ( orientation[this.oneStepNext] == "col" ) {
      solveOptions  = this.optionsColumns;
      filterOptions = this.optionsRows;
    } else { // assume it's row
      solveOptions  = this.optionsRows;
      filterOptions = this.optionsColumns;
    }
    
    const solvedCount = solveSeries(solveOptions, this.solutionGrid, orientation[this.oneStepNext]);
    console.log("solved",solvedCount,"cells via",orientation[this.oneStepNext]);

    const filteredCount = filterSeries(filterOptions, this.solutionGrid, orientation[this.oneStepNext^1]);
    console.log("filtered",filteredCount,orientation[this.oneStepNext^1]);

    // toggle oneStepNext
    this.oneStepNext ^= 1;

    return this.solutionGridAnswer(); // return a copy, in case the calling code modifies it
  }


  this.solve = () => {
    console.log("NonogramSolver.solve() called");
    var actionCount = 0;
    var loop = 0;
    do {
      loop++;
      actionCount = 0;

      actionCount += solveSeries( this.optionsColumns, this.solutionGrid, "col");
      actionCount += filterSeries(this.optionsRows,    this.solutionGrid, "row");

      actionCount += solveSeries( this.optionsRows,    this.solutionGrid, "row");
      actionCount += filterSeries(this.optionsColumns, this.solutionGrid, "col");

      if ( loop >= maxLoops ) {
        console.log("maximum loops exceeded",maxLoops);
        break;
      }
    } while (actionCount > 0);
    console.log("solve finished after",loop,"loops, last loop performing",actionCount,"actions.")
    return this.solutionGridAnswer(); // return a copy in case the calling code modifies it
  }
  
  this.solutionGridAnswer = () => {
    return this.solutionGrid.map(row => [...row]);
  }
}();

function solveSeries( optionsSeries, solutionGrid, seriesType ) {
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
      if ( aggregate[j] == optionsCount ) {
        if ( seriesType == "col" ) {
          if ( solutionGrid[j][i] == squareUnknown ) {
            solvedCount++;
            solutionGrid[j][i] = squareFilled;
/*          } else if ( solutionGrid[j][i] == squareEmpty ) {
            console.log("tried to toggle empty square at",j,i) */
          }
        } else if (seriesType == "row" ) {
          if ( solutionGrid[i][j] == squareUnknown ) {
            solvedCount++;
            solutionGrid[i][j] = squareFilled;
/*          } else if ( solutionGrid[i][j] == squareEmpty ) {
            console.log("tried to toggle empty square at",i,j); */
          }
        }
      } else if ( aggregate[j] == 0 ) {
        if ( seriesType == "col" ) {
          if ( solutionGrid[j][i] == squareUnknown ) {
            solvedCount++;
            solutionGrid[j][i] = squareEmpty;
/*          } else if ( solutionGrid[j][i] == squareFilled ) {
            console.log("tried to toggle filled square at",j,i); */
          }
        } else if (seriesType == "row" ) {
          if ( solutionGrid[i][j] == squareUnknown ) {
            solvedCount++;
            solutionGrid[i][j] = squareEmpty;
/*          } else if ( solutionGrid[i][j] == squareFilled ) {
            console.log("tried to toggle filled square at",i,j); */
          }
        }
      } // else, do nothing
    }
  }
  return solvedCount;
}

function filterSeries( optionsSeries, solutionGrid, seriesType ) {
  var filteredCount = 0;
  for ( var i in optionsSeries ) {
    const options = optionsSeries[i];
    for ( var j in options ) {
      for ( var k in options[j] ) {
        const testField = seriesType == "row" ? solutionGrid[i][k] : solutionGrid[k][i];
        if ( testField == squareUnknown ) {
          // compatible with anything
          continue;
        }
        // else
        if ( (testField == squareFilled && options[j][k] == 0) ||
             (testField == squareEmpty  && options[j][k] == 1)) {
          // failed test, this option must be eliminated
          delete options[j];
          filteredCount++;
          break;
        }
      }
    }
  }
  return filteredCount
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
    if ( hintList.length == 0 ) {
      // no more options, so zero pad it
      thisOption = [ ...thisOption, ...Array(dimension - i - hintInput).fill(0) ];
      returnOptions.push(thisOption);
    } else {
      thisOption.push(0);
      const recurseDimension = dimension - hintInput - 1 - i;
      returnOptions = [ ...returnOptions, ...genOptions( hintList, dimension - hintInput - 1 - i, thisOption ) ];
    }
  }
  return returnOptions;
}

export default NonogramSolver;

/* alternate default, 
  this.hintCols = [
    [1,2,1],
    [2,1,1,3],
    [3,2,2],
    [3,1],
    [3,1,1],
    [3,5],
    [1,6],
    [3],
    [3,1],
    [1] ];
  
  this.hintRows = [
    [5,2],
    [6,1],
    [5,1],
    [2],
    [1,1,1],
    [2,3],
    [5],
    [1,3],
    [2,2],
    [7] ];

  this.hintRows = [
    [7],
    [2,3],
    [2,2],
    [1,1,3,2],
    [2,1,2,1,2],
    [1,1,1,1,1,1],
    [1,2,2,1],
    [1,2,3,2,1],
    [1,1,2],
    [4,1,1],
    [2,8,2],
    [1,1,2,2],
    [3,1],
    [3,3],
    [6] ];

  this.hintCols = [
    [7],
    [3,4],
    [2,1,1,1,1],
    [1,1,1,2],
    [2,1,1,1],
    [1,3,1,2,2],
    [1,1,2,1,1],
    [1,1,1,1,1],
    [1,2,2,2,1],
    [1,3,2,2],
    [2,1,1,2],
    [2,2,1,1,1],
    [2,1,2],
    [2,1,2],
    [7] ];

*/