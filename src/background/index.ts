import { map, switchMap } from 'rxjs/operators';
import { makeMigration } from './migrate'
import { setTotalToBadge } from '../utils/badge';
import { getDateTimestamp } from '../utils/date';
import { message$ } from '../utils/eventMessage';
import { getStorage$, storageChange$ } from '../utils/getFromStorage';


//TODO: done in future releases
makeMigration()

const localAndSended$ = message$.pipe(
    switchMap((sendedPath: number) => 
        getStorage$(['distance', `${getDateTimestamp()}`]).pipe(
            map((savedPath: number = 0) => sendedPath + savedPath)
        )
    ),
)

localAndSended$.subscribe(path => {
    chrome.storage.local.get('distance', ({distance}) => {
        chrome.storage.local.set({'distance': {
            ...distance,
            [getDateTimestamp()]: path
        }})
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