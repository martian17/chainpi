var dist = function(v1,v2){
    return Math.sqrt((v1.x-v2.x)**2+(v1.y-v2.y)**2);
};
var dist2 = function(v1,v2){
    return (v1.x-v2.x)**2+(v1.y-v2.y)**2;
};

var Graph = function(){
    
    var edges = {};
    var verts = {};
    var repellers = {};
    var that = this;
    var G = 1;
    
    var IDD = 0;
    var genId = function(){
        return IDD++;
    };
    
    this.addRepeller = function(x,y,m){//m is the mass, newtonian gravity bebe
        var id = genId();
        repellers[id] = {x,y,m,id};
        return repellers[id];
    };
    this.addVert = function(x,y,vx,vy,m){
        var id = genId();
        verts[id] = {x,y,vx,vy,m,edges:{},id};
        return verts[id];
    };
    this.addEdge = function(v1,v2,k,len){
        //k is the spring constant
        //len is the narutal length
        var id = genId();
        edges[id] = {v1,v2,k,len,id};
        v1.edges[id] = edges[id];
        v2.edges[id] = edges[id];
        return edges[id];
    };
    this.removeEdge = function(edge){
        var i = edge.id;
        delete edges[i];
        //remove the reference from the verts as well
        var v1 = edge.v1;
        var v2 = edge.v2;
        delete v1.edges[i];
        delete v2.edges[i];
    };
    this.removeVert = function(vert){
        var j = vert[id];
        for(var i in vert.edges){
            that.removeEdge(vert.edges[i]);
        }
        delete verts[j];
    };
    this.splitEdge = function(edge){
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
        that.addEdge(v1,v3,k,len);
        that.addEdge(v2,v3,k,len);
        that.removeEdge(edge);
    };
    this.calcStep = function(dt){
        for(var i in verts){
            //apply accelerations
            var v1 = verts[i];
            var fx = 0;
            var fy = 0;
            for(var j in v1.edges){
                var edge = edges[j];
                var v2 = edge.v1 === v1 ? edge.v2 : edge.v1;//the opposing vertex
                var d = dist(v1,v2);
                var f = (d-edge.len)*edge.k;//spring force
                fx += f*(v2.x-v1.x)/d;
                fy += f*(v2.y-v1.y)/d;
                //isHalt = true;
            }
            for(var j in repellers){
                var rep = repellers[j];
                var d2 = dist2(rep,v1);
                var f = G*rep.m*v1.m/d2;
                var d = Math.sqrt(d2);
                //console.log(f,fx,fy);
                fx += f*(rep.x-v1.x)/d;
                fy += f*(rep.y-v1.y)/d;
                //isHalt = true;
            }
            var ax = fx/v1.m;
            var ay = fy/v1.m;
            v1.vx += ax*dt;
            v1.vy += ay*dt;
            v1.vx *= 0.5**dt;
            v1.vy *= 0.5**dt;//dumpening
            //console.log("v end");
        }
        for(var i in verts){
            var v1 = verts[i];
            v1.x += v1.vx*dt;
            v1.y += v1.vy*dt;
        }
    };
    
    this.edges = edges;
    this.verts = verts;
    this.repellers = repellers;
};

var isHalt = false;


var graph = new Graph();
var v1 = graph.addVert(0,-200,0,0,1);
var v2 = graph.addVert(-170,100,0,0,1);
var v3 = graph.addVert(170,100,0,0,1);
var e1 = graph.addEdge(v1,v2,100,340);
var e2 = graph.addEdge(v2,v3,100,340);
var e3 = graph.addEdge(v3,v1,100,340);
var center = graph.addRepeller(0,0,-10000000);//-1 because negative attraction

var verts = graph.verts;
var edges = graph.edges;

var canvas = document.getElementById("canvas");
width = 600;
height = 600;
canvas.width = width;
canvas.height = height;
//canvas.style.backgroundColor = "#002";
var ctx = canvas.getContext("2d");

var draw = function(){
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,width,height);
    
    ctx.fillStyle = "#002";
    ctx.strokeStyle = "#002";
    for(var i in verts){
        var v = verts[i];
        ctx.beginPath();
        ctx.arc(v.x+300,v.y+300,3,0,6.28);
        ctx.closePath();
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
        ctx.stroke();
    }
};

var getOtherVertex = function(v,e){
    return e.v1 === v ? e.v2 : e.v1;
};
var fromo = function(o){//returns the first index of object
    for(var i in o){
        return o[i];
    }
};
var getNextVertexInSequence = function(v1,v2){
    var edge;//first get the edge in v2 that doesn't contain v1
    for(var i in v2.edges){
        edge = v2.edges[i];
        if(!(edge.v1 === v1 || edge.v2 === v1)){
            break;
        }
    }
    return getOtherVertex(v2,edge);//then in that edge get the vertex that's not v2
};
var getListFromGraph = function(graph){
    var verts = graph.verts;
    var edges = graph.edges;
    var v0 = fromo(verts);
    var v1 = v0;
    var v2 = getOtherVertex(v1,fromo(v1.edges));
    var vlist = [v1,v2];
    //goes through the chain
    var cnt = 0;
    while(true){
        cnt++;
        var v3 = getNextVertexInSequence(v1,v2);
        if(v3 === v0){
            vlist.push(v3);
            return vlist;
        }else{
            vlist.push(v3);
            v1 = v2;
            v2 = v3;
        }
    }
};

var n = 3;

var calcpi = function(){
    var list = getListFromGraph(graph);
    var perimeter = 0;
    var len = list.length-1;//because it loops  and includes the origina twice
    for(var i = 0; i < len; i++){
        var v1 = list[i];
        var v2 = list[i+1];
        var d = dist(v1,v2);
        perimeter += d;
    }
    var diameters = 0;
    var half = Math.floor(len/2);
    for(var i = 0; i < half; i++){
        var v1 = list[i];
        var v2 = list[i+half];
        var d = dist(v1,v2);
        diameters += d;
    }
    var diameter = diameters/half;
    var pi = perimeter/diameter;
    return pi;
};

var start = 0;
var animate = function(t){
    if(start === 0)start = 0;
    var dt = t - start;
    start = t;
    for(var i = 0; i < 10; i++){
        graph.calcStep(dt/1000/10);
    }
    draw();
    if(isHalt)return false;
    var pi = calcpi();
    //console.log(pi);
    ctx.font="20px Arial";
    ctx.fillText("PI="+pi,20,20);
    requestAnimationFrame(animate);
};
requestAnimationFrame(animate);

var cnt = 0;
var splitFunc = function(){
    var es = [];
    for(var i in edges){
        var edge = edges[i];
        es.push(edge);
    }
    for(var i = 0; i < es.length; i++){
        var edge = es[i];
        graph.splitEdge(edge);
    }
    cnt++;
    n *= 2;
    if(cnt < 6)setTimeout(splitFunc,2000);
};
setTimeout(splitFunc,2000);