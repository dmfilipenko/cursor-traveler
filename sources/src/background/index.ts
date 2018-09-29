import { map, switchMap } from 'rxjs/operators';

import { setTotalToBadge } from '../utils/badge';
import { getDateTimestamp } from '../utils/date';
import { message$ } from '../utils/eventMessage';
import { getStorage$, storageChange$ } from '../utils/getFromStorage';

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


storageChange$.subscribe(setTotalToBadge)
setTotalToBadge()

