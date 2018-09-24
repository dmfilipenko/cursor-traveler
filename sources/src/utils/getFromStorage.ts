import { bindCallback, fromEventPattern } from 'rxjs';
import { pluck } from 'rxjs/operators';

// import { StorageChange } from '@types';
import { getDateTimestamp } from './date';

export const getStorage$ = (value: string) => bindCallback<string, any>(chrome.storage.local.get)(value).pipe(
    pluck(value)
)


type Handler = (changes: {[key: string]: StorageChange}, areaName: string) => void;

export const storageChange$ = fromEventPattern(
    (handler: Handler) => chrome.storage.onChanged.addListener(handler),
    (handler: Handler) => chrome.storage.onChanged.removeListener(handler),
    (message, sender, sendResponse) => ({ message, sender, sendResponse })
)
.pipe(
    pluck('message'),
    pluck(`${getDateTimestamp()}`),
    pluck('newValue')
)