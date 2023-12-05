const ORIGSTATE = 0;
const FLAGSTATE = 1;
const REVEALEDSTATE = 2;
const LIGHTEDSTATE = 3;

class Block {
    constructor(x, y, l, sketch) {
      this.posX = x * l;
      this.posY = y * l;
      this.sideL = l;
      this.colorCode = (x+y)%2 == 0 ? true : false;
      this.sketch = sketch
      
      this.state = ORIGSTATE; // 0-orig; 1-flag; 2-revealed(num/bomb)
      
      this.col = sketch.color(0, 255, 0);
      this.green = sketch.color(0, 255, 0);
      this.darkGreen = sketch.color(0, 230, 50);
      this.grey = sketch.color(140);
      this.red = sketch.color(255, 0, 0);
      this.white = sketch.color(255)
      this.number = 0; // surrounding mines(0-empty, -1-mine)
      this.f = "Arial";
      this.fSize = 16;
    }

    static get ORIGSTATE(){
        return ORIGSTATE;
    }

    static get FLAGSTATE(){
        return FLAGSTATE;
    }

    static get REVEALEDSTATE(){
        return REVEALEDSTATE;
    }

    static get LIGHTEDSTATE(){
      return LIGHTEDSTATE;
  }
  
    drawIt() {
      this.sketch.noStroke();
      switch (this.state) {
        case ORIGSTATE:
          if (this.colorCode) this.col = this.green;
          else this.col = this.darkGreen;
          this.sketch.fill(this.col);
          this.sketch.rect(this.posX, this.posY, this.sideL, this.sideL);
          break;
        case FLAGSTATE:
          if (this.colorCode) this.col = this.green;
          else this.col = this.darkGreen;
          this.sketch.fill(this.col);
          this.sketch.rect(this.posX, this.posY, this.sideL, this.sideL);
          this.drawFlag();
          break;
        case REVEALEDSTATE:
          if (this.colorCode) this.col = this.white;
          else this.col = this.grey;

          this.sketch.fill(this.col);
          this.sketch.rect(this.posX, this.posY, this.sideL, this.sideL);
          if (this.number != -1) this.drawNumber();
          else {
            this.drawBomb();
          }
          break;
        case LIGHTEDSTATE:
          if (this.colorCode) this.col = this.sketch.color(100, 255, 100);
          else this.col = this.sketch.color(20, 245, 20);
          this.sketch.fill(this.col);
          this.sketch.rect(this.posX, this.posY, this.sideL, this.sideL);
          break;
      }
    }
  
    drawNumber() {
      if (this.number != 0) {
        this.sketch.textFont(this.f, this.fSize);
        this.sketch.fill(0);
        this.sketch.text(this.number, this.posX + this.sideL * 0.35, this.posY + this.sideL * 0.62);
      }
    }
  
    drawFlag() {
      this.sketch.fill(0);
      this.sketch.rect(this.posX + this.sideL / 3, this.posY + this.sideL / 6, 0.2, this.sideL * 2 / 3);
      this.sketch.fill(this.red);
      this.sketch.triangle(
        this.posX + this.sideL / 3, this.posY + this.sideL / 6,
        this.posX + this.sideL / 3, this.posY + this.sideL / 2,
        this.posX + this.sideL * 2 / 3, this.posY + this.sideL / 3
      );
    }
  
    drawBomb() {
      this.sketch.fill(this.sketch.color(0));
      this.sketch.circle(this.posX + this.sideL / 2, this.posY + this.sideL / 2, this.sideL * 0.4);
      this.sketch.line(this.posX + this.sideL * 0.6, this.posY + this.sideL / 3, this.posX + this.sideL * 0.8, this.posY + this.sideL / 8);
      this.drawSpark(this.posX + this.sideL * 0.8, this.posY + this.sideL / 8, this.sideL / 10);
    }
  
    drawSpark(cenX, cenY, size) {
      this.sketch.fill(this.red);
      this.sketch.triangle(cenX, cenY - size, cenX - 0.85 * size, cenY + 0.5 * size, cenX + 0.85 * size, cenY + 0.5 * size);
      this.sketch.triangle(cenX, cenY + size, cenX - 0.85 * size, cenY - 0.5 * size, cenX + 0.85 * size, cenY - 0.5 * size);
    }
    
    drawCross() {
      this.sketch.stroke(255);
      this.sketch.line(this.posX + this.sideL / 10, this.posY + this.sideL / 10, this.posX + this.sideL * 9 / 10, this.posY + this.sideL * 9 / 10);
      this.sketch.stroke(255);
      this.sketch.line(this.posX + this.sideL * 9 / 10, this.posY + this.sideL * 9 / 10, this.posX + this.sideL / 10, this.posY + this.sideL / 10);
    }
    
    /**
     * sets the state attribute as n
     * @param {integer} n the state being set to
     */
    setState(n) {
      this.state = n;
      this.drawIt();//updates appearance
    }
    
    /**
     * sets the color of the block as indicated by the (r,g,b) tuple
     * @param {integer} r red attribute of the color being set
     * @param {integer} g green attribute of the color being set
     * @param {integer} b blue attribute of the color being set
     */
    setColor(r, g, b) {
      this.col = this.sketch.color(r, g, b);
    }
    
    /**
     * sets the number attribute as n
     * @param {integer} n the number of surrounding mines 
     */
    setNumber(n) {
      this.number = n;
    }
    
    /**
     * get function that
     * @returns the current state of self
     */
    getState() {
      return this.state;
    }
    
    /**
     * get function that
     * @returns the number of surrounding mines of self
     */
    getNumber() {
      return this.number;
    }
}
  