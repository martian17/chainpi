var dist = function(v1,v2){
    return Math.sqrt((v1.x-v2.x)**2+(v1.y-v2.y)**2);
};
var dist2 = function(v1,v2){
    return (v1.x-v2splitEdge.x)**2+(v1.y-v2.y)**2;
};

var Graph = function(){
    
    var edges = {};
    var verts = {};
    var repellers = {};
    var that = this;
    var G = 1;
    
    this.addRepeller = function(x,y,m){//m is the mass, newtonian gravity bebe
        var id = repellers.length;
        repellers[id] = {x,y,m,id};
        return repellers[id];
    };
    this.addVert = function(x,y,vx,vy,m){
        var id = verts.length;
        verts[id] = {x,y,vx,vy,m,edges:{},id};
        return verts[id];
    };
    this.addEdge = function(v1,v2,k,len){
        //k is the spring constant
        //len is the narutal length
        var id = edges.length;
        edges[id] = {v1,v2,k,len,id};
        return edges[id];
    };
    this.removeEdge = function(i){
        var e = edges[i];
        delete edges[i];
        //remove the reference from the verts as well
        var v1 = edge.v1;
        var v2 = edge.v2;
        delete v1.edges[i];
        delete v2.edges[i];
    };
    this.removeVert = function(j){
        var v = verts[j];
        for(var i in v.edges){
            that.removeEdge(i);
        }
        delete verts[j];
    };
    this.splitEdge = function(i){//i is the edge id
        var edge = edges[i];
        var v1 = edge.v1;
        var v2 = edge.v2;
        var x = (v1.x+v2.x)/2;
        var y = (v1.y+v2.y)/2;
        var vx = (v1.vx+v2.vx)/2;
        var vy = (v1.vy+v2.vy)/2;
        var m = (v1.m+v2.m)/2;
        var v3 = that.addVert(x,y,vx,vy,m);
        var len = edge.len/2;
        var k = edge.k*2;//twice as short, twice as hard
        that.addEdge(v1[id],v3[id],k,len);
        that.addEdge(v2[id],v3[id],k,len);
        that.removeEdge(i);
    };
    this.calcStep = function(dt){
        for(var i = 0; i < verts.length; i++){
            //apply accelerations
            var v = verts[i];
            var fx = 0;
            var fy = 0;
            var es = v.edges;
            for(var i in v.edges){
                var edge = edges[es[i]];
                var v1 = edge.v1 === v ? edge.v2 : edge.v1;//the opposing vertex
                var d = dist(v,v1);
                var f = (d-edge.len)*k;//spring force
                fx += f*d/(v.x-v1.x);
                fy += f*d/(v.y-v1.y);
            }
            for(var i in repellers){
                var rep = repellers[i];
                var d2 = dist2(rep,v1);
                var f = G*rep.m*v.m/d2;
                var d = Math.sqrt(d2);
                fx += f*d/(v.x-v1.x);
                fy += f*d/(v.y-v1.y);
            }
            var ax = fx/v1.m;
            var ay = fy/v1.m;
            v1.vx += ax*dt;
            v1.vy += ay*dt;
            v1.vx *= 0.99;
            v1.vy *= 0.99;//dumpening
            v1.x += v1.vx*dt;
            v1.y += v1.vy*dt;
        }
    };
    
    this.edges = edges;
    this.verts = verts;
    this.repellers = repellers;
};

var graph = new Graph();
var v1 = graph.addVert(0,-200,0,0,1);
var v2 = graph.addVert(-170,100,0,0,1);
var v3 = graph.addVert(170,100,0,0,1);
var e1 = graph.addEdge(v1,v2,1,340);
var e2 = graph.addEdge(v2,v3,1,340);
var e3 = graph.addEdge(v3,v1,1,340);
var center = graph.addRepeller(0,0,-1);//-1 because negative attraction

var canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 600;
canvas.style.backgroundColor = "#002";
var ctx = canvas.getContext("2d");

var draw = function(){
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,width,height);
    var verts = graph.verts;
    var edges = graph.edges;
    for(var i in verts){
        var v = verts[i];
        ctx.beginPath();
        ctx.arc(v.x+300,v.y+300,3,0,6.28);
        ctx.closePath();
        ctx.fillStyle = "#002";
        ctx.fill();
    }
    for(var i in edges){
        var e = edges[i];
        var x0 = e.v1.x;
        var y0 = e.v1.y;
        var x1 = e.v2.x;
        var y1 = e.v2.y;
        ctx.beginPath();
        ctx.moveTo(x0+300,y0+300);
        ctx.lineTo(x1+300,y1+300);
        ctx.strokeStyle = "#002";
        ctx.stroke();
    }
};



var start = 0;
var animate = function(t){
    if(start === 0)start = 0;
    var dt = t - start;
    start = t;
    graph.calcStep(dt);
    draw();
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);