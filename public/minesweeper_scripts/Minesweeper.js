let config;





//gameStage 1-game, 2-gameOver, 3-youWon

let bestTime;









async function setup() {
  config = {};
  config.clickCount = 0
  gameCanvas = createCanvas(800, 600);
  gameCanvas.parent("main-canvas");
  // canvasDiv = document.getElementById("canvas-container");
  // if(canvasDiv) canvasDiv.appendChild(gameCanvas);
  rows = 15;
  columns = 20;
  config.boardSize = {rows,columns};
  config.remainingBlocks = document.getElementById("remaining-blocks");
  updateRemainingBlocks();

  config.densMine = 0.18;
  const slider = document.getElementById("slider");
  const saveButton = document.getElementById("saveButton"); 
  if(slider) {slider.addEventListener("input", ()=>{
    document.getElementById("sliderValue").innerHTML = "Mine density is <strong>" + slider.value + "%</strong>    ";
  });}
  if(saveButton) {saveButton.addEventListener("click", function() {
    config.densMine = parseInt(slider.value)/100;
    // Update the game variable using the slider value
    restart();
    console.log("mine density is ", config.densMine);
  });}
  
  restart();

  //load
  chu = loadSound("/data/chu.wav");
  yes = loadSound("/data/yes.wav");
  hua = loadSound("/data/hua.wav");
  bang = loadSound("/data/bang.wav");
  wow = loadSound("/data/wow.wav");
  ding = loadSound("/data/ding.wav");
  config.soundFiles = {chu,yes,hua,bang,wow,ding};

  const volumeSlider = document.getElementById("volume-slider");
  updateSoundVolume();
  if(volumeSlider) {volumeSlider.addEventListener("input", updateSoundVolume);}


  for (const element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
}

function draw() {
  if (config.gameStage === 1) {

  } else if (config.gameStage === 2) {
    //drawRestart();
    //drawAllMines();
  } else {
    for (let i = 0; i < config.boardSize.rows; i++) {
      for (let j = 0; j < config.boardSize.columns; j++) {
        config.blocks[i][j].drawIt();
      }
    }
    drawWinBoard();
    for (let i = 0; i < config.fireworks.length; i++) {
      if (config.fireworks[i].inBound()) {
        config.fireworks[i].drawIt();
      }
    }
  }
}

function mouseMoved() {

}

function mouseClicked() {

}

function mousePressed() {
  if (config.gameStage === 1) {
    const y = Math.floor(mouseY / config.sideL);
    const x = Math.floor(mouseX / config.sideL);
    if(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns){
      const theBlock = config.blocks[y][x];
    
    //console.log(theBlock.colorCode);
      if (mouseButton === LEFT) {
        config.buttonCount++;
        lightBlock(y, x, 3);
      } else if (mouseButton === RIGHT) {
        config.buttonCount++;
      }
      if ( theBlock.getState() === Block.REVEALEDSTATE) {
        lightAround(y, x, Block.LIGHTEDSTATE);
      }
    }
  }
}
 async function mouseReleased() {
    // when playing
    console.log(mouseButton);
    if (config.gameStage === 1) {
      const y = Math.floor(mouseY / config.sideL);
      const x = Math.floor(mouseX / config.sideL);
      if(!(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns)) return; 
      let theBlock = config.blocks[y][x];
      if (mouseButton === LEFT) {
        config.buttonCount--;
        lightBlock(y, x, Block.ORIGSTATE);
      } else if (mouseButton === RIGHT) {
        config.buttonCount--;
      }
      if (theBlock.getState() === Block.REVEALEDSTATE && countFlags(y, x) === theBlock.getNumber()) {
        flipAround(y, x);
      } else if (theBlock.getState() === Block.REVEALEDSTATE) {
        lightAround(y, x, Block.ORIGSTATE);
      }
  
      if (theBlock.getState() !== Block.REVEALEDSTATE) {
        if (mouseButton === LEFT) {
          // first click stuff
          // println(config.clickCount);
          if (config.clickCount === 0) {
            config.startTime = hour() * 3600 + minute() * 60 + second();
            while (config.blocks[y][x].getNumber() !== 0) {
              reGenBlocks();
              // println(config.blocks[y][x].getNumber());
            }
          }
          theBlock = config.blocks[y][x];
          config.clickCount++;
          activateBlock(y, x);
        } else if (mouseButton === RIGHT) {
          config.soundFiles.chu.play();
          if (theBlock.getState() === Block.FLAGSTATE) {
            theBlock.setState(Block.ORIGSTATE);
            config.flagCount--;
          } else {
            theBlock.setState(Block.FLAGSTATE);
            config.flagCount++;
          }
        }
        /*else if(mouseButton == CENTER){
          if(theBlock.getState() == 2) flipAround(y,x);
        }*/
        // theBlock.drawIt();
      }
      updateRemainingBlocks();
      if (config.blockCount === config.boardSize.rows * config.boardSize.columns - config.numMine) {
        config.soundFiles.yes.play();
        config.gameStage = 3;
        config.endTime = hour() * 3600 + minute() * 60 + second();
        await fetchBestTime();
        for (let i = 0; i < 8; i++) {//generate config.fireworks
          let ranSign = 1;
          if (random(2) > 1) {ranSign = -1;}
          const xs = random(10) * ranSign;
          const ys = -6 - random(8);
          const rs = xs * 0.05;
          const re = 140 + floor(random(100));
          const gr = 100 + floor(random(90));
          const bl = 100 + floor(random(90));
          config.fireworks.push(new Firework(rs, xs, ys, re, gr, bl));
        }
        
      }
    }
  
    // when gameOver
    if (config.gameStage === 2) {
      drawAllMines();
      drawRestart();
      if (
        mouseX > width * 0.45 &&
        mouseX < width * 0.55 &&
        mouseY > height * 0.56 &&
        mouseY < height * 0.66
      ) {
        restart();
      }
    }
    if (config.gameStage === 3) {
      if (
        mouseX > width * 0.45 &&
        mouseX < width * 0.55 &&
        mouseY > height * 0.56 &&
        mouseY < height * 0.66
      ) {
        restart();
      } else {
        config.soundFiles.hua.play();
      }
      for (let i = 0; i < 8; i++) {
        let ranSign = 1;
        if (random(2) > 1) {ranSign = -1;}
        const xs = random(10) * ranSign;
        const ys = -6 - random(8);
        const rs = xs * 0.05;
        const re = 140 + floor(random(100));
        const gr = 100 + floor(random(90));
        const bl = 100 + floor(random(90));
        config.fireworks.push(new Firework(rs, xs, ys, re, gr, bl));
      }
    }
    //console.log(config.boardSize.rows * config.boardSize.columns - config.numMine - config.blockCount);
  }

  /**
   * sets numMine number of blocks to be a mine (number = -1)
   * and generate number attribute of all blocks
   * 
   * @param {integer} numMine number of mines to put into game
   */
  function genField(numMine) {
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
    getNumbers();
  }

  /**
   * updates number attribute of all blocks in game
   */
  function getNumbers() {
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
  function triggerZero(i, j) {
    if (config.blocks[i][j].getState() === ORIGSTATE || config.blocks[i][j].getState() === Block.LIGHTEDSTATE) {
      config.blocks[i][j].setState(Block.REVEALEDSTATE);
      config.blockCount++;
      // println(config.blockCount);
      if (config.blocks[i][j].getNumber() === 0) {
        if (i !== 0) {
          if (j !== 0) {
            triggerZero(i - 1, j - 1);
          }
          if (j !== config.boardSize.columns - 1) {
            triggerZero(i - 1, j + 1);
          }
          triggerZero(i - 1, j);
        }
        // not right most
        if (i !== config.boardSize.rows - 1) {
          if (j !== 0) {
            triggerZero(i + 1, j - 1);
          }
          if (j !== config.boardSize.columns - 1) {
            triggerZero(i + 1, j + 1);
          }
          triggerZero(i + 1, j);
        }
        // neutral
        if (j !== 0) {
          triggerZero(i, j - 1);
        }
        if (j !== config.boardSize.columns - 1) {
          triggerZero(i, j + 1);
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
  function countFlags(i, j) {
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
  function flipAround(i, j) {
    if (i !== 0) {
      if (j !== 0) {
        activateBlock(i - 1, j - 1);
      }
      if (j !== config.boardSize.columns - 1) {
        activateBlock(i - 1, j + 1);
      }
      activateBlock(i - 1, j);
    }
    // not right most
    if (i !== config.boardSize.rows - 1) {
      if (j !== 0) {
        activateBlock(i + 1, j - 1);
      }
      if (j !== config.boardSize.columns - 1) {
        activateBlock(i + 1, j + 1);
      }
      activateBlock(i + 1, j);
    }
    // neutral
    if (j !== 0) {
      activateBlock(i, j - 1);
    }
    if (j !== config.boardSize.columns - 1) {
      activateBlock(i, j + 1);
    }
  }
  
  /**
   * lights around the selected block
   * 
   * @param {integer} i vertical index of the block selected
   * @param {integer} j horizontal index of the block selected
   * @param {integer} state the state to set the block to(dim/light)
   */
  function lightAround(i, j, state) {
    if (i !== 0) {
      if (j !== 0) {
        lightBlock(i - 1, j - 1, state);
      }
      if (j !== config.boardSize.columns - 1) {
        lightBlock(i - 1, j + 1, state);
      }
      lightBlock(i - 1, j, state);
    }
    // not right most
    if (i !== config.boardSize.rows - 1) {
      if (j !== 0) {
        lightBlock(i + 1, j - 1, state);
      }
      if (j !== config.boardSize.columns - 1) {
        lightBlock(i + 1, j + 1, state);
      }
      lightBlock(i + 1, j, state);
    }
    // neutral
    if (j !== 0) {
      lightBlock(i, j - 1, state);
    }
    if (j !== config.boardSize.columns - 1) {
      lightBlock(i, j + 1, state);
    }
  }
  

  /**
   * visualize the locations of all mines and blocks
   * when a bomb is triggered and the restart game state happens
   */
  function drawAllMines() {
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
  function activateBlock(i, j) {
    const theBlock = config.blocks[i][j];
    if (theBlock.getState() === Block.ORIGSTATE || theBlock.getState() === 3) {//?
      if (theBlock.getNumber() === -1) {
        config.gameStage = 2;
        config.soundFiles.bang.play();
        config.endTime = hour() * 3600 + minute() * 60 + second();
      } else if (config.blockCount === config.boardSize.rows * config.boardSize.columns - config.numMine) {
      } else if (theBlock.getNumber() === 0) {
        triggerZero(i, j);
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
  function lightBlock(i, j, state) {
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
  function drawRestart() {

    //the rectangle
    fill(130, 130, 210, 130);
    noStroke();
    rect(width / 3, height / 4, width / 3, height / 2, 55);
  
    //the words
    let bestTimeString;
    if (bestTime === undefined) {bestTimeString = "--";}
    else {bestTimeString = bestTime + "";}
    textFont("Arial", width / 36);
    fill(0);
    text("Time: " + "--", width * 0.35, height * 0.35);
    text("Best Time: " + bestTimeString, width * 0.35, height * 0.42);

    
    //restart Button
    fill(color(60));
    noStroke();
    rect(width * 0.45, height * 0.56, width / 10, height * 0.1);
    fill(160, 70, 70, 200);
    text("Restart", width * 0.46, height * 0.62);
  }
  
  /**
   * restarts the game: reset all counts and stage variables
   * and regenerate/redraw the blocks
   */
  function restart() {
    config.gameStage = 1;
    config.flagCount = 0;
    config.blockCount = 0;
    config.clickCount = 0;
    config.numMine = round(config.boardSize.rows * config.boardSize.columns * config.densMine);
    config.sideL = height / config.boardSize.rows;
    config.blocks = new Array(config.boardSize.rows);
    config.fireworks = [];
    background(0);
    
    reGenBlocks();
  
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
  function reGenBlocks() {
    //instantiate each Block
    for (let i = 0; i < config.boardSize.rows; i++) {
      config.blocks[i] = new Array(config.boardSize.columns);
      for (let j = 0; j < config.boardSize.columns; j++) {
        config.blocks[i][j] = new Block(j, i, height / config.boardSize.rows);
      }
    }
    //generate mines and numbers
    genField(config.numMine);
  }
  

  function drawWinBoard() {
    //the rectangle
    fill(color(130, 130, 210, 130));
    noStroke();
    rect(width / 3, height / 4, width / 3, height / 2, 55);
  
    //the words
    let bestTimeString;
    if(!bestTime) {bestTime = 0;}
    const thisTime = config.endTime - config.startTime;


    


    if (thisTime < bestTime || bestTime === 0) {
      bestTime = thisTime;
    }
  
    if (bestTime === 0) {bestTimeString = "--";}
    else {bestTimeString = bestTime + "";}
    textFont("Times New Roman",width / 48);
    text("Click Anywhere for more FUN", width * 0.38, height * 0.29);
    fill(44, 66, 132);
    textFont("Arial", int(width / 36.0));
    text("Time: " + thisTime, width * 0.35, height * 0.35);
    text("Best Time: " + bestTimeString, width * 0.35, height * 0.42);
  
    //restart Button
    fill(color(60, 200));
    noStroke();
    rect(width * 0.45, height * 0.56, width / 10, height * 0.1);
    fill(0);
    text("Restart", width * 0.46, height * 0.62);
  }

  async function fetchBestTime(){
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
  }
  

  function drawMenu() {
    background(200);
  }    

  /**
   * updates the remaining number of blocks (without mines)
   * to be activated to the element named config.remainingBlocks on html
   */
  function updateRemainingBlocks(){
    let remBlocks = config.boardSize.rows * config.boardSize.columns - config.numMine;
    if(config.blockCount) {remBlocks -= config.blockCount;}
    if(config.remainingBlocks) {config.remainingBlocks.innerHTML = "Blocks Remaining: " + remBlocks + ".   ";}
  }

  /**
   * updates the volume of all sound effects base on the value of the volume-slider
   */
  function updateSoundVolume(){
    const volumeSlider = document.getElementById('volume-slider')
    const volume = volumeSlider.value / 100;
    for(const sound in config.soundFiles) {
      console.log(sound);
      config.soundFiles[sound].setVolume(volume);
    }
  }