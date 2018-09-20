// chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
//     if (msg.color) {
//         console.log('Receive color = ' + msg.color)
//         document.body.style.backgroundColor = msg.color
//         sendResponse('Change color to ' + msg.color)
//     } else {
//         sendResponse('Color message is none.')
//     }
// })
import { fromEvent } from 'rxjs';
import { bufferTime, filter, map, pairwise, startWith } from 'rxjs/operators';

const distance$ = fromEvent(document, 'mousemove')
    .pipe(
        startWith(null),
        pairwise(),
        filter(([prev, curr]) => prev !== null && curr !== null),
        map(([prev, curr]: [MouseEvent, MouseEvent]) => (
            {
                prevX: prev.pageX, 
                prevY: prev.pageY,
                currY: curr.pageY,
                currX: curr.pageX,
            }
        )),
        filter(({
            prevX, prevY, currY, currX
        }) => Math.abs(prevX - currX) < 300 || Math.abs(prevY - currY) < 300),
        map(({prevX, prevY, currX, currY}) => (
            Math.sqrt(
                Math.pow((currX - prevX), 2) + Math.pow((currY - prevY), 2)
            )
        )),
        map(v => v * 0.02645833),
        filter(v => v > 0)
    )
    
// const clicks = fromEvent(document, 'click');
// const result = clicks.pipe(audit(ev => interval(1000)));
// result.subscribe(x => console.log(x));
// const int = interval(1000)
const $distDistinct = distance$.pipe(
    bufferTime(5000),
    map(v => v.reduce((a, c) => a + c, 0)),
    filter(v => v > 0),
)
// $distDistinct.subscribe(console.log)
$distDistinct.subscribe(chrome.runtime.sendMessage)
    // .pipe(startWith(null))
// distance.subscribe(console.log)
// distance.pipe(
//     timer(1000)
// )
    // 

    
// document.addEventListener('mousemove', e => {
//     const { pageX, pageY } = e
//     if (start) {
//         start = false
//         return prevCoords = [pageX, pageY]
//     }
//     const [prevX, prevY] = prevCoords
//     const x = Math.pow((pageX - prevX), 2)
//     const y = Math.pow((pageY - prevY), 2)
//     path += Math.sqrt(x + y)
//     prevCoords = [pageX, pageY]
//     console.log(path * 0.02645833)
// })

// // // var background = chrome.extension.getBackgroundPage();

// window.addEventListener("beforeunload", function (event) {
//     chrome.runtime.sendMessage({
//         msg: 'UNLOAD',
//         path
//     })
// }, true);

// chrome.runtime.sendMessage({
//     msg: 'SEND_DISTANCE',
//     path
// })