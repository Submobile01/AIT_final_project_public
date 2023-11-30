
    let config;
    setup = function(){
        canvas1 = createCanvas(200, 200);
        canvas1.parent('canvas1')
        config = {};
        config.clickCount = 0
        // canvasDiv = document.getElementById("canvas-container");
        // if(canvasDiv) canvasDiv.appendChild(gameCanvas);
        rows = 4;
        columns = 2;
        config.boardSize = {rows,columns};
        config.remainingBlocks = document.getElementById("remaining-blocks");
        updateRemainingBlocks(config);

        //config.densMine = 0.18;
        boardSetup = [[-1,0,0,0],[0,0,0,0]]
        const slider = document.getElementById("slider");
        const saveButton = document.getElementById("saveButton"); 
        if(slider) {slider.addEventListener("input", ()=>{
            document.getElementById("sliderValue").innerHTML = "Mine density is <strong>" + slider.value + "%</strong>    ";
        });}
        if(saveButton) {saveButton.addEventListener("click", function() {
            config.densMine = parseInt(slider.value)/100;
            // Update the game variable using the slider value
            restart(config,boardSetup);
            console.log("mine density is ", config.densMine);
        });}
        
        restart(config,boardSetup);

        //load
        chu = loadSound("/data/chu.wav");
        yes = loadSound("/data/yes.wav");
        hua = loadSound("/data/hua.wav");
        bang = loadSound("/data/bang.wav");
        wow = loadSound("/data/wow.wav");
        ding = loadSound("/data/ding.wav");
        config.soundFiles = {chu,yes,hua,bang,wow,ding};

        const volumeSlider = document.getElementById("volume-slider");
        updateSoundVolume(config);
        if(volumeSlider) {volumeSlider.addEventListener("input", updateSoundVolume);}


        for (const element of document.getElementsByClassName("p5Canvas")) {
            element.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    };

    draw = function(){
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
          drawWinBoard( config);
          for (let i = 0; i < config.fireworks.length; i++) {
            if (config.fireworks[i].inBound()) {
              config.fireworks[i].drawIt();
            }
          }
        }
    };
    mousePressed=function(){
        if (config.gameStage === 1) {
          const y = Math.floor(mouseY / config.sideL);
          const x = Math.floor(mouseX / config.sideL);
          if(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns){
            const theBlock = config.blocks[y][x];
          
          //console.log(theBlock.colorCode);
            if (mouseButton === LEFT) {
              config.buttonCount++;
              lightBlock(y, x, 3, config);
            } else if (mouseButton === RIGHT) {
              config.buttonCount++;
            }
            if ( theBlock.getState() === Block.REVEALEDSTATE) {
              lightAround(y, x, Block.LIGHTEDSTATE, config);
            }
          }
        }
      }
    mouseReleased = async function(){
        // when playing
        console.log(mouseButton);
        if (config.gameStage === 1) {
        const y = Math.floor(mouseY / config.sideL);
        const x = Math.floor(mouseX / config.sideL);
        if(!(0 <= y && 0 <= x && y < config.boardSize.rows && x < config.boardSize.columns)) return; 
        let theBlock = config.blocks[y][x];
        if (mouseButton === LEFT) {
            config.buttonCount--;
            lightBlock(y, x, Block.ORIGSTATE, config);
        } else if (mouseButton === RIGHT) {
            config.buttonCount--;
        }
        if (theBlock.getState() === Block.REVEALEDSTATE && countFlags(y, x, config) === theBlock.getNumber()) {
            flipAround(y, x, config);
        } else if (theBlock.getState() === Block.REVEALEDSTATE) {
            lightAround(y, x, Block.ORIGSTATE, config);
        }
    
        if (theBlock.getState() !== Block.REVEALEDSTATE) {
            if (mouseButton === LEFT) {
            // first click stuff
            // println(config.clickCount);
            if (config.clickCount === 0) {
                config.startTime = hour() * 3600 + minute() * 60 + second();
                while (config.blocks[y][x].getNumber() !== 0) {
                reGenBlocks( config);
                // println(config.blocks[y][x].getNumber());
                }
            }
            theBlock = config.blocks[y][x];
            config.clickCount++;
            activateBlock(y, x, config);
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
        updateRemainingBlocks( config);
        if (config.blockCount === config.boardSize.rows * config.boardSize.columns - config.numMine) {
            config.soundFiles.yes.play();
            config.gameStage = 3;
            config.endTime = hour() * 3600 + minute() * 60 + second();
            config.bestTimes = await fetchBestTime( config);
            console.log(config.bestTimes.bestGlobalTime, config.bestTimes.bestGlobalTime)
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
        drawAllMines( config);
        drawRestart( config);
        if (
            mouseX > width * 0.45 &&
            mouseX < width * 0.55 &&
            mouseY > height * 0.56 &&
            mouseY < height * 0.66
        ) {
            restart( config);
        }
        }
        if (config.gameStage === 3) {
        if (
            mouseX > width * 0.45 &&
            mouseX < width * 0.55 &&
            mouseY > height * 0.56 &&
            mouseY < height * 0.66
        ) {
            restart( config);
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


//let p5Canvas = new p5(s1);
//let p5Canvas1 = new p5(s1,'canvas1')
