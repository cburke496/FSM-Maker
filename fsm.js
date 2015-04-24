var fsm = function(){
    //***(Sort of) Constants***//
    var stateRad = 20;//radius of each state (can be changed)
    var stateColor = "FFFFFF";//color of each state (can be changed)
    var acceptingRatio = 5/6;//ratio of radii of two circles in accepting state
    var maxStateRad = 100;//maximum radius of each state
    var minStateRad = 10;//minimum radius of each state
    var transWidth = "3px";//stroke-width of each transition path
    var stateWidth = "1px";//stroke-width of each state

    //****HTML Elements****//
    var svg = document.querySelector("svg");
    var body = document.querySelector("body");
    //Draw New States Button
    var sButton = document.querySelector("#newStates");
    //Draw New Transitions Button
    var tButton = document.querySelector("#newTransitions");
    //Delete States Button
    var dsButton = document.querySelector("#deleteStates");
    //Delete Transitions Button
    var dtButton = document.querySelector("#deleteTransitions");
    //Toggle Accepting Button
    var taButton = document.querySelector("#toggleAccepting");
    //Group of Transitions
    var transitions = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
    //Group of States
    var states = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
    //Group of Inner Circles for Accepting States
    var acceptingStates = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
    //Group of Labels
    var tLabels = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg","g"));
    //State Radius Input
    var stateRadBox = document.querySelector("#state-rad");
    //State Color Input
    var stateColorBox = document.querySelector("#state-color");

    //****Variables About State of SVG****//
    var selectedState = null;//currently selected state
    var selectedLabel = null;//currently selected label
    var drawingStates = false;//whether Make New States is active
    var drawingTransitions = false;//whether Make New Transitions is active
    var deletingStates = false;//whether Delete States is active
    var deletingTransitions = false;//whether Delete Transitions is active
    var togglingAccepting = false;//whether Toggle Accepting is active
    var radiusChanged = false//whether the state radius input has changed since the value was last updated
    var colorChanged = false//whether the state color input has changed since the value was last updated

    //****Counters (Not Decremented By Deletions)****//
    var totalNumStates = 0;
    var totalNumTransitions = 0;


    //Makes a new transition between states "c1" and "c2" with label "labeltext"
    //
    //Returns [a,b], where "a" is the "path" of the transition and the "b" is 
    //the "polygon" of the arrow
    var makeTransition = function(c1, c2, labelText) {
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
	var n = tgroup.childNodes.length/2;
	var controlDist = Math.floor((n+1)/2)*40*Math.pow(-1,n);
	var dx = controlDist * Math.sin(theta);
	var dy = -1 * controlDist * Math.cos(theta);
	newT.setAttribute("d", "M"+x1+" "+y1+" C"+(x1 + dx)+" "+(y1 + dy)+" "+(x2 + dx)+" "+(y2 + dy)+" "+x2+" "+y2);
	newT.setAttribute("stroke","black");
	newT.setAttribute("stroke-width",transWidth);
	newT.setAttribute("fill","none");
	newT.setAttribute("transid",totalNumTransitions++);
	newT.setAttribute("sourceid",id1);


	var arrowX = (x1 + x2)/2 + (controlDist*3/4 * Math.sin(theta));
	var arrowY = (y1 + y2)/2 - (controlDist*3/4 * Math.cos(theta));
	var newTheta = theta * 180 / Math.PI;
	newTheta = x1 < x2 ? newTheta : newTheta + 180
	
	var arrow = document.createElementNS("http://www.w3.org/2000/svg","polygon");
	arrow.setAttribute("fill","black");
	arrow.setAttribute("stroke","black");
	arrow.setAttribute("stroke-width","0px");
	arrow.setAttribute("points",(arrowX + 10)+","+(arrowY)+" "+(arrowX - 5)+","+(arrowY - 5)+" "+(arrowX - 5)+","+(arrowY + 5));
	arrow.setAttribute("transform","rotate("+newTheta+" "+arrowX+" "+arrowY+")");

	tgroup.appendChild(arrow);
	tgroup.appendChild(newT);

	if(selectedLabel) deselectLabel();
	var label = document.createElementNS("http://www.w3.org/2000/svg","text");
	var labelDist = 8;
	var labelX = arrowX + (labelDist * Math.sin(theta));
	var labelY = arrowY - (labelDist * Math.cos(theta));
	label.setAttribute("x", labelX);
	label.setAttribute("y", labelY);
	label.setAttribute("font-size","15px");
	label.setAttribute("stroke","#00ccff");
	label.setAttribute("text-anchor","middle");
	label.setAttribute("labelid",newT.getAttribute("transid"));
	var temp = (labelText === undefined ? String.fromCharCode(949) : labelText);
	label.appendChild(document.createTextNode(temp));
	selectedLabel = label;
	tLabels.appendChild(label);
	
	newT.addEventListener("mouseup",function() {
	    if(deletingTransitions) {
		var parent = this.parentNode;
		var numSiblings = (parent.childNodes.length - 2)/2;
		var ids = parent.getAttribute("ids").split(" ");

		var numForwardArrows = 0;
		var labelTexts = [];
		var thisID = this.getAttribute("transid");
		for(var i = 0; i < numSiblings + 1; i++) {
		    var sib = parent.childNodes[i*2 + 1];
		    var sibID = sib.getAttribute("transid");
		    var tmplabel = document.querySelector("text[labelid = '" + sibID + "']");
		    tmplabel.parentNode.removeChild(tmplabel);		    
		    if(sibID != thisID)	{
			if(sib.getAttribute("sourceid") == ids[0]) 
			    numForwardArrows++;
			labelTexts.push(tmplabel.textContent);
		    }
		}

		var twoStates = [document.querySelector("circle[stateid='"+ids[0]+"']"),document.querySelector("circle[stateid='"+ids[1]+"']")];
		parent.innerHTML = "";
		for(var i = 0; i < numSiblings; i++) {
		    var t = i < numForwardArrows ? 
			makeTransition(twoStates[0],twoStates[1],labelTexts[i]):
			makeTransition(twoStates[1],twoStates[0],labelTexts[i]);
		    t[0].setAttribute("stroke","red");
		    t[0].setAttribute("stroke-width","8px");
		    t[1].setAttribute("fill","red");
		    t[1].setAttribute("stroke","red");
		    t[1].setAttribute("stroke-width","8px");
		} 
		if(selectedLabel) deselectLabel();
	    }
	});
	
	return [newT,arrow];
    };
    
    //Makes a new state with coordinates (x,y)
    //
    //Returns the "circle" element of the newly-created state
    var makeState = function(x, y) {
	var newCirc = document.createElementNS("http://www.w3.org/2000/svg","circle");
	newCirc.setAttribute("cx", x);
	newCirc.setAttribute("cy", y);
	newCirc.setAttribute("r", stateRad);
	newCirc.setAttribute("stateid", totalNumStates++);
	newCirc.setAttribute("fill","#"+stateColor);
	newCirc.setAttribute("stroke","black");
	states.appendChild(newCirc);
	
	newCirc.addEventListener("mouseup",function() {
	    if(drawingTransitions) {
		if(selectedState === this) {
		    deselectState();
		} else if(selectedState === null) {
		    selectState(this);
		} else {
		    makeTransition(selectedState, this);
		    deselectState();
		}
	    }
	    
	    if(deletingStates) {
		for(var i = transitions.childNodes.length - 1; i >= 0; i--) {
		    var ids = transitions.childNodes[i].getAttribute("ids").split(" ");
		    if(ids[0] === "" + this.getAttribute("stateid") ||
		      ids[1] === "" + this.getAttribute("stateid")) {
			var trans = transitions.childNodes[i];
			for(var j = 0; j < trans.childNodes.length/2; j++) {
			    var tempID = trans.childNodes[j*2+1].getAttribute("transid");			    tLabels.removeChild(document.querySelector("text[labelid='"+tempID+"']")); 
			}
			transitions.removeChild(trans);
		    }
		}
		for(var i = 0; i < acceptingStates.childNodes.length; i++) {
		    if(acceptingStates.childNodes[i].getAttribute("stateid") == this.getAttribute("stateid")) {
			acceptingStates.removeChild(acceptingStates.childNodes[i]);
			break;
		    }
		}
		this.parentNode.removeChild(this);
	    }

	    if(togglingAccepting) {
		var existingAcceptingState = null;
		for(var i = 0; i < acceptingStates.childNodes.length;i++) {
		    if(acceptingStates.childNodes[i].getAttribute("stateid") == this.getAttribute("stateid")) {
			existingAcceptingState = acceptingStates.childNodes[i];
			break;
		    }
		}
		if(existingAcceptingState) {
		    acceptingStates.removeChild(existingAcceptingState);
		} else {
		    var newAcceptingState = document.createElementNS("http://www.w3.org/2000/svg","circle");
		    newAcceptingState.setAttribute("cx",this.getAttribute("cx"));
		    newAcceptingState.setAttribute("cy",this.getAttribute("cy"));
		    newAcceptingState.setAttribute("r",this.getAttribute("r") * acceptingRatio);
		    newAcceptingState.setAttribute("stateid",this.getAttribute("stateid"));
		    newAcceptingState.setAttribute("fill","none");
		    newAcceptingState.setAttribute("stroke","black");
		    acceptingStates.appendChild(newAcceptingState);
		}
	    }
	});	    

	return newCirc;
    };
    
    //Sets up the event listeners for the Make New States Button
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
    
    //Sets up the event listeners for the Make New Transitions Button
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

    //Sets up the event listeners for the Delete States Button
    var setupDSButton = function() {
	dsButton.onclick = function() {
	    var deleting = deletingStates;
	    toggleOffAllButtons();

	    if(!deleting) {
		deletingStates = true;
		this.className = "toggledOn";
		var allStates = document.getElementsByTagName("circle");
		for(var i = 0; i < allStates.length; i++) {
		    allStates[i].setAttribute("stroke","red");
		    allStates[i].setAttribute("stroke-width","3px");
		}
	    }
	}
    }

    //Sets up the event listeners for the Delete Transitions Button
    var setupDTButton = function() {
	dtButton.onclick = function() {
	    var deleting = deletingTransitions;
	    toggleOffAllButtons();
	    
	    if(!deleting) {
		deletingTransitions = true;
		this.className = "toggledOn";
		var allTransitions = document.getElementsByTagName("path");
		for(var i = 0; i < allTransitions.length; i++) {
		    allTransitions[i].setAttribute("stroke","red");
		    allTransitions[i].setAttribute("stroke-width","8px");
		}
		var allArrows = document.getElementsByTagName("polygon");
		for(var i = 0; i < allArrows.length; i++) {
		    allArrows[i].setAttribute("stroke","red");
		    allArrows[i].setAttribute("stroke-width","8px");
		    allArrows[i].setAttribute("fill","red");
		}
	    }
	}
    }

    //Sets up the event listeners for the Toggle Accepting Button
    var setupTAButton = function() {
	taButton.onclick = function() {
	    var toggling = togglingAccepting;
	    toggleOffAllButtons();

	    if(!toggling) {
		togglingAccepting = true;
		this.className = "toggledOn";
	    }
	}
    }
    
    //Selects "state"
    var selectState = function(state) {
	if(selectedLabel) deselectLabel();
	state.setAttribute("stroke","#00ccff");
	state.setAttribute("stroke-width","2px");
	selectedState = state;
    }
    
    //Deselects the currently selected state
    var deselectState = function() {
	selectedState.setAttribute("stroke","black");
	selectedState.setAttribute("stroke-width","1px");
	selectedState = null;
    }
    
    //Deselects the currently selected label
    var deselectLabel = function() {
	if(selectedLabel.textContent === "")
	    selectedLabel.textContent = String.fromCharCode(949);
	selectedLabel.setAttribute("stroke","black");
	selectedLabel = null;
    }
    
    //Deselects all buttons, returning the svg to a default state
    var toggleOffAllButtons = function() {
	sButton.className = "";
	drawingStates = false;
	
	tButton.className = "";
	drawingTransitions = false;
	if(selectedState) deselectState();

	if(selectedLabel) deselectLabel();
    
	dsButton.className = "";
	deletingStates = false;
	var allStates = document.getElementsByTagName("circle");
	for(var i = 0; i < allStates.length; i++) {
	    allStates[i].setAttribute("stroke","black");
	    allStates[i].setAttribute("stroke-width",stateWidth);
	}

	dtButton.className = "";
	deletingTransitions = false;
	var allTransitions = document.getElementsByTagName("path");
	for(var i = 0; i < allTransitions.length; i++) {
	    allTransitions[i].setAttribute("stroke","black");
	    allTransitions[i].setAttribute("stroke-width",transWidth);
	}
	var allArrows = document.getElementsByTagName("polygon");
	for(var i = 0; i < allArrows.length; i++) {
	    allArrows[i].setAttribute("stroke","black");
	    allArrows[i].setAttribute("fill","black");
	    allArrows[i].setAttribute("stroke-width","0px");
	}

	taButton.className = "";
	togglingAccepting = false;
    }

    //Set the state radius to the given value if give a valid value. Correct it
    //if not.
    var updateStateRad = function() {
	radiusChanged = false;

	var newStateRad = stateRadBox.value;
	if(isNaN(newStateRad)) {
	    stateRadBox.value = stateRad;
	    return;
	}
	newStateRad = parseInt(newStateRad);
	if(newStateRad > maxStateRad)
	    newStateRad = maxStateRad;
	if(newStateRad < minStateRad)
	    newStateRad = minStateRad;
	stateRad = newStateRad;
	stateRadBox.value = stateRad;
	for(var i = 0; i < states.childNodes.length; i++)
	    states.childNodes[i].setAttribute("r",stateRad);
	for(var i = 0; i < acceptingStates.childNodes.length; i++)
	    acceptingStates.childNodes[i].setAttribute("r",stateRad * acceptingRatio);
    }

    //Set the state color to the given value if given a valid value. Correct it
    //if not.
    var updateStateColor = function() {
	colorChanged = false;

	var newStateColor = stateColorBox.value;
	var valid = true;
	if(newStateColor.length == 6) {
	    for(var i = 0; i < 6; i++) {
		if("0123456789ABCDEFabcdef".indexOf(newStateColor[i]) == -1) {
		    valid = false;
		    break;
		}
	    }
	    if(valid) {
		stateColor = newStateColor.toUpperCase();
		for(var i = 0; i < states.childNodes.length; i++) {
		    states.childNodes[i].setAttribute("fill","#"+stateColor);
		}
	    }
	}
	stateColorBox.value = stateColor;
    }
    
    //Sets up event listeners for typing labels and typing in input boxes
    var setupKeyboardListeners = function() {
	window.onkeydown = function(e) {
	    if(e.keyCode == 8 && e.srcElement == body && selectedLabel) {
		e.preventDefault();
		if(selectedLabel.textContent != String.fromCharCode(949)) {
		    var text = selectedLabel.textContent;
		    selectedLabel.textContent = text.substring(0,text.length-1);
		}
	    }
	    if(e.srcElement == stateRadBox)
		radiusChanged = true;
	    if(e.srcElement == stateColorBox)
		colorChanged = true;
	}
	window.onkeypress = function(e) {
	    if(!selectedLabel || e.srcElement != body) {
		if(e.charCode == 13) {		
		    if(e.srcElement == stateRadBox)
			updateStateRad();
		    if(e.srcElement == stateColorBox)
			updateStateColor();
		}
		return;
	    }
	    if(selectedLabel == null || e.charCode == 32)
		return;
	    if(e.charCode == 13) {
		deselectLabel();
		return;
	    }
	    if(selectedLabel.textContent === String.fromCharCode(949))
		selectedLabel.textContent = String.fromCharCode(e.charCode);
	    else
		selectedLabel.textContent += String.fromCharCode(e.charCode);
	}
    }

    //Sets up mouse listener for when user clicks outside of input box
    var setupMouseListener = function() {
	window.onclick = function(e) {
	    if(e.srcElement != stateRadBox && radiusChanged)
		updateStateRad();
	    if(e.srcElement != stateColorBox && colorChanged)
		updateStateColor();
	}
    }

    //Runs all the setup functions
    return function(){
	setupNSButton();
	setupNTButton();
	setupDSButton();
	setupDTButton();
	setupTAButton();
	setupKeyboardListeners();
	setupMouseListener();
    }
}()()
