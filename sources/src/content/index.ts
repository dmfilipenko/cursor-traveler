import * as gt from 'ramda/src/gt';
import * as reduce from 'ramda/src/reduce';
import * as sum from 'ramda/src/sum';
import { fromEvent } from 'rxjs';
import { bufferTime, filter, map, pairwise, startWith } from 'rxjs/operators';

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
        map(pxToCm),
        filter(gt(0))
    )

const $distDistinct = distance$.pipe(
    bufferTime(5000),
    map(reduce(sum, 0)),
    filter(gt(0)),
)


$distDistinct.subscribe(chrome.runtime.sendMessage)
