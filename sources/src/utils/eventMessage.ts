import { fromEventPattern } from 'rxjs';
import { pluck } from 'rxjs/operators';

type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

export const message$ = fromEventPattern(
   (handler: Handler) => chrome.runtime.onMessage.addListener(handler),
   (handler: Handler) => chrome.runtime.onMessage.removeListener(handler),
   (message) => message
)
