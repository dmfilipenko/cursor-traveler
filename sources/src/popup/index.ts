import { pipe } from 'ramda';

import { converter } from '../utils/converter';
import { storageChange$ } from '../utils/getFromStorage';
import { calculateTotal } from '../utils/total';

const $totalDistance = document.querySelector('#total-distance')
const setValue = v => $totalDistance.innerHTML = v

const writeTotalValue = pipe(
    calculateTotal,
    converter,
    setValue
)


chrome.storage.local.get(writeTotalValue)
storageChange$.subscribe(() => chrome.storage.local.get(writeTotalValue))