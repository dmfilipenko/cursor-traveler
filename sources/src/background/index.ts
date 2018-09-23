import { flatten, map as mapIterate, pipe as pipeR, values } from 'ramda';
/* tslint:disable */
import { bindCallback, combineLatest, fromEventPattern, Observable } from 'rxjs';
import { concat, map, pluck, switchMap, tap, withLatestFrom } from 'rxjs/operators';

// import { Units } from '../types/enums';
import { getDateTimestamp } from '../utils/date';
import { message$ } from '../utils/eventMessage';
import { getStorage$ } from '../utils/getFromStorage';

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

