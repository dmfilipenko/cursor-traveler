var hasJogger = true;

//the connection port
var port = chrome.runtime.connect({name: "content"});
port.onMessage.addListener(function(msg){
	hasJogger = msg.jogger;
	if (hasJogger){
		document.body.appendChild(jogger);
	} else {
		jogger.remove();
	}
});

var previousOffsetX = document.body.scrollLeft;
var previousOffsetY = document.body.scrollTop;

var ignoreScroll = false;
var timeout = -1;
var pagePixels = 0;
var lastJoggerPictureUpdate = 0;

var previousTime = Date.now();

//bind the mousewheel events
window.addEventListener("mousewheel", function(e){
	sendPixels(e.wheelDeltaX, e.wheelDeltaY);
	ignoreScroll = true;
	previousTime = Date.now();
	clearTimeout(timeout);
	timeout = setTimeout(function(){
		ignoreScroll = false;
	}, 100);
});

//bind the scroll events
window.addEventListener("scroll", function(e){
	if (!ignoreScroll){
		var scrollLeft = document.body.scrollLeft;
		var scrollTop = document.body.scrollTop;
		var dX = previousOffsetX - scrollLeft;
		var dY = previousOffsetY - scrollTop;
		previousOffsetX = scrollLeft;
		previousOffsetY = scrollTop;
		sendPixels(dX, dY);
	}
});


function sendPixels(dX, dY){
	dX = Math.abs(dX);
	dY = Math.abs(dY);
	var pixels = dX + dY;
	pagePixels += pixels;
	if (port){
		port.postMessage({
			pixels : pixels,
		});
	}
}

//the jogger
var jogger = document.createElement("div");
//style and setup
jogger.id="ScrollOMeterJogger";
//clear all style and set the default
for (var attr in jogger.style){
	if (typeof jogger.style[attr] !== "function"){
		jogger.style[attr] = "initial";
	}
}
jogger.style.position = "fixed";
jogger.style.width = "50px";
jogger.style.height = "50px";
jogger.style.backgroundColor = "transparent";
jogger.style.bottom = "0px";
jogger.style.left = "0px";
jogger.style.pointerEvents = "none";
jogger.style.zIndex = "2147483646"; // 1 less than youtube and netflix
jogger.style.backgroundColor = "transparent";
jogger.style.transition = "transform 0.1s";
jogger.style.webkitTransition = "-webkit-transform 0.1s";
jogger.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
jogger.style.webkitTransform = "translate3d(0, 0, 0) rotate(0deg)";
jogger.style.transformOrigin = "50% 0%";
jogger.style.webkitTransformOrigin = "50% 0%";

var joggerImg = document.createElement("img");
jogger.appendChild(joggerImg);
//clear all style and set the default
for (var attr in joggerImg.style){
	if (typeof joggerImg.style[attr] !== "function"){
		joggerImg.style[attr] = "initial";
	}
}
joggerImg.style.position = "absolute";
joggerImg.style.width = "100%";
joggerImg.style.height = "100%";
joggerImg.style.bottom = "0px";
joggerImg.style.left = "0px";
joggerImg.style.pointerEvents = "none";
joggerImg.style.backgroundColor = "transparent";
joggerImg.src = chrome.extension.getURL("./assets/runner0011.png");

var joggingRate = 0;
var lastUpdate = Date.now();
var lastJoggerPictureUpdatePixels = 0;
var lastJoggerPictureUpdateTime = Date.now();
var joggerImageNumber = 3;
var rateHistory = [];

(function updateJogger(){
	// requestAnimationFrame(updateJogger);
	setTimeout(updateJogger, 100);
	if (!hasJogger){
		return;
	}
	var now = Date.now();
	var diff = pagePixels - lastJoggerPictureUpdatePixels;
	var timeDiff = now - lastUpdate;
	lastUpdate = now;
	lastJoggerPictureUpdatePixels = pagePixels;
	if (timeDiff > 0){
		var rate = diff / timeDiff;
		var runningAvg = runningAverage(rate);
		moveForward(runningAvg);
		var rateDiff = (1 - Math.pow(runningAvg / 10, 0.3)) * 200 + 30;
		if (runningAvg === 0 && (joggerImageNumber === 3 || joggerImageNumber === 8)){
			joggerImg.src = chrome.extension.getURL("./assets/runner0011.png");
		} else if (now - lastJoggerPictureUpdateTime > rateDiff){
			lastJoggerPictureUpdateTime = now;
			joggerImageNumber++;
			joggerImageNumber = joggerImageNumber % 10;
			var joggerString = "0" + (joggerImageNumber + 1).toString();
			if (joggerImageNumber >= 9){
				joggerString = (joggerImageNumber + 1).toString();
			}
			joggerImg.src = chrome.extension.getURL("./assets/runner00"+joggerString+".png");
		} 
	}
}());

function runningAverage(rate){
	rateHistory.push(Math.min(rate, 10));
	if (rateHistory.length > 5){
		rateHistory.shift();
	}
	var avg = 0;
	for (var i = 0; i < rateHistory.length; i++){
		avg+=rateHistory[i];
	}
	avg = avg / rateHistory.length;
	return avg;
}

var side = 0;

var currentPosition = {
	x : 0,
	y : 0,
	rotation : 0
};

var imageSize = 25;

var maxX = window.innerWidth - imageSize * 2 + 10;
var minX = -25;
var maxY = 0;
var minY = -window.innerHeight;

window.addEventListener("resize", function(){
	maxX = window.innerWidth - imageSize * 2 + 10;
	minX = -25;
	maxY = 0;
	minY = -window.innerHeight;
	moveForward(0.0001);
});

function moveForward(rate){
	if (rate > 0){
		var moving = Math.pow(rate, 0.1) * 1.5;
		// moving *= 10;
		switch (side){
			case 0:
				if (currentPosition.x > maxX - imageSize){
					currentPosition.x = maxX;
					currentPosition.y = maxY - imageSize;
					side = 1;
					currentPosition.rotation -= 90;
				} else {
					currentPosition.x += moving;
					currentPosition.y = maxY;
				}
				break;
			case 1:
				if (currentPosition.y < minY + imageSize){
					currentPosition.x = maxX - imageSize;
					currentPosition.y = minY;
					side = 2;
					currentPosition.rotation -= 90;
				} else {
					currentPosition.x = maxX;
					currentPosition.y -= moving;
				}
				break;
			case 2:
				if (currentPosition.x < minX + imageSize){
					currentPosition.x = minX;
					currentPosition.y = minY + imageSize;
					side = 3;
					currentPosition.rotation -= 90;
				} else {
					currentPosition.x -= moving;
					currentPosition.y = minY;
				}
				break;
			case 3:
				if (currentPosition.y > maxY - imageSize){
					currentPosition.x = minX + imageSize;
					currentPosition.y = maxY;
					side = 0;
					currentPosition.rotation -= 90;
				} else {
					currentPosition.x = minX;
					currentPosition.y += moving;
				}
				break;
		}
		jogger.style.webkitTransform = "translate3d("+currentPosition.x+"px, "+currentPosition.y+"px, 0) rotate("+currentPosition.rotation+"deg)";
		jogger.style.transform = "translate3d("+currentPosition.x+"px, "+currentPosition.y+"px, 0) rotate("+currentPosition.rotation+"deg)";
	}
}
