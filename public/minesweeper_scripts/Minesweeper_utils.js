function checkSucceeded(config, boardSetup){
  const puzzlePara = document.getElementById('puzzlePara')
  if(config.flagCount + config.blockCount == boardSetup.numMine + boardSetup.numBlocks){
     
    let allCorrect = true
    for(let i=0; i<config.boardSize.rows; i++){
      for(let j=0; j<config.boardSize.columns; j++){
        const theBlock = config.blocks[i][j]
        if((theBlock.state == 1 && theBlock.number == -1) || 
            (theBlock.state == 2 && theBlock.number >= 0)){}
        else{
          allCorrect = false
        }
      }
    }
    if(allCorrect) puzzlePara.textContent = 'Congrats! You solved the puzzle!';
    else puzzlePara.textContent = 'Ummm... Something is wrong, check again?'
  }
  else{
    puzzlePara.textContent = ''
  }
}


/**
   * sets numMine number of blocks to be a mine (number = -1)
   * and generate number attribute of all blocks
   * 
   * @param {integer} numMine number of mines to put into game
   */
function genField(numMine, config,boardSetup) {
  if(boardSetup){
      console.log(boardSetup)
      for(let i=0; i<config.boardSize.rows; i++){
          for(let j=0; j<config.boardSize.columns; j++){
              if(boardSetup.mines[i][j] == -1) config.blocks[i][j].number = -1;
              if(boardSetup.states[i][j]) config.blocks[i][j].state = boardSetup.states[i][j]
          }
      }

  }
  else{
      const f = new Array(config.boardSize.rows).fill(0).map(() => new Array(config.boardSize.columns).fill(0));
      for (let i = 0; i < numMine; i++) {
      const ran = floor(Math.random() * config.boardSize.rows * config.boardSize.columns);
      const row = floor(ran / config.boardSize.columns);
      const column = ran % config.boardSize.columns;
      if (f[row][column] === 0) {
          f[row][column] = -1;
      } else {
          i--;//do it again
      }
      }
      for (let i = 0; i < config.boardSize.rows; i++) {
          for (let j = 0; j < config.boardSize.columns; j++) {
              if (f[i][j] === -1) {
              config.blocks[i][j].number = -1;
              //config.blocks[i][j].state = 3;
              }
          }
      }
  }
  
  getNumbers( config);
}

/**
 * updates number attribute of all blocks in game
 */
function getNumbers(config) {
  for (let i = 0; i < config.boardSize.rows; i++) {
    for (let j = 0; j < config.boardSize.columns; j++) {
      if (config.blocks[i][j].number !== -1) {
        // not left most
        if (i !== 0) {
          if (j !== 0) {
            if (config.blocks[i - 1][j - 1].number === -1) {config.blocks[i][j].number++;}
          }
          if (j !== config.boardSize.columns - 1) {
            if (config.blocks[i - 1][j + 1].number === -1) {config.blocks[i][j].number++;}
          }
          if (config.blocks[i - 1][j].number === -1) {config.blocks[i][j].number++;}
        }
        // not right most
        if (i !== config.boardSize.rows - 1) {
          if (j !== 0) {
            if (config.blocks[i + 1][j - 1].number === -1) {config.blocks[i][j].number++;}
          }
          if (j !== config.boardSize.columns - 1) {
            if (config.blocks[i + 1][j + 1].number === -1) {config.blocks[i][j].number++;}
          }
          if (config.blocks[i + 1][j].number === -1) {config.blocks[i][j].number++;}
        }
        // neutral
        if (j !== 0) {
          if (config.blocks[i][j - 1].number === -1) {config.blocks[i][j].number++;}
        }
        if (j !== config.boardSize.columns - 1) {
          if (config.blocks[i][j + 1].number === -1) {config.blocks[i][j].number++;}
        }
      }
      // if(config.blocks[i][j].number>=0) config.blocks[i][j].state = 2;(toTest)
    }
  }
}

/**
 * when the selected block is zero, triggers surrounding blocks
 * 
 * @param {integer} i vertical index of the block selected
 * @param {integer} j horizontal index of the block selected
 */
