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

const $distDistinct = distance$.pipe(
    bufferTime(5000),
    map(v => v.reduce((a, c) => a + c, 0)),
    filter(v => v > 0),
)

const div = document.createElement('div')
div.classList.add('cursor-traveler-container')
document.body.appendChild(div);

$distDistinct.subscribe(chrome.runtime.sendMessage)
