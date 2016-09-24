/*******************/
/* constant number */
/*******************/
const NODE_NUM_X = 10;
const NODE_NUM_Y = 5;
const NODE_RADIUS = 15;
const LU_NODE_X = 50;
const LU_NODE_Y = 70;
const NODE_INTERVAL_X = 120;
const NODE_INTERVAL_Y = 120;
const LINE_LENGTH_X = NODE_INTERVAL_X - 2 * NODE_RADIUS;
const LINE_LENGTH_Y = NODE_INTERVAL_Y - 2 * NODE_RADIUS;
const COST_INFINITE = 1000000;

/*******************/
/* global valuable */
/*******************/
var nd_ary = new Array();

/********************/
/* class definition */
/********************/
function Vertex( idx, idy ){
	this.idx = idx;
	this.idy = idy;
	this.cost = COST_INFINITE;
	this.pred = null;
	this.done = false;
	this.rtpnt = 0;		/* 1: origin, 2: destination, 3: on-route */
};
Vertex.prototype.draw = function(){
	var cvs = document.getElementById( 'mycvs' );
	var ctx = cvs.getContext( '2d' );
	/* stroke */
	ctx.beginPath();
	if( this.done ){
		ctx.strokeStyle = "#FF0000";
	}else{
		ctx.strokeStyle = "#000000";
	}
	ctx.arc( LU_NODE_X + (this.idx*NODE_INTERVAL_X),
			 LU_NODE_Y + (this.idy*NODE_INTERVAL_Y),
			 NODE_RADIUS, 0, Math.PI*2, true );
	ctx.stroke();
	/* fill */
	ctx.beginPath();
	if( this.rtpnt == 1 ){
		ctx.fillStyle = "#FF0000";
	}else if( this.rtpnt == 2 ){
		ctx.fillStyle = "#000000";
	}else if( this.rtpnt == 3 ){
		ctx.fillStyle = "#0000FF";
	}else{
		ctx.fillStyle = "#FFFFFF";
	}
	ctx.arc( LU_NODE_X + (this.idx*NODE_INTERVAL_X),
			 LU_NODE_Y + (this.idy*NODE_INTERVAL_Y),
			 NODE_RADIUS, 0, Math.PI*2, true );
	ctx.fill();
}
Vertex.prototype.draw_cost = function(){
	var cvs = document.getElementById( 'mycvs' );
	var ctx = cvs.getContext( '2d' );
	
	var txtpos_x = LU_NODE_X + this.idx * NODE_INTERVAL_X + NODE_RADIUS;
	var txtpos_y = LU_NODE_Y + this.idy * NODE_INTERVAL_Y - NODE_RADIUS;
	ctx.font = "18px '‚l‚r ‚oƒSƒVƒbƒN'";
	ctx.fillStyle = "#0000FF";
	ctx.fillText( this.cost, txtpos_x, txtpos_y );
}

/***********/
/* on load */
/***********/
onload = function() {
	initialize();
}

/********************/
/* initialize graph */
/********************/
function initialize() {
	/* get context for canvas */
	var cvs = document.getElementById( 'mycvs' );
	var ctx = cvs.getContext( '2d' );

	/* draw vertex(node) */
	for( var i=0; i<NODE_NUM_Y; i++ ){
		for( var j=0; j<NODE_NUM_X; j++ ){
			var id = j+i*NODE_NUM_X;
			nd_ary[id] = new Vertex( j, i );
			nd_ary[id].draw();
		}
	}

	/* draw edge(link) and cost */
	/* x(horizontal)-direction */
	for( var i=0; i<NODE_NUM_Y; i++ ){
		for( var j=0; j<NODE_NUM_X-1; j++ ){
			var start_x = LU_NODE_X + NODE_RADIUS + j*NODE_INTERVAL_X;
			var start_y = LU_NODE_Y + i*NODE_INTERVAL_Y;
			var end_x = LU_NODE_X + NODE_INTERVAL_X - NODE_RADIUS + j*NODE_INTERVAL_X;
			var end_y = start_y;
			/* edge */
			ctx.beginPath();
			ctx.moveTo( start_x, start_y );
			ctx.lineTo( end_x, end_y );
			ctx.closePath();
			ctx.stroke();
			/* cost*/
			var txtpos_x = (start_x + end_x) / 2;
			var txtpos_y = start_y - 5;
			ctx.font = "18px '‚l‚r ‚oƒSƒVƒbƒN'";
			ctx.fillStyle = "#000000";
			var index = j + (i*2) * NODE_NUM_X;
			ctx.fillText( cost_tbl[index], txtpos_x, txtpos_y );
		}
	}
	/* y(vertical)-direction */
	for( var i=0; i<NODE_NUM_Y-1; i++ ){
		for( var j=0; j<NODE_NUM_X; j++ ){
			var start_x = LU_NODE_X + j*NODE_INTERVAL_X;
			var start_y = LU_NODE_Y + NODE_RADIUS + i*NODE_INTERVAL_Y;
			var end_x = start_x;
			var end_y = LU_NODE_Y + NODE_INTERVAL_Y - NODE_RADIUS + i*NODE_INTERVAL_Y;
			/* edge */
			ctx.beginPath();
			ctx.moveTo( start_x, start_y );
			ctx.lineTo( end_x, end_y );
			ctx.closePath();
			ctx.stroke();
			/* cost*/
			var txtpos_x = start_x + 5;
			var txtpos_y = (start_y + end_y) / 2;
			ctx.font = "18px '‚l‚r ‚oƒSƒVƒbƒN'";
			ctx.fillStyle = "#000000";
			var index = j + (i*2+1) * NODE_NUM_X;
			ctx.fillText( cost_tbl[index], txtpos_x, txtpos_y );
		}
	}
}

