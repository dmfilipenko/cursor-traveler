import * as pipe from 'ramda/src/pipe';

import { convertMetrics } from '../utils/converter';
import { storageChange$ } from '../utils/getFromStorage';
import { calculateTotal } from '../utils/total';

const render = (total: number, metric: string) => {
    const [decimal, mantissa] = total.toString().split('.')
    const $total = document.querySelector('.total')
    const $unit = document.querySelector('.unit')
    const $mantissa = document.createElement('span')

    $total.textContent = decimal
    if (mantissa) $mantissa.textContent = `.${mantissa}`
    $total.appendChild($mantissa)

    if (metric) $unit.textContent = metric
}

const renderPopup = () => chrome.storage.local.get(
    pipe(
        calculateTotal,
        convertMetrics,
        ([ total = 0, metric ]) => render(total, metric)
    )
)
try {
    ga('send', 'pageview');
}
catch (e) {
    console.log(e)
}
renderPopup()
storageChange$.subscribe(renderPopup)
