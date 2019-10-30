"use strict"

const ctx = document.getElementById("cnv").getContext("2d");
const H = document.getElementById("cnv").height
const W = document.getElementById("cnv").width

document.getElementById("cnv").oncontextmenu = function(){
    return false
}

let btns = {
    a : false,
    d : false
}


class Vec{
    constructor(x, y){
        this.x = x
        this.y = y
    }

    add(v){
        this.x += v.x
        this.y += v.y
    }

    rotate(x, y, a){
        this.x -= x
        this.y -= y
        let s = Math.sin(a)
        let c = Math.cos(a)
        let nx = (this.x * c) - (this.y * s)
        let ny = (this.x * s) + (this.y * c)
        this.x = nx + x
        this.y = ny + y
        return this
    }
}

let gravity = new Vec(0, 0.6)


class Block{
    constructor(args){
        this.position = args.position || new Vec(args.x, args.y) || new Vec(0, 0)
        this.h = args.h
        this.w = args.w
        this.color = args.color
        this.border = args.border
        this.v = args.v || new Vec(0, 0)
        this.a = args.a || new Vec(0, 0)
    }

    draw(){
        ctx.beginPath()
        ctx.rect(this.position.x, this.position.y, this.w, this.h)

        if(this.color){
            ctx.fillStyle = this.color
            ctx.fill()
        }

        if(this.border) {
            ctx.strokeStyle = this.border
            ctx.stroke()
        }

        ctx.closePath()
    }

    get_center(){
        return new Vec(this.position.x + this.w/2,this.position.y + this.h/2)
    }

    coll(block){
        if(this.position.x+this.w>=block.position.x&&
            this.position.x<=block.position.x+block.w&&
            this.position.y+this.h>=block.position.y&&
            this.position.y<=block.position.y+block.h){
                return true
            }

        else{
            return false
        }
    }
}


class Player extends Block{
    constructor(args){
        super(args)
        this.gun_point = new Vec(0, 0)
        this.angle = 0
        this.jump = false
        this.shooting = false
        this.shoot = 10
        this.gun = 2
        this.xend = 800
        this.xbegin = 0
        this.yend = 800
        this.ybegin = 0
        this.hp = 100
        this.ammo1 = 150
        this.ammo2 = 30
        this.shield = 0

        this.iscoll = false;
    }

    upd(){
        this.v.add(gravity)
        this.v.add(this.a)
        this.position.add(this.v)

        if(this.position.y > this.yend - this.h){
            this.position.y = this.yend-this.h
            this.v.y*=-0.3
            this.jump = false
        }

        if(this.position.x > this.xend - this.w){
            this.position.x = this.xend-this.w
            this.jump = false
        }

        if(this.position.y < this.ybegin){
            this.position.y = this.ybegin
            this.v.y = 0
        }

        if(this.position.x < this.xbegin){
            this.position.x = this.xbegin
            this.jump = false
        }

        if(this.position.y>H-this.h-1){
            this.shield<=0?this.hp -= 20:this.shield-=20;
            this.v.y = -10
            ctx.closePath()
            oof()
        }
    }

    draw(){
        super.draw()
        ctx.beginPath()
        ctx.moveTo(this.get_center().x, this.get_center().y - 10)
        this.gun_point = this.get_center()
        this.gun_point.x += 30
        this.gun_point.y -= 10
        this.gun_point.rotate(this.get_center().x, this.get_center().y - 10, this.angle)
        ctx.lineTo(this.gun_point.x, this.gun_point.y)
        ctx.lineWidth = 10
        ctx.stroke()
        ctx.closePath()
        ctx.lineWidth = 1
        if(this.shield>0){
            ctx.beginPath()
            ctx.arc(this.get_center().x, this.get_center().y, 50, 0, Math.PI*2)
            ctx.strokeStyle = "blue"
            ctx.stroke()
            ctx.closePath()
        }
    }

    gun_upd(x, y){
        this.angle = get_angle(this.get_center().x, this.get_center().y - 10, x, y)
    }

