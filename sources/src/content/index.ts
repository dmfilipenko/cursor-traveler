import './popup/index';

import { fromEvent } from 'rxjs';
import { bufferTime, filter, map, pairwise, startWith, tap } from 'rxjs/operators';

const distance$ = fromEvent(document, 'mousemove')
    .pipe(
        startWith(null),
        tap(console.log),
        pairwise(),
        tap(console.log),
        filter(([prev, curr]) => prev !== null && curr !== null),
        tap(console.log),
        map(([prev, curr]: [MouseEvent, MouseEvent]) => (
            {
                prevX: prev.pageX, 
                prevY: prev.pageY,
                currY: curr.pageY,
                currX: curr.pageX,
            }
        )),
        tap(console.log),
        filter(({
            prevX, prevY, currY, currX
        }) => Math.abs(prevX - currX) < 300 || Math.abs(prevY - currY) < 300),
        tap(console.log),
        map(({prevX, prevY, currX, currY}) => (
            Math.sqrt(
                Math.pow((currX - prevX), 2) + Math.pow((currY - prevY), 2)
            )
        )),
        tap(console.log),
        map(v => v * 0.02645833),
        tap(console.log),
        filter(v => v > 0)
    )

const $distDistinct = distance$.pipe(
    bufferTime(5000),
    map(v => v.reduce((a, c) => {
        return a + c;
    }, 0)),
    filter(v => v > 0),
)

$distDistinct.subscribe(chrome.runtime.sendMessage)
