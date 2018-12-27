import * as pipe from 'ramda/src/pipe';

import { getMetricUnits } from './converter';
import { calculateTotal } from './total';

export const setBadge = text => chrome.browserAction.setBadgeText({ text })
export const setTotalToBadge = () => chrome.storage.local.get(
    pipe(
        calculateTotal,
        getMetricUnits,
        setBadge,
    )
)
