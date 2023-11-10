class Firework {
    constructor(rs, xs, ys, r, gr, b) {
      this.cenX = 400;
      this.cenY = 200;
      this.size = 30;
      this.angle = 0;
      this.rSpeed = rs;
      this.xSpeed = xs;
      this.ySpeed = ys;
      this.gravity = -0.44;
      this.col = color(r, gr, b);
    }
  
    drawIt() {
      let halfH = this.size / 2;
      let halfW = this.size / 5;
      noStroke();
      fill(this.col);
      quad(
        this.cenX - halfH * sin(this.angle), this.cenY + halfH * cos(this.angle),
        this.cenX - halfW * cos(this.angle), this.cenY - halfW * sin(this.angle),
        this.cenX + halfH * sin(this.angle), this.cenY - halfH * cos(this.angle),
        this.cenX + halfW * cos(this.angle), this.cenY + halfW * sin(this.angle)
      );
      quad(
        this.cenX - halfH * sin(this.angle + PI / 3), this.cenY + halfH * cos(this.angle + PI / 3),
        this.cenX - halfW * cos(this.angle + PI / 3), this.cenY - halfW * sin(this.angle + PI / 3),
        this.cenX + halfH * sin(this.angle + PI / 3), this.cenY - halfH * cos(this.angle + PI / 3),
        this.cenX + halfW * cos(this.angle + PI / 3), this.cenY + halfW * sin(this.angle + PI / 3)
      );
      quad(
        this.cenX - halfH * sin(this.angle + (2 * PI) / 3), this.cenY + halfH * cos(this.angle + (2 * PI) / 3),
        this.cenX - halfW * cos(this.angle + (2 * PI) / 3), this.cenY - halfW * sin(this.angle + (2 * PI) / 3),
        this.cenX + halfH * sin(this.angle + (2 * PI) / 3), this.cenY - halfH * cos(this.angle + (2 * PI) / 3),
        this.cenX + halfW * cos(this.angle + (2 * PI) / 3), this.cenY + halfW * sin(this.angle + (2 * PI) / 3)
      );
      this.cenX += this.xSpeed;
      this.cenY += this.ySpeed;
      this.ySpeed -= this.gravity;
      this.angle += this.rSpeed;
    }
  
    inBound() {
      if (this.cenY > height || this.cenX < 0 || this.cenX > width) return false;
      return true;
    }
  }
  