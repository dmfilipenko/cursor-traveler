import { flatten, map as mapIterate, pipe as pipeR, values } from 'ramda';
/* tslint:disable */
import { combineLatest, fromEventPattern, Observable, bindCallback } from 'rxjs';
import { concat, map, pluck, switchMap, tap, withLatestFrom } from 'rxjs/operators';

// import { Units } from '../types/enums';
import  { getDateTimestamp } from '../utils/date'
type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

const message$ = fromEventPattern(
   (handler: Handler) => chrome.runtime.onMessage.addListener(handler),
   (handler: Handler) => chrome.runtime.onMessage.removeListener(handler),
   (message, sender, sendResponse) => ({ message, sender, sendResponse })
).pipe(
    pluck('message')
)
// const setStorage$ = (value: any) => bindCallback<any, any>(chrome.storage.local.set)(value)
const getStorage$ = (value: string) => bindCallback<string, any>(chrome.storage.local.get)(value).pipe(
    pluck(value)
)



const localAndSended$ = message$.pipe(
    switchMap((sendedPath: number) => 
        getStorage$(`${getDateTimestamp()}`).pipe(
            map((savedPath: number = 0) => sendedPath + savedPath)
        )
    ),
)
localAndSended$.subscribe(path => {
    chrome.storage.local.set({
        [getDateTimestamp()]: path
    })
})

// merged$.subscribe((a: number[]) => {
//     const [sendedPath, localPath] = a;
//     chrome.storage.local.set({
//         path: sendedPath + localPath
//     })
// })
// merged$.subscribe(console.log)
