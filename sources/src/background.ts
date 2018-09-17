/* tslint:disable */ 
import { 
    bindCallback, 
    fromEventPattern, 
    // combineLatest,
   
    // forkJoin,
    // race,
    // zip,
} from 'rxjs';
import { 
    map, 
    merge, 
    concat, 
    concatAll
} from 'rxjs/operators';
import { map as mapIterate, values, pipe as pipeR,flatten } from 'ramda';
type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

const getStorage$ = bindCallback<string[] | string, {path: number}>(chrome.storage.local.get);
const setStorage$ = bindCallback<{path: number, unit: string}, any, any>(chrome.storage.local.set);

// const concated$ = getStorage$('path').pipe(
//     concat(getStorage$('path'))
// )
//tslint:ignore
const message$ = fromEventPattern(
   (handler: Handler) => chrome.runtime.onMessage.addListener(handler),
   (handler: Handler) => chrome.runtime.onMessage.removeListener(handler),
   (message, sender, sendResponse) => ({ message, sender, sendResponse })
).pipe(
    map(({ message }) => message)
)


let a = message$.pipe(
    concatAll(
        getStorage$(['path']),
        getStorage$(['unit']),
    ),
    // map(
    //     (...args) => {
    //         console.log(args)
    //         return args
    //     }
    // )
    // map(
    //     ([sendedPath, localPath, unit]) => {
    //         console.log({path: sendedPath + (localPath || 0), unit})
    //         debugger
    //         return {path: sendedPath + (localPath || 0), unit}
    //     }
    // ),
)  


// map(
    //     pipeR(
    //         mapIterate(values),
    //         flatten,
    //     )
    // ),
a.subscribe(console.log)
// a$.subscribe(console.log)
// a$.subscribe(
//     ([path, unit]) => {
//         console.log(path, unit)
//         chrome.storage.local.set({
//             path,
//             unit
//         })
//     }
// )
// d

// message$
//     .pipe( 
//         mergeMap( 
//             _ => getStorage$('path'), 
//             (sendedPath, localPath) => sendedPath.path + (localPath.path || 0)
//         ),
//     )
   
// merge(
//     message$,
//     get$
// ).subscribe(
//     (...args) => console.log(args)
// )