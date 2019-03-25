import { bindCallback, fromEventPattern, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

export const getStorage$ = (value: string) => {

  return Observable.create(observer => {
    chrome.storage.local.get([value], val => {
        observer.next(val)
    })
    return null
  }).pipe(
    pluck(value)
  )
}


type Handler = (changes: {[key: string]: StorageChange}, areaName: string) => void;

export const storageChange$ = fromEventPattern(
    (handler: Handler) => chrome.storage.onChanged.addListener(handler),
    (handler: Handler) => chrome.storage.onChanged.removeListener(handler),
)
