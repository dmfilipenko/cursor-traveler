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

chrome.runtime.onInstalled.addListener(function listener(details) {
    if (details.reason === (chrome.runtime as any).OnInstalledReason.INSTALL) {
        ga('send', 'event', 'Install', 'Install extension');
        chrome.runtime.onInstalled.removeListener(listener);
    }
});
storageChange$.subscribe(setTotalToBadge)
setTotalToBadge()

try {
    ga('send', 'pageview', 'background');
}
catch (e) {
    console.log(e)
}