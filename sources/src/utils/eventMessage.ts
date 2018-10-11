import { fromEventPattern } from 'rxjs';

type Handler = (message: any, sender: any, sendResponse: (response: any) => void) => void;

export const message$ = fromEventPattern(
   (handler: Handler) => chrome.runtime.onMessage.addListener(handler),
   (handler: Handler) => chrome.runtime.onMessage.removeListener(handler),
   (message) => message
)
