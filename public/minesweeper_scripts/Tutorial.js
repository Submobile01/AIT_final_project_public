


//let myp5 = new p5(s,'canvas1');
function createSketchFn(boardSetup,index){
  let config;
  return (sketch) => { 
    sketch.setup = function (){
        sketch.config = config
        const w = 50*boardSetup.columns
        const h = 50*boardSetup.rows
        canvas1 = sketch.createCanvas(w, h);
        sketch.height = h
        sketch.width = w;
        canvas1.parent('canvas'+index)
        config = {};
        config.clickCount = 0
        // canvasDiv = document.getElementById("canvas-container");
        // if(canvasDiv) canvasDiv.appendChild(gameCanvas);
        config.boardSize = {rows:boardSetup.rows,columns:boardSetup.columns};
        config.remainingBlocks = document.getElementById("remaining-blocks");
        updateRemainingBlocks(config);

        //config.densMine = 0.18;
        
        const slider = document.getElementById("slider");
        const saveButton = document.getElementById("saveButton"); 
        if(slider) {slider.addEventListener("input", ()=>{
            document.getElementById("sliderValue").innerHTML = "Mine density is <strong>" + slider.value + "%</strong>    ";
        });}
        if(saveButton) {saveButton.addEventListener("click", function() {
            config.densMine = parseInt(slider.value)/100;
            // Update the game variable using the slider value
            restart(config,boardSetup,sketch);
            console.log("mine density is ", config.densMine);
        });}
        //console.log(sketch)
        restart(config,boardSetup,sketch);

        //load
        chu = sketch.loadSound("/data/chu.wav");
        yes = sketch.loadSound("/data/yes.wav");
        hua = sketch.loadSound("/data/hua.wav");
        bang = sketch.loadSound("/data/bang.wav");
        wow = sketch.loadSound("/data/wow.wav");
        ding = sketch.loadSound("/data/ding.wav");
        config.soundFiles = {chu,yes,hua,bang,wow,ding};

        const volumeSlider = document.getElementById("volume-slider");
        //updateSoundVolume(config);
        //if(volumeSlider) {volumeSlider.addEventListener("input", updateSoundVolume);}


        for (const element of document.getElementsByClassName("p5Canvas")) {
            element.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    };

    sketch.draw = function (){
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
          drawWinBoard( config,sketch);
          for (let i = 0; i < config.fireworks.length; i++) {
            if (config.fireworks[i].inBound()) {
              config.fireworks[i].drawIt();
            }
          }
        }
    };
    sketch.mousePressed =  function (){
        if (config.gameStage === 1) {
          const y = Math.floor(sketch.mouseY / config.sideL);
          const x = Math.floor(sketch.mouseX / config.sideL);
          if(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns){
            const theBlock = config.blocks[y][x];
          
          //console.log(theBlock.colorCode);
            if (sketch.mouseButton === sketch.LEFT) {
              config.buttonCount++;
              lightBlock(y, x, 3, config);
            } else if (sketch.mouseButton === sketch.RIGHT) {
              config.buttonCount++;
            }
            if ( theBlock.getState() === Block.REVEALEDSTATE) {
              lightAround(y, x, Block.LIGHTEDSTATE, config);
            }
          }
        }
      }
      sketch.mouseReleased = async function (){
        // when playing
        console.log(sketch.mouseButton);
        console.log(sketch.height,sketch.width)
        if (config.gameStage === 1) {
          const y = Math.floor(sketch.mouseY / config.sideL);
          const x = Math.floor(sketch.mouseX / config.sideL);
          if(!(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns)) return; 
          let theBlock = config.blocks[y][x];
          if (sketch.mouseButton === sketch.LEFT) {
              config.buttonCount--;
              lightBlock(y, x, Block.ORIGSTATE, config);
          } else if (sketch.mouseButton === sketch.RIGHT) {
              config.buttonCount--;
          }
          if (theBlock.getState() === Block.REVEALEDSTATE && countFlags(y, x, config) === theBlock.getNumber()) {
              flipAround(y, x, config, sketch);
          } else if (theBlock.getState() === Block.REVEALEDSTATE) {
              lightAround(y, x, Block.ORIGSTATE, config);
          }
      
          if (theBlock.getState() !== Block.REVEALEDSTATE) {
              if (sketch.mouseButton === sketch.LEFT) {
              // first click stuff
              // println(config.clickCount);
              if (config.clickCount === 0) {
                  config.startTime = sketch.hour() * 3600 + sketch.minute() * 60 + sketch.second();
                  // while (config.blocks[y][x].getNumber() !== 0) {
                  //     reGenBlocks( config);
                  // // println(config.blocks[y][x].getNumber());
                  // }
              }
              theBlock = config.blocks[y][x];
              config.clickCount++;
              activateBlock(y, x, config, sketch);
              } else if (sketch.mouseButton === sketch.RIGHT) {
              config.soundFiles.chu.play();
              if (theBlock.getState() === Block.FLAGSTATE) {
                  theBlock.setState(Block.ORIGSTATE);
                  config.flagCount--;
              } else {
                  theBlock.setState(Block.FLAGSTATE);
                  config.flagCount++;
              }
              }
              /*else if(sketch.mouseButton == CENTER){
              if(theBlock.getState() == 2) flipAround(y,x);
              }*/
              // theBlock.drawIt();
          }
          updateRemainingBlocks( config);
          checkSucceeded(config,boardSetup, index)
          // if (config.blockCount === config.boardSize.rows * config.boardSize.columns - config.numMine) {
          //     config.soundFiles.yes.play();
          //     config.gameStage = 3;
          //     config.endTime = hour() * 3600 + minute() * 60 + second();
          //     config.bestTimes = await fetchBestTime( config);
          //     console.log(config.bestTimes.bestGlobalTime, config.bestTimes.bestGlobalTime)
          //     for (let i = 0; i < 8; i++) {//generate config.fireworks
          //     let ranSign = 1;
          //     if (random(2) > 1) {ranSign = -1;}
          //     const xs = random(10) * ranSign;
          //     const ys = -6 - random(8);
          //     const rs = xs * 0.05;
          //     const re = 140 + floor(random(100));
          //     const gr = 100 + floor(random(90));
          //     const bl = 100 + floor(random(90));
          //     config.fireworks.push(new Firework(rs, xs, ys, re, gr, bl));
          //     }
              
          // }
        }
    
        // when gameOver
        if (config.gameStage === 2) {
          drawAllMines( config);
          drawRestart( config,sketch);
          if (
            sketch.mouseX > sketch.width * 0.45 &&
            sketch.mouseX < sketch.width * 0.55 &&
            sketch.mouseY > sketch.height * 0.56 &&
            sketch.mouseY < sketch.height * 0.66
          ) {
              restart( config,boardSetup,sketch);
          }
          }
          if (config.gameStage === 3) {
          if (
            sketch.mouseX > sketch.width * 0.45 &&
            sketch.mouseX < sketch.width * 0.55 &&
            sketch.mouseY > sketch.height * 0.56 &&
            sketch.mouseY < sketch.height * 0.66
          ) {
              restart( config,boardSetup,sketch);
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
  }
}
numSketches = 2
let currentSketch;

boardSetup = {}
boardSetup.rows = 4
boardSetup.columns = 2
boardSetup.numMine = 1
boardSetup.numBlocks = 2
boardSetup.mines = [[0,0],[-1,0],[0,0],[0,0]]
boardSetup.states = [[0,2],[0,2],[2,2],[2,2]]
boardSetup2 = {}
boardSetup2.rows = 4
boardSetup2.columns = 2
boardSetup2.numMine = 1
boardSetup2.numBlocks = 2
boardSetup2.mines = [[-1,0],[0,0],[0,0],[0,0]]
boardSetup2.states = [[0,2],[0,2],[2,2],[2,2]]

let boardSetupList = [boardSetup, boardSetup2]
let sList = [] 
for(let i=0; i<numSketches; i++){
  sList.push(createSketchFn(boardSetupList[i],(i+1)))
}
new p5(sList[0]);
//currentSketch.remove()
new p5(sList[1])


























// let i = 0

// currentSketch = new p5(sList[i]);




// const nextBtn = document.getElementById('nextBtn')
// const prevBtn = document.getElementById('prevBtn')
// const canvasContainer = document.getElementById('canvas1')

// const nextFn = (event) => {
//   event.preventDefault()
//   if(i < numSketches-1){
//     i++
//     console.log(i,sList[i])
//     // let childNodes = canvasContainer.childNodes
//     // childNodes = [...childNodes]
//     // const canvas = childNodes
//     // console.log(childNodes.slice(0,4),canvas, i)
//     canvasContainer.innerHTML = ''
//     currentSketch = new p5(sList[i])
//   }
  
  
// }

// const prevFn = (event) => {
//   event.preventDefault()
//   if(i > 0){
//     i--
//     // const childNodes = canvasContainer.childNodes
//     // childNodes = [...childNodes]
//     // const canvas = childNodes
//     console.log(i,sList.length)
//     // console.log(childNodes.slice(0,4),canvas, i)
//     canvasContainer.innerHTML = ''
    
//     currentSketch = new p5(sList[i])
//   }
  
// }


// nextBtn.addEventListener('click', nextFn)
// prevBtn.addEventListener('click', prevFn)

