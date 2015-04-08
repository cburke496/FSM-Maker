var fsm = function(){
    var stateRad = 10;

    var svg = document.querySelector("svg");
    var body = document.querySelector("body");
    var sButton = document.querySelector("#newStates");
    var tButton = document.querySelector("#newTransitions");
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
	var theta = Math.atan((y2 - y1)/(x2 - x1));
	var tgroup = document.querySelector("g[ids='"+Math.min(id1,id2)+" "+Math.max(id1,id2)+"']");
	if(tgroup == null) {
	    tgroup = transitions.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
	    tgroup.setAttribute("ids",Math.min(id1,id2)+" "+Math.max(id1,id2));
	}
	var n = tgroup.childNodes.length;
	var controlDist = Math.floor((n+1)/2)*30*Math.pow(-1,n);
	var dx = controlDist * Math.sin(theta);
	var dy = -1 * controlDist * Math.cos(theta);
	newT.setAttribute("d", "M"+x1+" "+y1+" C"+(x1 + dx)+" "+(y1 + dy)+" "+(x2 + dx)+" "+(y2 + dy)+" "+x2+" "+y2);
	newT.setAttribute("stroke","black");
	newT.setAttribute("fill","none");
	tgroup.appendChild(newT);
	return newT;
    };
	
    var makeState = function(x, y) {
	var newCirc = document.createElementNS("http://www.w3.org/2000/svg","circle");
	newCirc.setAttribute("cx", x);
	newCirc.setAttribute("cy", y);
	newCirc.setAttribute("r", stateRad);
	newCirc.setAttribute("stateID", states.childNodes.length);
	newCirc.setAttribute("fill","white");
	newCirc.setAttribute("stroke","black");
	states.appendChild(newCirc);
	    return newCirc;
    };

    var setupSButton = function() {
	var el = function(e) {
	    makeState(e.x,e.y);
	}

	sButton.onclick = function(e) {
	    if(sButton.className === "toggledOn") {
		sButton.className = "";
		svg.removeEventListener("mouseup",el);
	    } else {
		sButton.className = "toggledOn";
		svg.addEventListener("mouseup",el);
	    }
	} 
    }
    
    return function(){
	setupSButton();

	var state1 = makeState(50,50);
	var state2 = makeState(100,100);
	var t1 = makeTransition(state1, state2);
	var t2 = makeTransition(state1, state2);
	var t3 = makeTransition(state1, state2);
    }
}()()
