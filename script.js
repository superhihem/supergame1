"use strict"

let p, bullets = new Array(), blocks = new Array(), bonuses = new Array(), enemys = new Array()
let mouse = new Vec(0, 0)
let ammo1 = 150
let ammo2 = 20
let kills = 0
let score = 0

let bns_timer = 0
let timer_c = 0
let enemys_timer = 0
let timer = setInterval(function(){
    timer_c+=0.01
    if(timer_c.toFixed(2)%2==0){
        score++
    }
}, 10)
let shots = 0

window.onload = function(){
    init()
    upd()
}

function init(){
    bullets = new Array(), blocks = new Array(), bonuses = new Array(), enemys = new Array()
    mouse = new Vec(0, 0)
    ammo1 = 150
    ammo2 = 20
    bns_timer = 0
    timer_c = 0
    kills = 0
    enemys_timer = 0
    score = 0
    shots = 0

    p = new Player({
        x : 100,
        y : 100,
        h : 70,
        w : 30,
        border : "white"
    })
 
    blocks.push(new Block({
     x : 150,
     y : 400,
     w : 200,
     h : 20,
     border : "lime"
 }))
 
 for(let i = 0; i < 7 ; i++){
     let w = Math.random() * (200-60) + 60
     blocks.push(new Block({
         x : Math.random() * 800-w,
         y : Math.random() * 800-20,
         w : w,
         h : 20,
         border : "lime"
     }))
 }
 
    bonuses.push(new Bonus({
        type : Math.floor(Math.random()*3)
    }))
 
}


function kill(){
    console.log("time: " + timer_c.toFixed(2))
    init()
}

function upd()
{   
    if(p.hp<=0){
        console.log("time: " + timer_c.toFixed(2))
        console.log("kills: " + kills.toFixed(2))
        console.log("score: " + score.toFixed(2))
        init()
    }

    clearCnv()
    bns_timer+=Math.random()+1
    if(bns_timer>=600){
        bonuses.push(new Bonus({
            type : Math.floor(Math.random()*3)
        }))
        bns_timer = 0
    }


    enemys_timer+=Math.random()*2+timer_c/60
    if(enemys_timer>=700){
        let bb = Math.random()*70+30
        let xx = p.position.x>400? -bb : 800+bb
        let yy = Math.random()*600+100

        enemys.push(new Enemy({
            h : bb,
            w : bb,
            hp : Math.floor(bb),
            x : xx,
            y : yy,
            r : bb
        }))

        enemys_timer = 0
    }


    //bullets
    for(let i = 0; i < bullets.length; i++){
        if(bullets[i].hp<1){
            bullets.splice(i, 1)
            continue
        }
        for(let j = 0; j < blocks.length; j++){
            bullets[i].coll(blocks[j])
        }
        
        bullets[i].upd()
        bullets[i].draw()
    }

    p.upd()

    //blocks
    for(let i = 0; i < blocks.length; i++){
        blocks[i].position.y+=2
        if(blocks[i].position.y>=800){
            blocks[i].w = Math.random()*140+60
            blocks[i].position.y = 0 - blocks[i].h
            blocks[i].position.x = Math.random() * (800-blocks[i].w)
        }
        blocks[i].draw()
        if(p.coll(blocks[i])){
            blocks[i].color = "lime"
        }else{
            blocks[i].color = "black"
        }
    }

    //bonuses
    for(let i = 0; i < bonuses.length; i++){
        if(p.coll_bns(bonuses[i])){
            bonuses.splice(i, 1)
            continue
        }
        bonuses[i].position.y++
        bonuses[i].draw()
    }

    //enemies
    for(let i = 0; i < enemys.length; i++){
        if(enemys[i].coll(p)){
            if(p.shield<=0){
                p.hp-=enemys[i].hp-15
            }else{
                p.shield-=enemys[i].hp-15
            }

            p.position.add(new Vec(-(enemys[i].get_center().x-p.get_center().x)/enemys[i].hp*10, -(enemys[i].get_center().y-p.get_center().y)/enemys[i].hp*10))
            oof()
            enemys.splice(i, 1)
            score += 10
            continue
        }

        for(let j = 0; j < bullets.length; j++){
            if(enemys[i].coll(bullets[j])){
                enemys[i].hp-=p.gun==1?2:5
                enemys[i].color = "red"
                bullets.splice(j, 1)
            }else{
                enemys[i].color = "black"
            }
        }
        if(enemys[i].hp<=15){
            enemys.splice(i, 1)
            score += 20
            kills++
            continue
        }
        enemys[i].upd(p)
        enemys[i].draw()
    }


    //hz tolko tut rabotaet
    p.iscoll = false

    //info
    p.draw()
    ctx.textAlign = "center"
    ctx.font = "15px Arial"
    ctx.fillStyle = "yellow"
    ctx.fillText(p.gun == 1? p.ammo1 : p.ammo2, 50, 50)
    ctx.fillStyle = "lime"
    ctx.fillText(p.hp, 100, 50)
    if(p.shield>0){
        ctx.fillStyle = "blue"
        ctx.fillText(p.shield, 150, 50)
    }
    
    ctx.fillStyle = "white"
    ctx.fillText(timer_c.toFixed(2),50, 30)
    ctx.textAlign = "right"
    ctx.fillText("score: " + score, 750, 50)
    ctx.fillText("kills: " + kills, 750, 70)

    //guns
    p.gun_upd(mouse.x, mouse.y)


    if(p.gun == 1 && p.ammo1 > 0){
        if(p.shooting && shots>0){
            shots--;
        }

        if(shots==0 && p.shooting){
            add_machinegun_bullets() 
            shots = 3 
        }
    }   

    if(p.gun == 2 && p.ammo2>0){
        if(shots>0)shots--
    }
    


    requestAnimationFrame(upd)
}

