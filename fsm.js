var fsm = function(){
    var svg = document.getElementById("svg");
    var body = document.querySelector("body");
    var transitions = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
    var states = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));

    var makeTransition = function(c1, c2) {
	var newT = document.createElementNS("http://www.w3.org/2000/svg","path");
	var id1 = c1.getAttribute("stateID");
	var id2 = c2.getAttribute("stateID");
	var x1 = parseInt(c1.getAttribute("cx"));
	var x2 = parseInt(c2.getAttribute("cx"));
	var y1 = parseInt(c1.getAttribute("cy"));
	var y2 = parseInt(c2.getAttribute("cy"));
	var tgroup = document.querySelector("g[ids='"+Math.min(id1,id2)+" "+Math.max(id1,id2)+"']");
	if(tgroup == null) {
	    tgroup = transitions.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
	    tgroup.setAttribute("ids",Math.min(id1,id2)+" "+Math.max(id1,id2));
	}
	var n = tgroup.childNodes.length;
	newT.setAttribute("d", "M"+x1+" "+y1+" C"+x1+" "+(y1 + Math.floor((n+1)/2)*Math.pow(-1,n)*50)+" "+x2+" "+(y2 + Math.floor((n+1)/2)*Math.pow(-1,n)*50)+" "+x2+" "+y2);
	newT.setAttribute("stroke","black");
	newT.setAttribute("fill","none");
	tgroup.appendChild(newT);
	return newT;
    };
	
    var makeState = function(x, y, r) {
	var newCirc = document.createElementNS("http://www.w3.org/2000/svg","circle");
	newCirc.setAttribute("cx", x);
	newCirc.setAttribute("cy", y);
	newCirc.setAttribute("r", r);
	newCirc.setAttribute("stateID", states.childNodes.length);
	newCirc.setAttribute("fill","white");
	newCirc.setAttribute("stroke","black");
	states.appendChild(newCirc);
	    return newCirc;
    };
    
    return function(){
	var state1 = makeState(50,50,10);
	var state2 = makeState(100,100,10);
	var t1 = makeTransition(state1, state2);
	var t2 = makeTransition(state1, state2);
	var t3 = makeTransition(state1, state2);
    }
}()()
