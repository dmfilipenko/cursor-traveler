import { bindCallback, fromEventPattern } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

export const getStorage$ = (value: string[]) => bindCallback<string[], any>(chrome.storage.local.get)(value).pipe(
    pluck.apply(null, value),
)

type Handler = (changes: {[key: string]: StorageChange}, areaName: string) => void;

export const storageChange$ = fromEventPattern(
    (handler: Handler) => chrome.storage.onChanged.addListener(handler),
    (handler: Handler) => chrome.storage.onChanged.removeListener(handler),
)