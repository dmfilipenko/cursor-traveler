import { pipe, sum, values } from 'ramda';

// import { map, switchMap, tap } from 'rxjs/operators';
// import { getDateTimestamp } from '../utils/date';
// import { message$ } from '../utils/eventMessage';
import { storageChange$ } from '../utils/getFromStorage';

// const backgroundPage = chrome.extension.getBackgroundPage();
const $totalDistance = document.querySelector('#total-distance')


const setValue = (v: number = 0) => $totalDistance.innerHTML = `${v.toFixed(2)} cm`
const totalValue = pipe(
    values,
    sum,
    setValue
)

chrome.storage.local.get(totalValue)
storageChange$.subscribe(() => chrome.storage.local.get(totalValue))