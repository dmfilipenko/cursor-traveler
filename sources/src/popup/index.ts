import pipe from 'ramda/src/pipe';

import { convertMetrics } from '../utils/converter';
import { storageChange$ } from '../utils/getFromStorage';
import { calculateTotal } from '../utils/total';

const $totalDistance = document.querySelector('#total-distance')
const totalInHtml = v => $totalDistance.innerHTML = v

const writeTotal = () => chrome.storage.local.get(pipe(
    calculateTotal,
    convertMetrics,
    totalInHtml
))

writeTotal()
storageChange$.subscribe(writeTotal)