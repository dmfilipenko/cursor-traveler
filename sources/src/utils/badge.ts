import * as pipe from 'ramda/src/pipe';

import { getUnits } from './converter';
import { calculateTotal, totalToBadge } from './total';
import {tap} from 'rxjs/internal/operators/tap';

export const setBadge = text => chrome.browserAction.setBadgeText({ text })
export const setTotalToBadge = () => chrome.storage.local.get(
    pipe(
        calculateTotal,
        getUnits,
        setBadge,
    )
)
