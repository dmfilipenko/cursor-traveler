import { pipe, sum, values } from 'ramda';
import { map, switchMap, tap } from 'rxjs/operators';

import { getDateTimestamp } from '../utils/date';
import { message$ } from '../utils/eventMessage';
import { getStorage$, storageChange$ } from '../utils/getFromStorage';

const backgroundPage = chrome.extension.getBackgroundPage();
const $totalDistance = document.querySelector('#total-distance')

getStorage$(`${getDateTimestamp()}`).subscribe(dist => {
    $totalDistance.innerHTML = `${dist}`;
})


const setValue = v => $totalDistance.innerHTML = v
storageChange$.subscribe(
    () => {
        chrome.storage.local.get(
            pipe(
                values,
                sum,
                setValue
            )
        )
    }
)