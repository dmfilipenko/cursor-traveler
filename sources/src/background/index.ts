import { pipe } from 'ramda';
import { map, switchMap } from 'rxjs/operators';

import { setBadge } from '../utils/badge';
import { getDateTimestamp } from '../utils/date';
import { message$ } from '../utils/eventMessage';
import { getStorage$ } from '../utils/getFromStorage';
import { calculateTotal, totalToBadge } from '../utils/total';

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

const setTotalValueBadge = pipe(
    calculateTotal,
    totalToBadge,
    setBadge
)
chrome.storage.local.get(setTotalValueBadge)

