import { flatten, map as mapIterate, pipe as pipeR, values } from 'ramda';
/* tslint:disable */
import { combineLatest, fromEventPattern, Observable } from 'rxjs';
import { concat, map, pluck, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Units } from '../types/enums';

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
// const unit$ = Observable.create(function(observer) {
//     chrome.storage.local.get('unit', observer.next.bind(observer))
// }).pipe(
//     pluck('unit'),
//     map(unit => unit || Units.CENTIMETER),
// )
// const unit$ = () => from(promiseGetValue('unit'))
const merged$ = message$.pipe(
   switchMap(sendedPath => path$(
        path$,
    ).pipe(
        map(([path, unit]) => [sendedPath, path, unit]))
    )
)


merged$.subscribe((a: number[]) => {
    const [sendedPath, localPath] = a;
    chrome.storage.local.set({
        path: sendedPath + localPath
    })
})
// merged$.subscribe(console.log)
