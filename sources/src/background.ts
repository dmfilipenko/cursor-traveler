/* tslint:disable */ 
import { 
    bindCallback, 
    fromEventPattern, 
    combineLatest,
    forkJoin,
    zip,
    from,
    Observable,
    interval,
    of,
    merge,
    // forkJoin,
    // race,
    // zip,
} from 'rxjs';
import { 
    map, 
    
    // merge, 
    combineAll,
    concat,
    switchMap,
    withLatestFrom,
    flatMap,
    switchAll,
    tap,
    mergeAll, 
} from 'rxjs/operators';
import { map as mapIterate, values, pipe as pipeR, flatten } from 'ramda';
type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

// const getStorage$ = bindCallback<string[] | string, {path: number}>();
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
    map(({ message }) => message),
    map(({ path }) => path)
)


// let a = message$.pipe(
//     concat(
//         getStorage$(['path']),
//         getStorage$(['unit']),
//     ),
//     // map(
//     //     (...args) => {
//     //         console.log(args)
//     //         return args
//     //     }
//     // )
//     // map(
//     //     ([sendedPath, localPath, unit]) => {
//     //         console.log({path: sendedPath + (localPath || 0), unit})
//     //         debugger
//     //         return {path: sendedPath + (localPath || 0), unit}
//     //     }
//     // ),
// )  
// const fromCallbackMultiply = (params: string | string[]) => Observable.create(observer => {
//     // api(params, (error, result) => {
//         //   if (error) {
//             //     observer.error(error);
//             //   } else {
//                 //     observer.next(result);
//                 //   }
//                 // });
//     chrome.storage.local.get(params, (result) => {
//         observer.next(result);
//     })
// });
// const pathLocal$ = fromCallbackMultiply(['path']).pipe(map(({path}) => path))
// const unit$ = fromCallbackMultiply(['unit']).pipe(map(({unit}) => unit))

// let pathAndUnit$ = path$.pipe(
//     switchMap(path => unit$.pipe(
//         map(unit => [path, unit])
//     )),
// )
const promiseGetValue = params => new Promise(res => chrome.storage.local.get(params, res));
let path$ = () => from(promiseGetValue('path')).pipe(map(({path}) => path))
let unit$ = () => from(promiseGetValue('unit')).pipe(map(({unit}) => unit))
let merged$ = message$.pipe(
    switchMap(
        messagePath => path$().pipe(map(localPath => [messagePath, localPath]))
    ),
    switchMap(
        pathes => unit$().pipe(map(unit => [...pathes, unit]))
    )
)//.pipe(
//     mergeAll()
// )



// const merged$ = message$.pipe(
//     switchMap(sendedPath => 
//         pathLocal$
//     )
// )
//     ,
//     path$,
//     unit$,
//     // map(flatten)
// )

// map(
    //     pipeR(
    //         mapIterate(values),
    //         flatten,
    //     )
    // ),

// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
// path$.subscribe(console.log)
merged$.subscribe(a => {
//     // tslint: ignore
//     (a)
//     // console.log(flatten(a))
    let [messagePath, localPath, unit] = a;
    // console.log(messagePath + (localPath || 0))
    chrome.storage.local.set({
        path: messagePath + (localPath || 0),
        unit: unit
    })
})
merged$.subscribe(console.log)
// a$.subscribe(
//     ([path, unit]) => {
//         console.log(path, unit)
//         
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