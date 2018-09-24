import { pipe, sum, values } from 'ramda';

// import { map, switchMap, tap } from 'rxjs/operators';
// import { getDateTimestamp } from '../utils/date';
// import { message$ } from '../utils/eventMessage';
import { storageChange$ } from '../utils/getFromStorage';
import { converter } from '../utils/converter'
// const backgroundPage = chrome.extension.getBackgroundPage();
const $totalDistance = document.querySelector('#total-distance')


const setValue = (v) => $totalDistance.innerHTML = v
const totalValue = pipe(
    values,
    sum,
    (d) => {
        debugger
        return d
    },
    converter,
    setValue
)


chrome.storage.local.get(totalValue)
storageChange$.subscribe(() => chrome.storage.local.get(totalValue))