function triggerZero(i, j,config) {
  if (config.blocks[i][j].getState() === ORIGSTATE || config.blocks[i][j].getState() === Block.LIGHTEDSTATE) {
    config.blocks[i][j].setState(Block.REVEALEDSTATE);
    config.blockCount++;
    // println(config.blockCount);
    if (config.blocks[i][j].getNumber() === 0) {
      if (i !== 0) {
        if (j !== 0) {
          triggerZero(i - 1, j - 1, config);
        }
        if (j !== config.boardSize.columns - 1) {
          triggerZero(i - 1, j + 1, config);
        }
        triggerZero(i - 1, j, config);
      }
      // not right most
      if (i !== config.boardSize.rows - 1) {
        if (j !== 0) {
          triggerZero(i + 1, j - 1, config);
        }
        if (j !== config.boardSize.columns - 1) {
          triggerZero(i + 1, j + 1, config);
        }
        triggerZero(i + 1, j, config);
      }
      // neutral
      if (j !== 0) {
        triggerZero(i, j - 1, config);
      }
      if (j !== config.boardSize.columns - 1) {
        triggerZero(i, j + 1, config);
      }
    }
    // println(1); (ToTest)
  }
}

/**
 * counts the number of flags surrounding the selected block
 * 
 * @param {integer} i vertical index of the block selected
 * @param {integer} j horizontal index of the block selected
 * @returns number of flags surrounding
 */
function countFlags(i, j,config) {
  let count = 0;
  if (i !== 0) {
    if (j !== 0) {
      if (config.blocks[i - 1][j - 1].getState() === Block.FLAGSTATE) {count++;}
    }
    if (j !== config.boardSize.columns - 1) {
      if (config.blocks[i - 1][j + 1].getState() === Block.FLAGSTATE) {count++;}
    }
    if (config.blocks[i - 1][j].getState() === Block.FLAGSTATE) {count++;}
  }
  // not right most
  if (i !== config.boardSize.rows - 1) {
    if (j !== 0) {
      if (config.blocks[i + 1][j - 1].getState() === Block.FLAGSTATE) {count++;}
    }
    if (j !== config.boardSize.columns - 1) {
      if (config.blocks[i + 1][j + 1].getState() === Block.FLAGSTATE) {count++;}
    }
    if (config.blocks[i + 1][j].getState() === Block.FLAGSTATE) {count++;}
  }
  // neutral
  if (j !== 0) {
    if (config.blocks[i][j - 1].getState() === Block.FLAGSTATE) {count++;}
  }
  if (j !== config.boardSize.columns - 1) {
    if (config.blocks[i][j + 1].getState() === Block.FLAGSTATE) {count++;}
  }
  return count;
}

/**
 * activates the surrounding blocks
 * 
 * @param {integer} i vertical index of the block selected
 * @param {integer} j horizontal index of the block selected
 */
function flipAround(i, j, config) {
  if (i !== 0) {
    if (j !== 0) {
      activateBlock(i - 1, j - 1, config);
    }
    if (j !== config.boardSize.columns - 1) {
      activateBlock(i - 1, j + 1, config);
    }
    activateBlock(i - 1, j, config);
  }
  // not right most
  if (i !== config.boardSize.rows - 1) {
    if (j !== 0) {
      activateBlock(i + 1, j - 1, config);
    }
    if (j !== config.boardSize.columns - 1) {
      activateBlock(i + 1, j + 1, config);
    }
    activateBlock(i + 1, j, config);
  }
  // neutral
  if (j !== 0) {
    activateBlock(i, j - 1, config);
  }
  if (j !== config.boardSize.columns - 1) {
    activateBlock(i, j + 1, config);
  }
}

/**
 * lights around the selected block
 * 
 * @param {integer} i vertical index of the block selected
 * @param {integer} j horizontal index of the block selected
 * @param {integer} state the state to set the block to(dim/light)
 */
