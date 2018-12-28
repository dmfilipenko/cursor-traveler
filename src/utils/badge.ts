import { path, pipe } from 'ramda'

import { getMetricUnits } from './converter';
import { calculateTotal } from './total';

export const setBadge = text => chrome.browserAction.setBadgeText({ text })
export const setTotalToBadge = () => chrome.storage.local.get(
    'distance',
    pipe(
        path(['distance']),
        calculateTotal,
        getMetricUnits,
        setBadge,
    )
)
