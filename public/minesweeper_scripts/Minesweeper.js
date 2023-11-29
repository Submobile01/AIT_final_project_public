let config;

let boardSize;
let rows;
let columns;
let sideL;

let blocks;
let gameStage; //1-game, 2-gameOver, 3-youWon
let numMine;
let densMine;

let bestTime;
let startTime;
let endTime;

let clickCount = 0;
let remainingBlocks;

let flagCount;
let blockCount;
let buttonCount;






async function setup() {
  config.resources = {};
  gameCanvas = createCanvas(800, 600);
  gameCanvas.parent("main-canvas");
  // canvasDiv = document.getElementById("canvas-container");
  // if(canvasDiv) canvasDiv.appendChild(gameCanvas);
  rows = 15;
  columns = 20;
  boardSize = {rows,columns};
  remainingBlocks = document.getElementById("remaining-blocks");
  updateRemainingBlocks();

  densMine = 0.18;
  const slider = document.getElementById("slider");
  const saveButton = document.getElementById("saveButton"); 
  if(slider) {slider.addEventListener("input", ()=>{
    document.getElementById("sliderValue").innerHTML = "Mine density is <strong>" + slider.value + "%</strong>    ";
  });}
  if(saveButton) {saveButton.addEventListener("click", function() {
    densMine = parseInt(slider.value)/100;
    // Update the game variable using the slider value
    restart();
    console.log("mine density is ", densMine);
  });}
  
  restart();

  //load
  chu = loadSound("/data/chu.wav");
  yes = loadSound("/data/yes.wav");
  hua = loadSound("/data/hua.wav");
  bang = loadSound("/data/bang.wav");
  wow = loadSound("/data/wow.wav");
  ding = loadSound("/data/ding.wav");
  config.resources.soundFiles = {chu,yes,hua,bang,wow,ding};

  const volumeSlider = document.getElementById("volume-slider");
  updateSoundVolume();
  if(volumeSlider) {volumeSlider.addEventListener("input", updateSoundVolume);}


  for (const element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
}

function draw() {
  if (gameStage === 1) {

  } else if (gameStage === 2) {
    //drawRestart();
    //drawAllMines();
  } else {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        blocks[i][j].drawIt();
      }
    }
    drawWinBoard();
    for (let i = 0; i < config.resources.fireworks.length; i++) {
      if (config.resources.fireworks[i].inBound()) {
        config.resources.fireworks[i].drawIt();
      }
    }
  }
}

function mouseMoved() {

}

function mouseClicked() {

}