/************************/
/* START button clicked */
/************************/
function start_click(){
	/* TEMP: start from vertex[0] */
	nd_ary[0].cost = 0;
	nd_ary[0].rtpnt = 1;
	nd_ary[0].draw();
	/* TEMP: start from vertex[last] */
	nd_ary[NODE_NUM_X * NODE_NUM_Y - 1].rtpnt = 2;
	nd_ary[NODE_NUM_X * NODE_NUM_Y - 1].draw();

	/* dijkstra main process */
	dijkstra_main();
}

/************************/
/* RESET button clicked */
/************************/
function reset_click(){
	location.reload();
/*	
	var cvs = document.getElementById( 'mycvs' );
	var ctx = cvs.getContext( '2d' );
	ctx.clearRect( 0, 0, cvs.width, cvs.height );
	
	for( var i=0; i<NODE_NUM_Y; i++ ){
		for( var j=0; j<NODE_NUM_X; j++ ){
			nd_ary[j+i*NODE_NUM_X].cost = COST_INFINITE;
			nd_ary[j+i*NODE_NUM_X].pred = null;
			nd_ary[j+i*NODE_NUM_X].done = false;
			nd_ary[j+i*NODE_NUM_X].rtpnt = 0;
			nd_ary[j+i*NODE_NUM_X].draw();
		}
	}
	*/
}

/*************************/
/* dijkstra main process */
/*************************/
function dijkstra_main(){

	/* loop until dest-node is "done" */
	while( !(nd_ary[NODE_NUM_X * NODE_NUM_Y - 1].done) ){
		/* search minimum cost node  */
		var id = search_mincost_node();
		if( (id < 0) || (id > (NODE_NUM_X*NODE_NUM_Y-1)) ){
			alert("invalid id found!");
			return;
		}else{
			nd_ary[id].done = true;
			if( id == NODE_NUM_X * NODE_NUM_Y - 1 ){
				/* arrive at destination */
				break;
			}
		}
		
		var updcost, adjcost;
		var idx = nd_ary[id].idx;
		var idy = nd_ary[id].idy;
		/* update cost(right)  */
		if( id % NODE_NUM_X != (NODE_NUM_X - 1) ){
			if( !(nd_ary[id+1].done) ){
				updcost = nd_ary[id].cost + cost_tbl[idy*2*NODE_NUM_X+idx];
				adjcost = nd_ary[id+1].cost;
				if( adjcost > updcost ){
					nd_ary[id+1].cost = updcost;
					nd_ary[id+1].pred = id;
				}
			}
		}
		/* update cost(down)  */
		if( (id >= 0) && (id < (NODE_NUM_X*(NODE_NUM_Y-1))) ){
			if( !(nd_ary[id+NODE_NUM_X].done) ){
				updcost = nd_ary[id].cost + cost_tbl[(idy*2+1)*NODE_NUM_X+idx];
				adjcost = nd_ary[id+NODE_NUM_X].cost;
				if( adjcost > updcost ){
					nd_ary[id+NODE_NUM_X].cost = updcost;
					nd_ary[id+NODE_NUM_X].pred = id;
				}
			}
		}
		/* update cost(up)  */
		if( (id >= NODE_NUM_X) && (id < NODE_NUM_X*NODE_NUM_Y) ){
			if( !(nd_ary[id-NODE_NUM_X].done) ){
				updcost = nd_ary[id].cost + cost_tbl[(idy*2-1)*NODE_NUM_X+idx];
				adjcost = nd_ary[id-NODE_NUM_X].cost;
				if( adjcost > updcost ){
					nd_ary[id-NODE_NUM_X].cost = updcost;
					nd_ary[id-NODE_NUM_X].pred = id;
				}
			}
		}
		/* update cost(left)  */
		if( id % NODE_NUM_X != 0 ){
			if( !(nd_ary[id-1].done) ){
				updcost = nd_ary[id].cost + cost_tbl[idy*2*NODE_NUM_X+idx-1];
				adjcost = nd_ary[id-1].cost;
				if( adjcost > updcost ){
					nd_ary[id-1].cost = updcost;
					nd_ary[id-1].pred = id;
				}
			}
		}
	}
	
	/* draw shortest path */
	id = NODE_NUM_X * NODE_NUM_Y - 1;
	nd_ary[id].draw_cost();
	while( id != 0 ){
		var pred = nd_ary[id].pred;
		if( pred == null ){
			alert("invalid predecessor");
			return;
		}else if( pred == 0 ){
			break;
		}
		nd_ary[pred].rtpnt = 3;
		nd_ary[pred].draw();
		nd_ary[pred].draw_cost();
		id = pred;
	}
}

/*****************************/
/* search minimum cost node  */
/*****************************/
function search_mincost_node(){
	var min_id = NODE_NUM_X * NODE_NUM_Y;
	var min_cost = COST_INFINITE;
	
	for( var i=0; i<NODE_NUM_X*NODE_NUM_Y; i++ ){
		if( nd_ary[i].done ){
			continue;
		}
		if( min_cost > nd_ary[i].cost ){
			min_id = i;
			min_cost = nd_ary[i].cost;
		}
	}

	return( min_id );
}
