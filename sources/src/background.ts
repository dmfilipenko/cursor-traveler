import { bindCallback, combineLatest, forkJoin, fromEventPattern, merge } from 'rxjs';
import {
    bufferTime, distinctUntilChanged, filter, map, mergeAll, mergeMap, pairwise, startWith,
    subscribeOn, switchMap
} from 'rxjs/operators';

type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

// const storageCurry = chrome.storage.local.get
const getStorage$ = bindCallback<string, {path: number}>(chrome.storage.local.get);


const message$ = fromEventPattern(
   (handler: Handler) => chrome.runtime.onMessage.addListener(handler),
   (handler: Handler) => chrome.runtime.onMessage.removeListener(handler),
   (message, sender, sendResponse) => ({ message, sender, sendResponse })
).pipe(
    map(({ message }) => message)
)

message$.pipe( 
    mergeMap( 
        _ => getStorage$('path'), 
        (sendedPath, localPath) => sendedPath.path + localPath.path
    ) 
)
.subscribe(
    path => chrome.storage.local.set({
        path,
        unit: 'cm'
    })
)
// merge(
//     message$,
//     get$
// ).subscribe(
//     (...args) => console.log(args)
// )