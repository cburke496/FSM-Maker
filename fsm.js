var fsm = function(){
    var stateRad = 10;

    var svg = document.querySelector("svg");
    var body = document.querySelector("body");
    var sButton = document.querySelector("#newStates");
    var tButton = document.querySelector("#newTransitions");
    var dsButton = document.querySelector("#deleteStates");
    var dtButton = document.querySelector("#deleteTransitions");
    var transitions = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
    var states = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));

    var selectedState = null;
    var drawingStates = false;
    var drawingTransitions = false;
    var deletingStates = false;
    var deletingTransitions = false;

    var makeTransition = function(c1, c2) {
	var newT = document.createElementNS("http://www.w3.org/2000/svg","path");
	var id1 = c1.getAttribute("stateid");
	var id2 = c2.getAttribute("stateid");
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
	
	newT.addEventListener("mouseup",function() {
	    if(deletingTransitions)
		this.parentNode.removeChild(this);
	});
	
	return newT;
    };
    
    var makeState = function(x, y) {
	var newCirc = document.createElementNS("http://www.w3.org/2000/svg","circle");
	newCirc.setAttribute("cx", x);
	newCirc.setAttribute("cy", y);
	newCirc.setAttribute("r", stateRad);
	newCirc.setAttribute("stateid", states.childNodes.length);
	newCirc.setAttribute("fill","white");
	newCirc.setAttribute("stroke","black");
	states.appendChild(newCirc);
	
	newCirc.addEventListener("mouseup",function() {
	    if(drawingTransitions) {
		if(selectedState === this) {
		    deselect(this);
		} else if(selectedState === null) {
		    select(this);
		} else {
		    makeTransition(this,selectedState);
		    deselect(selectedState);
		}
	    }
	    
	    if(deletingStates) {
		for(var i = transitions.childNodes.length - 1; i >= 0; i--) {
		    var ids = transitions.childNodes[i].getAttribute("ids").split(" ");
		    if(ids[0] === "" + this.getAttribute("stateid") ||
		      ids[1] === "" + this.getAttribute("stateid"))
			transitions.childNodes[i].innerHTML = "";
		}
		this.parentNode.removeChild(this);
	    }
	});	    
	
	return newCirc;
    };
    
    var setupNSButton = function() {
	svg.onclick = function(e) {
	    if(drawingStates)
		makeState(e.x,e.y);
	}
	
	sButton.onclick = function(e) {
	    var drawing = drawingStates;
	    toggleOffAllButtons();
	    
	    if(!drawing) {
		drawingStates = true;
		sButton.className = "toggledOn";
	    }
	} 
    }
    
    var setupNTButton = function() {
	tButton.onclick = function() {
	    var drawing = drawingTransitions;
	    toggleOffAllButtons();
	    
	    if(!drawing) {
		drawingTransitions = true;
		this.className = "toggledOn";
	    }
	}
    }

    var setupDSButton = function() {
	dsButton.onclick = function() {
	    var deleting = deletingStates;
	    toggleOffAllButtons();

	    if(!deleting) {
		deletingStates = true;
		this.className = "toggledOn";
	    }
	}
    }

    var setupDTButton = function() {
	dtButton.onclick = function() {
	    var deleting = deletingTransitions;
	    toggleOffAllButtons();
	    
	    if(!deleting) {
		deletingTransitions = true;
		this.className = "toggledOn";
	    }
	}
    }
    
    var select = function(state) {
	state.setAttribute("stroke","#00ccff");
	state.setAttribute("stroke-width","2px");
	selectedState = state;
    }
    
    var deselect = function(state) {
	state.setAttribute("stroke","black");
	state.setAttribute("stroke-width","1px");
	selectedState = null;
    }
    
    var toggleOffAllButtons = function() {
	sButton.className = "";
	drawingStates = false;
	
	tButton.className = "";
	drawingTransitions = false;
	if(selectedState) deselect(selectedState);
    
	dsButton.className = "";
	deletingStates = false;

	dtButton.className = "";
	deletingTransitions = false;
    }
    
    return function(){
	setupNSButton();
	setupNTButton();
	setupDSButton();
	setupDTButton();
    }
}()()
