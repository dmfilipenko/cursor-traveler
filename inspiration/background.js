//////////////////////////////////////////////////////////////////////////////
//	STATS
//////////////////////////////////////////////////////////////////////////////

/**
 * keeps track of all the scroll stats
 */
var ScrollStats = {
	total: 0,
};

//load the previous scroll stats
chrome.storage.local.get(["total"], function(res){
	if (!isFinite(res.total)){
		//first time
		chrome.storage.local.set(ScrollStats);
		chrome.storage.local.set({
			"jogger" : true,
		});
	} else {
		ScrollStats.total += res.total;
	}
	setupCurrentMilestone();
	displayOdometer();

	//subsequently update the storage every 10 seconds
	setInterval(function(){
		chrome.storage.local.set(ScrollStats);
	}, 10000);
});

chrome.browserAction.setBadgeBackgroundColor({"color":"#9933ff"});


//////////////////////////////////////////////////////////////////////////////
//	DASHBOARD
//////////////////////////////////////////////////////////////////////////////

var DisplayUnitsValues = {
	"miles" : "mi",
	"kilometers" : "km",
	"pixels" : "million px",
};

var DisplayMetricValues = {
	"odometer" : "total",
	"tripmeter" : "trip",
};

var DisplayMetric = DisplayMetricValues.odometer;
var DisplayUnits = DisplayUnitsValues.miles;

function displayOdometer(){
	var dist = getDistance();
	var display = "0";
	if (dist < 10){
		display = dist.toFixed(2);
	} else if (dist < 100){
		display = dist.toFixed(1);
	} else if (dist < 1000){
		display = dist.toFixed(0);
	} else if (dist < 10000){
		display = (dist / 1000).toFixed(1) + "k";
	} else {
		display = dist.toFixed(0);
	}
	chrome.browserAction.setBadgeText({
		text:display
	});
	checkMilestone();
}

function setUnits(units){
	DisplayUnits = DisplayUnitsValues[units];
	chrome.storage.local.set({
		"units" : DisplayUnits,
	});
	displayOdometer();
}

function getUnits(){
	for (var key in DisplayUnitsValues){
		if (DisplayUnitsValues[key] === DisplayUnits){
			return key;
		}
	}
}

function setMetric(metric){
	DisplayMetric = DisplayMetricValues[metric];
	chrome.storage.local.set({
		"metric" : DisplayMetric,
	});
	displayOdometer();
}

function getMetric(){
	for (var key in DisplayMetricValues){
		if (DisplayMetricValues[key] === DisplayMetric){
			return key;
		}
	}
}

chrome.storage.local.get(["units", "metric"], function(res){
	if (!res.metric || !res.units){
		chrome.storage.local.set({
			"units" : DisplayUnits,
			"metric" : DisplayMetric,
		});
	} else {
		DisplayUnits = res.units;
		DisplayMetric = res.metric;
	}
	displayOdometer();
});

//////////////////////////////////////////////////////////////////////////////
//	CONTENT SCRIPT COMMUNICATION
//////////////////////////////////////////////////////////////////////////////

/**
 * Listen to content events
 */
var ports = [];

chrome.runtime.onConnect.addListener(function(port) {

	var pageImage = 0;

	port.onMessage.addListener(function(msg) {
		ScrollStats.total += msg.pixels;
		displayOdometer();
	});

	//remove it from the list on disconnect
	port.onDisconnect.addListener(function() {
		for (var i = 0; i < ports.length; i++){
			if (port === ports[i]){
				ports.splice(i, 1);
				break;
			}
		}
	});

	//post the jogger state
	getJogger(function(res){
		port.postMessage({"jogger" : res});
	});

	ports.push(port);
});

function postMessageToAll(message){
	for (var i = 0 ; i < ports.length; i++){
		ports[i].postMessage(message);
	}
}

//////////////////////////////////////////////////////////////////////////////
//	SCREEN RESOLUTION
//////////////////////////////////////////////////////////////////////////////

var PPI = 96;

//get the current screen resolution if there is one
chrome.storage.local.get("screenSize", function(res){
	if (res.screenSize){
		setScreenSize(res.screenSize);
	} else {
		var pixelRatio = window.devicePixelRatio || (window.matchMedia && window.matchMedia("(min-resolution: 2dppx), (-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5)").matches? 2 : 1) || 1;
		var screenWidth = screen.width * pixelRatio;
		var screenHeight = screen.height * pixelRatio;
		// make a guess
		for (var i = 0; i < ScreenResolutions.length; i++){
			var screenRes = ScreenResolutions[i];
			screenRes.dppx = screenRes.dppx || 1;
			if (screenRes.w === screenWidth &&
				screenRes.h === screenHeight && 
				screenRes.dppx === pixelRatio){
				setScreenSize(screenRes.d);
				return;
			}
		}
		//if it's here, just make a guess as to the screen size
		var screenD = Math.sqrt(screen.width * screen.width + screen.height * screen.height) / PPI;
		setScreenSize(screenD);
	}
});

function setScreenSize(size){
	chrome.storage.local.set({
		"screenSize" : size
	});
	PPI = Math.sqrt(screen.width * screen.width + screen.height * screen.height) / size;
	displayOdometer();
}

function getScreenSize(callback){
	chrome.storage.local.get("screenSize", function(res){
		callback(res.screenSize);
	});
}

function getJogger(callback){
	chrome.storage.local.get("jogger", function(res){
		callback(res.jogger);
	});
}

function setJogger(state){
	chrome.storage.local.set({
		"jogger" : state
	});
	postMessageToAll({
		"jogger" : state
	});
}

//////////////////////////////////////////////////////////////////////////////
//	DISTANCES
//////////////////////////////////////////////////////////////////////////////

function pixelsToUnits(pixels){
	var inches = pixels / PPI;
	switch(DisplayUnits){
		case DisplayUnitsValues.kilometers : 
			return inches / 39370.1;
		case DisplayUnitsValues.miles : 
			return inches / 63360;
	}
}

function getMiles(){
	var pixels = ScrollStats.total;
	var inches = pixels / PPI;
	return inches / 63360;
}

function getTotalDistance(){
	return pixelsToUnits(ScrollStats.total);
}

function getDistance(metric){
	var distInPixels = 0;
	switch(DisplayMetric){
		case DisplayMetricValues.odometer : 
			distInPixels = ScrollStats[DisplayMetricValues.odometer];
			break;
	}
	return pixelsToUnits(distInPixels);
}

//////////////////////////////////////////////////////////////////////////////
//	MILESTONES
//////////////////////////////////////////////////////////////////////////////

var currentMilestone = 0;

function checkMilestone(){
	var miles = getMiles();
	if (miles >= Milestones[currentMilestone].distance){
		var milestone = Milestones[currentMilestone];
		currentMilestone++;
		chrome.notifications.create(Math.floor(Math.random() * 1000000).toString(), {
			type : "basic",
			iconUrl : "./assets/trophy.png",
			title : milestone.title,
			message : milestone.message
		}, function(){});
	}
}

//sort the milestones and place the counter
Milestones.sort(function(a, b){
	return a.distance - b.distance;
});

function setupCurrentMilestone(){
	var miles = getMiles();
	for (var i = 0; i < Milestones.length; i++){
		if (miles > Milestones[i].distance){
			currentMilestone = i + 1;
		} else {
			break;
		}
	}
}