function mousePressed() {
  if (gameStage === 1) {
    const y = Math.floor(mouseY / sideL);
    const x = Math.floor(mouseX / sideL);
    if(0 <= y && 0 <= x && y < rows && x < columns){
      const theBlock = blocks[y][x];
    
    //console.log(theBlock.colorCode);
      if (mouseButton === LEFT) {
        buttonCount++;
        lightBlock(y, x, 3);
      } else if (mouseButton === RIGHT) {
        buttonCount++;
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
    if (gameStage === 1) {
      const y = Math.floor(mouseY / sideL);
      const x = Math.floor(mouseX / sideL);
      if(!(0 <= y && 0 <= x && y < rows && x < columns)) return; 
      let theBlock = blocks[y][x];
      if (mouseButton === LEFT) {
        buttonCount--;
        lightBlock(y, x, Block.ORIGSTATE);
      } else if (mouseButton === RIGHT) {
        buttonCount--;
      }
      if (theBlock.getState() === Block.REVEALEDSTATE && countFlags(y, x) === theBlock.getNumber()) {
        flipAround(y, x);
      } else if (theBlock.getState() === Block.REVEALEDSTATE) {
        lightAround(y, x, Block.ORIGSTATE);
      }
  
      if (theBlock.getState() !== Block.REVEALEDSTATE) {
        if (mouseButton === LEFT) {
          // first click stuff
          // println(clickCount);
          if (clickCount === 0) {
            startTime = hour() * 3600 + minute() * 60 + second();
            while (blocks[y][x].getNumber() !== 0) {
              reGenBlocks();
              // println(blocks[y][x].getNumber());
            }
          }
          theBlock = blocks[y][x];
          clickCount++;
          activateBlock(y, x);
        } else if (mouseButton === RIGHT) {
          config.resources.soundFiles.chu.play();
          if (theBlock.getState() === Block.FLAGSTATE) {
            theBlock.setState(Block.ORIGSTATE);
            flagCount--;
          } else {
            theBlock.setState(Block.FLAGSTATE);
            flagCount++;
          }
        }
        /*else if(mouseButton == CENTER){
          if(theBlock.getState() == 2) flipAround(y,x);
        }*/
        // theBlock.drawIt();
      }
      updateRemainingBlocks();
      if (blockCount === rows * columns - numMine) {
        config.resources.soundFiles.yes.play();
        gameStage = 3;
        endTime = hour() * 3600 + minute() * 60 + second();
        await fetchBestTime();
        for (let i = 0; i < 8; i++) {//generate config.resources.fireworks
          let ranSign = 1;
          if (random(2) > 1) {ranSign = -1;}
          const xs = random(10) * ranSign;
          const ys = -6 - random(8);
          const rs = xs * 0.05;
          const re = 140 + floor(random(100));
          const gr = 100 + floor(random(90));
          const bl = 100 + floor(random(90));
          config.resources.fireworks.push(new Firework(rs, xs, ys, re, gr, bl));
        }
        
      }
    }
  
    // when gameOver
    if (gameStage === 2) {
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
    if (gameStage === 3) {
      if (
        mouseX > width * 0.45 &&
        mouseX < width * 0.55 &&
        mouseY > height * 0.56 &&
        mouseY < height * 0.66
      ) {
        restart();
      } else {
        config.resources.soundFiles.hua.play();
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
        config.resources.fireworks.push(new Firework(rs, xs, ys, re, gr, bl));
      }
    }
    //console.log(rows * columns - numMine - blockCount);
  }

  /**
   * sets numMine number of blocks to be a mine (number = -1)
   * and generate number attribute of all blocks
   * 
   * @param {integer} numMine number of mines to put into game
   */
  function genField(numMine) {
    const f = new Array(rows).fill(0).map(() => new Array(columns).fill(0));
    for (let i = 0; i < numMine; i++) {
      const ran = floor(Math.random() * rows * columns);
      const row = floor(ran / columns);
      const column = ran % columns;
      if (f[row][column] === 0) {
        f[row][column] = -1;
      } else {
        i--;//do it again
      }
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (f[i][j] === -1) {
          blocks[i][j].number = -1;
          //blocks[i][j].state = 3;
        }
      }
    }
    getNumbers();
  }

  /**
   * updates number attribute of all blocks in game
   */
  function getNumbers() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (blocks[i][j].number !== -1) {
          // not left most
          if (i !== 0) {
            if (j !== 0) {
              if (blocks[i - 1][j - 1].number === -1) {blocks[i][j].number++;}
            }
            if (j !== columns - 1) {
              if (blocks[i - 1][j + 1].number === -1) {blocks[i][j].number++;}
            }
            if (blocks[i - 1][j].number === -1) {blocks[i][j].number++;}
          }
          // not right most
          if (i !== rows - 1) {
            if (j !== 0) {
              if (blocks[i + 1][j - 1].number === -1) {blocks[i][j].number++;}
            }
            if (j !== columns - 1) {
              if (blocks[i + 1][j + 1].number === -1) {blocks[i][j].number++;}
            }
            if (blocks[i + 1][j].number === -1) {blocks[i][j].number++;}
          }
          // neutral
          if (j !== 0) {
            if (blocks[i][j - 1].number === -1) {blocks[i][j].number++;}
          }
          if (j !== columns - 1) {
            if (blocks[i][j + 1].number === -1) {blocks[i][j].number++;}
          }
        }
        // if(blocks[i][j].number>=0) blocks[i][j].state = 2;(toTest)
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
    if (blocks[i][j].getState() === ORIGSTATE || blocks[i][j].getState() === Block.LIGHTEDSTATE) {
      blocks[i][j].setState(Block.REVEALEDSTATE);
      blockCount++;
      // println(blockCount);
      if (blocks[i][j].getNumber() === 0) {
        if (i !== 0) {
          if (j !== 0) {
            triggerZero(i - 1, j - 1);
          }
          if (j !== columns - 1) {
            triggerZero(i - 1, j + 1);
          }
          triggerZero(i - 1, j);
        }
        // not right most
        if (i !== rows - 1) {
          if (j !== 0) {
            triggerZero(i + 1, j - 1);
          }
          if (j !== columns - 1) {
            triggerZero(i + 1, j + 1);
          }
          triggerZero(i + 1, j);
        }
        // neutral
        if (j !== 0) {
          triggerZero(i, j - 1);
        }
        if (j !== columns - 1) {
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
        if (blocks[i - 1][j - 1].getState() === Block.FLAGSTATE) {count++;}
      }
      if (j !== columns - 1) {
        if (blocks[i - 1][j + 1].getState() === Block.FLAGSTATE) {count++;}
      }
      if (blocks[i - 1][j].getState() === Block.FLAGSTATE) {count++;}
    }
    // not right most
    if (i !== rows - 1) {
      if (j !== 0) {
        if (blocks[i + 1][j - 1].getState() === Block.FLAGSTATE) {count++;}
      }
      if (j !== columns - 1) {
        if (blocks[i + 1][j + 1].getState() === Block.FLAGSTATE) {count++;}
      }
      if (blocks[i + 1][j].getState() === Block.FLAGSTATE) {count++;}
    }
    // neutral
    if (j !== 0) {
      if (blocks[i][j - 1].getState() === Block.FLAGSTATE) {count++;}
    }
    if (j !== columns - 1) {
      if (blocks[i][j + 1].getState() === Block.FLAGSTATE) {count++;}
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
      if (j !== columns - 1) {
        activateBlock(i - 1, j + 1);
      }
      activateBlock(i - 1, j);
    }
    // not right most
    if (i !== rows - 1) {
      if (j !== 0) {
        activateBlock(i + 1, j - 1);
      }
      if (j !== columns - 1) {
        activateBlock(i + 1, j + 1);
      }
      activateBlock(i + 1, j);
    }
    // neutral
    if (j !== 0) {
      activateBlock(i, j - 1);
    }
    if (j !== columns - 1) {
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
      if (j !== columns - 1) {
        lightBlock(i - 1, j + 1, state);
      }
      lightBlock(i - 1, j, state);
    }
    // not right most
    if (i !== rows - 1) {
      if (j !== 0) {
        lightBlock(i + 1, j - 1, state);
      }
      if (j !== columns - 1) {
        lightBlock(i + 1, j + 1, state);
      }
      lightBlock(i + 1, j, state);
    }
    // neutral
    if (j !== 0) {
      lightBlock(i, j - 1, state);
    }
    if (j !== columns - 1) {
      lightBlock(i, j + 1, state);
    }
  }
  

  /**
   * visualize the locations of all mines and blocks
   * when a bomb is triggered and the restart game state happens
   */
  function drawAllMines() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const theBlock = blocks[i][j];
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
    const theBlock = blocks[i][j];
    if (theBlock.getState() === Block.ORIGSTATE || theBlock.getState() === 3) {//?
      if (theBlock.getNumber() === -1) {
        gameStage = 2;
        config.resources.soundFiles.bang.play();
        endTime = hour() * 3600 + minute() * 60 + second();
      } else if (blockCount === rows * columns - numMine) {
      } else if (theBlock.getNumber() === 0) {
        triggerZero(i, j);
        config.resources.soundFiles.wow.play();
      } else {
        blockCount++;
        config.resources.soundFiles.ding.play();
      }
      // println(blockCount);
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
    const theBlock = blocks[i][j];
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
    gameStage = 1;
    flagCount = 0;
    blockCount = 0;
    clickCount = 0;
    numMine = round(rows * columns * densMine);
    sideL = height / rows;
    blocks = new Array(rows);
    config.resources.fireworks = [];
    background(0);
    
    reGenBlocks();
  
    //draw the initial
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        blocks[i][j].drawIt();
      }
    }
  }
  
  /**
   * re-instantiate the blocks to their ORIGSTATE
   * and generate the mines and numbers on the squares
   */
  function reGenBlocks() {
    //instantiate each Block
    for (let i = 0; i < rows; i++) {
      blocks[i] = new Array(columns);
      for (let j = 0; j < columns; j++) {
        blocks[i][j] = new Block(j, i, height / rows);
      }
    }
    //generate mines and numbers
    genField(numMine);
  }
  

  function drawWinBoard() {
    //the rectangle
    fill(color(130, 130, 210, 130));
    noStroke();
    rect(width / 3, height / 4, width / 3, height / 2, 55);
  
    //the words
    let bestTimeString;
    if(!bestTime) {bestTime = 0;}
    const thisTime = endTime - startTime;


    


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
    let thisTime = endTime-startTime
    console.log("fetch starts")
    console.log(JSON.stringify({difficulty:densMine,boardSize,clicks:clickCount,timeCompleted: thisTime}))
    

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
      body: JSON.stringify({difficulty:densMine,boardSize,clicks:clickCount,timeCompleted: thisTime}),
    })
    
      
    const bestTimeData = await bestTimeRes.json()
    console.log(bestTimeData);
    
    console.log("fetch done");
  }
  

  function drawMenu() {
    background(200);
  }    

  /**
   * updates the remaining number of blocks (without mines)
   * to be activated to the element named remainingBlocks on html
   */
  function updateRemainingBlocks(){
    let remBlocks = rows * columns - numMine;
    if(blockCount) {remBlocks -= blockCount;}
    if(remainingBlocks) {remainingBlocks.innerHTML = "Blocks Remaining: " + remBlocks + ".   ";}
  }

  /**
   * updates the volume of all sound effects base on the value of the volume-slider
   */
  function updateSoundVolume(){
    const volumeSlider = document.getElementById('volume-slider')
    const volume = volumeSlider.value / 100;
    for(const sound in config.resources.soundFiles) {
      console.log(sound);
      config.resources.soundFiles[sound].setVolume(volume);
    }
  }