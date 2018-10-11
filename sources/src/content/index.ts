import * as sum from 'ramda/src/sum';
import { fromEvent } from 'rxjs';
import { bufferTime, filter, map, pairwise, startWith, tap } from 'rxjs/operators';

import { pxToCm } from '../utils/converter';

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
        map(({ prevX, prevY, currX, currY }) => (
            Math.sqrt(
                Math.pow((currX - prevX), 2) + Math.pow((currY - prevY), 2)
            )
        )),
        map(pxToCm)
    )

const $distDistinct = distance$.pipe(
    bufferTime(5000),
    map(sum),
    tap(v => v > 0)
)


$distDistinct.subscribe(chrome.runtime.sendMessage)