function lightAround(i, j, state, config) {
  if (i !== 0) {
    if (j !== 0) {
      lightBlock(i - 1, j - 1, state, config);
    }
    if (j !== config.boardSize.columns - 1) {
      lightBlock(i - 1, j + 1, state, config);
    }
    lightBlock(i - 1, j, state, config);
  }
  // not right most
  if (i !== config.boardSize.rows - 1) {
    if (j !== 0) {
      lightBlock(i + 1, j - 1, state, config);
    }
    if (j !== config.boardSize.columns - 1) {
      lightBlock(i + 1, j + 1, state, config);
    }
    lightBlock(i + 1, j, state, config);
  }
  // neutral
  if (j !== 0) {
    lightBlock(i, j - 1, state, config);
  }
  if (j !== config.boardSize.columns - 1) {
    lightBlock(i, j + 1, state, config);
  }
}


/**
 * visualize the locations of all mines and blocks
 * when a bomb is triggered and the restart game state happens
 */
function drawAllMines(config) {
  for (let i = 0; i < config.boardSize.rows; i++) {
    for (let j = 0; j < config.boardSize.columns; j++) {
      const theBlock = config.blocks[i][j];
      if (theBlock.getNumber() === -1) {
        if (theBlock.getState() === Block.ORIGSTATE) {
          theBlock.setState(Block.REVEALEDSTATE);
        }
      } else if (theBlock.getState() === Block.FLAGSTATE) {theBlock.drawCross();}
    }
  }
}


/**
 * activates the selected block and triggers the consequences
 * 
 * @param {integer} i vertical index of the block selected
 * @param {integer} j horizontal index of the block selected
 */
function activateBlock(i, j, config) {
  const theBlock = config.blocks[i][j];
  if (theBlock.getState() === Block.ORIGSTATE || theBlock.getState() === 3) {//?
    if (theBlock.getNumber() === -1) {
      config.gameStage = 2;
      config.soundFiles.bang.play();
      config.endTime = hour() * 3600 + minute() * 60 + second();
    } else if (config.blockCount === config.boardSize.rows * config.boardSize.columns - config.numMine) {
    } else if (theBlock.getNumber() === 0) {
      triggerZero(i, j, config);
      config.soundFiles.wow.play();
    } else {
      config.blockCount++;
      config.soundFiles.ding.play();
    }
    // println(config.blockCount);
    theBlock.setState(Block.REVEALEDSTATE);
  }
}

/**
 * lights(LIGHTEDSTATE)/dims(ORIGSTATE) the selected block
 * 
 * @param {integer} i vertical index of the block selected
 * @param {integer} j horizontal index of the block selected
 * @param {integer} state the state to set the block
 */
function lightBlock(i, j, state, config) {
  const theBlock = config.blocks[i][j];
  if (
    theBlock.getState() !== state &&
    theBlock.getState() !== Block.REVEALEDSTATE &&
    theBlock.getState() !== Block.FLAGSTATE
  ) {
    theBlock.setState(state);
  }
}

/**
 * draws the restart window and button on canvas
 */
function drawRestart(config, sketch) {
  
  const w = sketch ? sketch.width : width;
  const h = sketch ? sketch.height : height;
  //the rectangle
  fill(130, 130, 210, 130);
  noStroke();
  rect(w / 3, h / 4, w / 3, h / 2, 55);

  //the words
  let bestTimeString;
  if (bestTime === undefined) {bestTimeString = "--";}
  else {bestTimeString = bestTime + "";}
  textFont("Arial", w / 36);
  fill(0);
  text("Time: " + "--", w * 0.35, h * 0.35);
  text("Best Time: " + bestTimeString, w * 0.35, h * 0.42);

  
  //restart Button
  fill(color(60));
  noStroke();
  rect(w * 0.45, h * 0.56, w / 10, h * 0.1);
  fill(160, 70, 70, 200);
  text("Restart", w * 0.46, h * 0.62);
}

/**
 * restarts the game: reset all counts and stage variables
 * and regenerate/redraw the blocks
 */