document.getElementById("cnv").addEventListener("mousemove", e => {
    mouse.x = e.offsetX
    mouse.y = e.offsetY
})

document.getElementById("cnv").addEventListener("click", click)

document.getElementById("cnv").addEventListener("mousedown", mousedown)

document.getElementById("cnv").addEventListener("mouseup", mouseup)


addEventListener("keydown", keydown)
addEventListener("keyup", keyup)


function keydown(e){
    if(e.code == "KeyW" && !e.repeat && !p.jump){
        p.v.add(new Vec(0 ,-20))
        p.jump = true
    }

    if(e.code == "KeyD"){
        if(!e.repeat){
            p.v.add(new Vec(7, 0))
            btns.d = true
        }
    }

    if(e.code == "KeyA"){
        if(!e.repeat){
            p.v.add(new Vec(-7, 0))
            btns.a = true
        }
    }

    if(e.code == "KeyQ"){
        if(p.gun == 1){
            p.gun = 2
            //shots = 30
        }else{
            p.gun = 1
            //shots = 5
        }
    }
}

function keyup(e) {
    if(e.code == "KeyD" && btns.d){
        p.v.add(new Vec(-7, 0))
        btns.d = false
    }

    if(e.code == "KeyA" && btns.a){
        p.v.add(new Vec(7, 0))
        btns.a = false
    }

}


function click(e) {
    switch(p.gun){
        case 1:

            break;
        case 2:
            if(shots == 0){
                add_shotgun_bullets()
                shots = 30
            }
            break;
    }
   
}

function mousedown(e) {
    p.shooting = true
}

function mouseup(e) {
    p.shooting = false
    p.shoot = 5
}

function add_shotgun_bullets(){
    let vv = new Vec(((p.gun_point.x-p.get_center().x)/3), ((p.gun_point.y-p.get_center().y + 10)/3))
    bullets.push(new Bullet(p.gun_point.x, p.gun_point.y, vv))
    bullets.push(new Bullet(p.gun_point.x, p.gun_point.y, vv.rotate(0, 0, Math.PI/50)))
    bullets.push(new Bullet(p.gun_point.x, p.gun_point.y, vv.rotate(0, 0, -Math.PI/25)))

    p.ammo2--
}

function add_machinegun_bullets(){
    let vv = new Vec(((p.gun_point.x-p.get_center().x)/3), ((p.gun_point.y-p.get_center().y + 10)/3))

    vv.rotate(0,0,Math.random() * (Math.PI/100 + Math.PI/50) - Math.PI/50)
    bullets.push(new Bullet(p.gun_point.x, p.gun_point.y, vv))
    p.ammo1--
}