    coll(block){
        if(super.coll(block)){
                this.iscoll = true

                if(this.position.x <block.position.x+block.w - 10&
                    this.position.x+this.w >block.position.x + 10){
                        if(this.get_center().y<block.get_center().y){
                            this.yend = block.position.y
                            this.jump = false
                            console.log(true)
                        }else{
                            this.ybegin = block.position.y + block.h + 5
                            console.log(true)
                        }
                }
                else{
                    if(this.get_center().x>block.get_center().x){
                        this.xbegin = block.position.x+block.w - 1
                    }else{
                        this.xend = block.position.x + 1
                    }
            }

            return true
        }
            
            if(!this.iscoll){   
                    this.yend = H
                    this.ybegin = 0
                    this.xend = W
                    this.xbegin = 0
                    this.iscoll = true
                    return false
            }
    }

    coll_bns(block){
        if(super.coll(block)){

                switch(block.type){
                    case 0:
                        this.hp+=50
                        break;
                    case 1:
                        this.gun == 1? this.ammo1+=75 : this.ammo2+= 20;
                        break;
                    case 2:
                        this.shield = 150
                        break;
                }
                return true
            }
            else{
                return false
            }
    }

}

class Bullet extends Block{
    constructor(x, y, vec){
        super({
            color : "yellow"
        })
        this.v = new Vec(vec.x, vec.y)
        this.hp = 2
        this.position = new Vec(x, y)
        this.w = 4
        this.h = 4
    }

    upd(){
        this.position.add(this.v)
        if(this.position.x>W){
            this.position.x=W
            this.v.x*=-1
            this.hp--
        }

        if(this.position.x<0){
            this.position.x=0
            this.v.x*=-1
            this.hp--
        }
    }

    coll(block){
        if(super.coll(block)){

            if(this.position.x<block.position.x+block.w + this.v.x&&
                this.position.x+this.w>block.position.x + this.v.x){
                    if(this.position.y>block.get_center().y){
                        this.position.y = block.position.y+block.h-this.v.y
                    }else{
                        this.position.y = block.position.y-this.v.y
                    }
                    this.v.y*=-1
            }else{
                if(this.position.x>block.get_center().x){
                    this.position.x = block.position.x+block.w-this.v.x
                }else{
                    this.position.x = block.position.x-this.v.x
                }
                this.v.x*=-1
            }
        }
    }

    draw(){
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI*2)
        ctx.fill()
        ctx.closePath()
    }
}

class Bonus extends Block{
    constructor(args){
        super(args)

        this.position = new Vec(Math.random() * W, -15)
        this.type = args.type
        switch(this.type){
            case 0:
                this.color = "lime"
                break;
            case 1:
                this.color = "yellow"
                break;
            case 2:
                this.color = "blue"
                break;
        }
        this.w = 15
        this.h = 15
    }

    draw(){
        super.draw()
    }
}


class Enemy extends Block{
    constructor(args){
        super(args)
        this.border = "red"
        this.color = "black"
        this.hp = args.hp
        this.h = this.hp
        this.w = this.hp
    }

    upd(p){
        let v = new Vec(-(this.get_center().x-p.get_center().x)/this.hp*1.5, -(this.get_center().y-p.get_center().y)/this.hp*2)
        this.position.add(v)
    }

    draw(){
        this.h = this.hp
        this.w = this.hp
        super.draw()
        ctx.beginPath()
        ctx.fillStyle = this.color == "black" ? "red" : "black";
        ctx.textAlign = "center"
        ctx.font = "bold 25px Arial"
        ctx.fillText(this.hp-15, this.get_center().x, this.get_center().y+10)
        ctx.closePath()
    }
}




function clearCnv(){
    ctx.beginPath()
    ctx.fillStyle = "rgba(0,0,0,0.65)"
    ctx.fillRect(0,0,W,H)
    ctx.closePath()
}


function get_angle(x1,y1,x2,y2) {
    let g = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
    let b = x2-x1
    let cosa = b/g

    return y2<y1? -Math.acos(cosa) : -(Math.acos(-cosa)+Math.PI)
}


function oof() {
    ctx.beginPath()
    let grd = ctx.createRadialGradient(H/2,W/2,300,W/2,H/2,600)
    grd.addColorStop(0, "black")
    grd.addColorStop(1, "red")
    ctx.fillStyle = grd
    ctx.fillRect(0,0,W,H)
}
