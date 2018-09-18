/* tslint:disable */ 
import { 
    fromEventPattern, 
    Observable,
    combineLatest,
} from 'rxjs';
import { 
    map, 
    concat,
    withLatestFrom,
    tap,
    switchMap,
    pluck,
} from 'rxjs/operators';
import { map as mapIterate, values, pipe as pipeR, flatten } from 'ramda';
import {Units } from './enums'
type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

const message$ = fromEventPattern(
   (handler: Handler) => chrome.runtime.onMessage.addListener(handler),
   (handler: Handler) => chrome.runtime.onMessage.removeListener(handler),
   (message, sender, sendResponse) => ({ message, sender, sendResponse })
).pipe(
    pluck('message', 'path')
)
const path$ = Observable.create(function(observer) {
    chrome.storage.local.get('path', observer.next.bind(observer))
}).pipe(
    pluck('path'),
    map(path => path || 0),
)
const unit$ = Observable.create(function(observer) {
    chrome.storage.local.get('unit', observer.next.bind(observer))
}).pipe(
    pluck('unit'),
    map(unit => unit || Units.CENTIMETER),
)
// const unit$ = () => from(promiseGetValue('unit'))
const merged$ = message$.pipe(
   switchMap(sendedPath => combineLatest(
        path$,
        unit$
    ).pipe(
        map(([path, unit]) => [sendedPath, path, unit]))
    )
)


merged$.subscribe((a: number[]) => {
    const [sendedPath, localPath, unit] = a;
    chrome.storage.local.set({
        path: sendedPath + localPath,
        unit
    })
})
// merged$.subscribe(console.log)
