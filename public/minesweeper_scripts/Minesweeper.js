let config;





//gameStage 1-game, 2-gameOver, 3-youWon

let bestTime;






let s = (s) => {
  s.setup = async function() {
    config = {};
    config.clickCount = 0
    gameCanvas = s.createCanvas(800, 600);
    gameCanvas.parent("main-canvas");
    // canvasDiv = document.getElementById("canvas-container");
    // if(canvasDiv) canvasDiv.appendChild(gameCanvas);
    rows = 15;
    columns = 20;
    config.boardSize = {rows,columns};
    config.remainingBlocks = document.getElementById("remaining-blocks");
    updateRemainingBlocks(config);
  
    config.densMine = 0.18;
    const slider = document.getElementById("slider");
    const saveButton = document.getElementById("saveButton"); 
    if(slider) {slider.addEventListener("input", ()=>{
      document.getElementById("sliderValue").innerHTML = "Mine density is <strong>" + slider.value + "%</strong>    ";
    });}
    if(saveButton) {saveButton.addEventListener("click", function() {
      config.densMine = parseInt(slider.value)/100;
      // Update the game variable using the slider value
      restart(config, undefined, s);
      console.log("mine density is ", config.densMine);
    });}
    
    restart(config, undefined, s);
  
    //load
    chu = s.loadSound("/data/chu.wav");
    yes = s.loadSound("/data/yes.wav");
    hua = s.loadSound("/data/hua.wav");
    bang = s.loadSound("/data/bang.wav");
    wow = s.loadSound("/data/wow.wav");
    ding = s.loadSound("/data/ding.wav");
    config.soundFiles = {chu,yes,hua,bang,wow,ding};
  
    const volumeSlider = document.getElementById("volume-slider");
    updateSoundVolume(config);
    if(volumeSlider) {volumeSlider.addEventListener("input", e => updateSoundVolume(config));}
  
  
    for (const element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }
  
  s.draw = () =>{
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
      drawWinBoard( config, s);
      for (let i = 0; i < config.fireworks.length; i++) {
        if (config.fireworks[i].inBound()) {
          config.fireworks[i].drawIt();
        }
      }
    }
  }
  
  // function mouseMoved() {
  
  // }
  
  // function mouseClicked() {
  
  // }
  
  s.mousePressed = function() {
    if (config.gameStage === 1) {
      const y = Math.floor(s.mouseY / config.sideL);
      const x = Math.floor(s.mouseX / config.sideL);
      if(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns){
        const theBlock = config.blocks[y][x];
      
      //console.log(theBlock.colorCode);
        if (s.mouseButton === s.LEFT) {
          config.buttonCount++;
          lightBlock(y, x, 3, config);
        } else if (s.mouseButton === s.RIGHT) {
          config.buttonCount++;
        }
        if ( theBlock.getState() === Block.REVEALEDSTATE) {
          lightAround(y, x, Block.LIGHTEDSTATE, config);
        }
      }
    }
  }
  s.mouseReleased = async function () {
    // when playing
    console.log(s.mouseButton);
    if (config.gameStage === 1) {
      const y = Math.floor(s.mouseY / config.sideL);
      const x = Math.floor(s.mouseX / config.sideL);
      if(!(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns)) return; 
      let theBlock = config.blocks[y][x];
      if (s.mouseButton === s.LEFT) {
        config.buttonCount--;
        lightBlock(y, x, Block.ORIGSTATE, config);
      } else if (s.mouseButton === s.RIGHT) {
        config.buttonCount--;
      }
      if (theBlock.getState() === Block.REVEALEDSTATE && countFlags(y, x, config) === theBlock.getNumber()) {
        flipAround(y, x, config, s);
      } else if (theBlock.getState() === Block.REVEALEDSTATE) {
        lightAround(y, x, Block.ORIGSTATE, config);
      }
  
      if (theBlock.getState() !== Block.REVEALEDSTATE) {
        if (s.mouseButton === s.LEFT) {
          // first click stuff
          // println(config.clickCount);
          if (config.clickCount === 0) {
            config.startTime = s.hour() * 3600 + s.minute() * 60 + s.second();
            while (config.blocks[y][x].getNumber() !== 0) {
              reGenBlocks( config, undefined, s);
              // println(config.blocks[y][x].getNumber());
            }
          }
          theBlock = config.blocks[y][x];
          config.clickCount++;
          activateBlock(y, x, config, s);
        } else if (s.mouseButton === s.RIGHT) {
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
      updateRemainingBlocks( config);
      if (config.blockCount === config.boardSize.rows * config.boardSize.columns - config.numMine) {
        config.soundFiles.yes.play();
        config.gameStage = 3;
        config.endTime = s.hour() * 3600 + s.minute() * 60 + s.second();
        config.bestTimes = await fetchBestTime( config);
        console.log(config.bestTimes.bestGlobalTime, config.bestTimes.bestGlobalTime)
        for (let i = 0; i < 8; i++) {//generate config.fireworks
          let ranSign = 1;
          if (s.random(2) > 1) {ranSign = -1;}
          const xs = s.random(10) * ranSign;
          const ys = -6 - s.random(8);
          const rs = xs * 0.05;
          const re = 140 + s.floor(s.random(100));
          const gr = 100 + s.floor(s.random(90));
          const bl = 100 + s.floor(s.random(90));
          config.fireworks.push(new Firework(rs, xs, ys, re, gr, bl,s));
        }
        
      }
    }
  
    // when gameOver
    if (config.gameStage === 2) {
      drawAllMines( config);
      drawRestart( config, s);
      if (
        s.mouseX > s.width * 0.45 &&
        s.mouseX < s.width * 0.55 &&
        s.mouseY > s.height * 0.56 &&
        s.mouseY < s.height * 0.66
      ) {
        restart( config, undefined, s);
      }
    }
    if (config.gameStage === 3) {
      if (
        s.mouseX > s.width * 0.45 &&
        s.mouseX < s.width * 0.55 &&
        s.mouseY > s.height * 0.56 &&
        s.mouseY < s.height * 0.66
      ) {
        restart( config, undefined, s);
      } else {
        config.soundFiles.hua.play();
      }
      for (let i = 0; i < 8; i++) {
        let ranSign = 1;
        if (s.random(2) > 1) {ranSign = -1;}
        const xs = s.random(10) * ranSign;
        const ys = -6 - s.random(8);
        const rs = xs * 0.05;
        const re = 140 + s.floor(s.random(100));
        const gr = 100 + s.floor(s.random(90));
        const bl = 100 + s.floor(s.random(90));
        config.fireworks.push(new Firework(rs, xs, ys, re, gr, bl,s));
      }
    }
    //console.log(config.boardSize.rows * config.boardSize.columns - config.numMine - config.blockCount);
  }
}


new p5(s)
  