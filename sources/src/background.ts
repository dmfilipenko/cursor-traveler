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
} from 'rxjs/operators';
import { map as mapIterate, values, pipe as pipeR, flatten } from 'ramda';
type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

const message$ = fromEventPattern(
   (handler: Handler) => chrome.runtime.onMessage.addListener(handler),
   (handler: Handler) => chrome.runtime.onMessage.removeListener(handler),
   (message, sender, sendResponse) => ({ message, sender, sendResponse })
).pipe(
    map(({ message }) => message),
    map(({ path }) => path)
)
const path$ = Observable.create(function(observer) {
    chrome.storage.local.get('path', observer.next.bind(observer))
}).pipe(
    map(({path}) => path || 0),
)
const unit$ = Observable.create(function(observer) {
    chrome.storage.local.get('unit', observer.next.bind(observer))
}).pipe(
    map(({ unit }) => unit || 0),
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
    console.log(a)
    chrome.storage.local.set({
        path: a[0] + a[1],
        unit: a[2]
    })
})
// merged$.subscribe(console.log)