function restart(config,boardSetup,sketch) {
  const w = sketch ? sketch.w : width;
  const h = sketch ? sketch.height : height;
  console.log(w)
  
  config.gameStage = 1;
  config.flagCount = 0;
  config.blockCount = 0;
  config.clickCount = 0;
  if(boardSetup){
    config.numMine = boardSetup.numMine
  }else{
    config.numMine = round(config.boardSize.rows * config.boardSize.columns * config.densMine);
  }
  
  
  config.sideL = h / config.boardSize.rows;
  config.blocks = new Array(config.boardSize.rows);
  config.fireworks = [];
  background(0);
  
  reGenBlocks(config,boardSetup,sketch);

  //draw the initial
  for (let i = 0; i < config.boardSize.rows; i++) {
    for (let j = 0; j < config.boardSize.columns; j++) {
      config.blocks[i][j].drawIt();
    }
  }
}

/**
 * re-instantiate the blocks to their ORIGSTATE
 * and generate the mines and numbers on the squares
 */
function reGenBlocks(config,boardSetup,sketch) {
  const w = sketch ? sketch.width : width;
  const h = sketch ? sketch.height : height;
  
  //instantiate each Block
  for (let i = 0; i < config.boardSize.rows; i++) {
    config.blocks[i] = new Array(config.boardSize.columns);
    for (let j = 0; j < config.boardSize.columns; j++) {
      config.blocks[i][j] = new Block(j, i, h / config.boardSize.rows);
    }
  }
  //generate mines and numbers
  genField(config.numMine, config, boardSetup);
}


function drawWinBoard(config,sketch) {
  //the rectangle
  const w = sketch ? sketch.width : width;
  const h = sketch ? sketch.height : height;
  
  fill(color(130, 130, 210, 130));
  noStroke();
  rect(w / 3, h / 4, w / 3, h / 2, 55);

  //the words
  let bestTimeString;
  if(!bestTime) {bestTime = 0;}
  const thisTime = config.endTime - config.startTime;


  


  if (thisTime < bestTime || bestTime === 0) {
    bestTime = thisTime;
  }

  if (bestTime === 0) {bestTimeString = "--";}
  else {bestTimeString = bestTime + "";}
  textFont("Times New Roman",w / 48);
  text("Click Anywhere for more FUN", w * 0.38, h * 0.29);
  fill(44, 66, 132);
  textFont("Arial", int(w / 36.0));
  text("Time: " + thisTime, w * 0.35, h * 0.35);
  text("Best Time: " + bestTimeString, w * 0.35, h * 0.42);

  //restart Button
  fill(color(60, 200));
  noStroke();
  rect(w * 0.45, h * 0.56, w / 10, h * 0.1);
  fill(0);
  text("Restart", w * 0.46, h * 0.62);
}

async function fetchBestTime(config){
  let thisTime = config.endTime-config.startTime
  console.log("fetch starts")
  const jsonStr = JSON.stringify({difficulty:config.densMine,boardSize:config.boardSize,clicks:config.clickCount,timeCompleted: thisTime});
  console.log(jsonStr)
  

  const bestTimeRes = await fetch('/', {
    method: 'POST', // or 'GET' depending on your server configuration
    mode: 'cors',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
      // 'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: jsonStr,
  })//content-type unrecognized
  
    
  const bestTimeData = await bestTimeRes.json()
  
  console.log(bestTimeData);
  
  console.log("fetch done");
  return bestTimeData
}


function drawMenu() {
  background(200);
}    

/**
 * updates the remaining number of blocks (without mines)
 * to be activated to the element named config.remainingBlocks on html
 */
function updateRemainingBlocks(config){
  let remBlocks = config.boardSize.rows * config.boardSize.columns - config.numMine;
  if(config.blockCount) {remBlocks -= config.blockCount;}
  if(config.remainingBlocks) {config.remainingBlocks.innerHTML = "Blocks Remaining: " + remBlocks + ".   ";}
}

/**
 * updates the volume of all sound effects base on the value of the volume-slider
 */
function updateSoundVolume(config){
  const volumeSlider = document.getElementById('volume-slider')
  const volume = volumeSlider.value / 100;
  for(const sound in config.soundFiles) {
    console.log(sound);
    config.soundFiles[sound].setVolume(volume);
  }
}