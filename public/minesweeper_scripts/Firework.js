class Firework {
    constructor(rs, xs, ys, r, gr, b, sketch) {
      this.cenX = 400;
      this.cenY = 200;
      this.size = 30;
      this.angle = 0;
      this.rSpeed = rs;
      this.xSpeed = xs;
      this.ySpeed = ys;
      this.gravity = -0.44;
      this.col = sketch.color(r, gr, b);
      this.sketch = sketch
    }
  
    drawIt() {
      let halfH = this.size / 2;
      let halfW = this.size / 5;
      const PI = Math.PI
      this.sketch.noStroke();
      this.sketch.fill(this.col);
      this.sketch.quad(
        this.cenX - halfH * Math.sin(this.angle), this.cenY + halfH * Math.cos(this.angle),
        this.cenX - halfW * Math.cos(this.angle), this.cenY - halfW * Math.sin(this.angle),
        this.cenX + halfH * Math.sin(this.angle), this.cenY - halfH * Math.cos(this.angle),
        this.cenX + halfW * Math.cos(this.angle), this.cenY + halfW * Math.sin(this.angle)
      );
      this.sketch.quad(
        this.cenX - halfH * Math.sin(this.angle + PI / 3), this.cenY + halfH * Math.cos(this.angle + PI / 3),
        this.cenX - halfW * Math.cos(this.angle + PI / 3), this.cenY - halfW * Math.sin(this.angle + PI / 3),
        this.cenX + halfH * Math.sin(this.angle + PI / 3), this.cenY - halfH * Math.cos(this.angle + PI / 3),
        this.cenX + halfW * Math.cos(this.angle + PI / 3), this.cenY + halfW * Math.sin(this.angle + PI / 3)
      );
      this.sketch.quad(
        this.cenX - halfH * Math.sin(this.angle + (2 * PI) / 3), this.cenY + halfH * Math.cos(this.angle + (2 * PI) / 3),
        this.cenX - halfW * Math.cos(this.angle + (2 * PI) / 3), this.cenY - halfW * Math.sin(this.angle + (2 * PI) / 3),
        this.cenX + halfH * Math.sin(this.angle + (2 * PI) / 3), this.cenY - halfH * Math.cos(this.angle + (2 * PI) / 3),
        this.cenX + halfW * Math.cos(this.angle + (2 * PI) / 3), this.cenY + halfW * Math.sin(this.angle + (2 * PI) / 3)
      );
      this.cenX += this.xSpeed;
      this.cenY += this.ySpeed;
      this.ySpeed -= this.gravity;
      this.angle += this.rSpeed;
    }
  
    inBound() {
      if (this.cenY > this.sketch.height || this.cenX < 0 || this.cenX > this.sketch.width) return false;
      return true;
    }
  }
  