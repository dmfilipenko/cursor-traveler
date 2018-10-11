import * as pipe from 'ramda/src/pipe';
import * as React from 'react';
import { render } from 'react-dom';

import { convertMetrics } from '../utils/converter';
import { storageChange$ } from '../utils/getFromStorage';
import { calculateTotal } from '../utils/total';
import * as s from './styles.css';

const div = document.querySelector('#root')
const View = (props) => (
    <div className={s.wrapper}>
        <div className={s.title}>You traveled 🏁</div>
        <div className={s.total}>
            {props.total}
        </div>
        {props.metric && <div className={s.unit}>{props.metric}</div>}
    </div>
)

const renderPopup = () => chrome.storage.local.get(
    pipe(
        calculateTotal,
        convertMetrics,
        ([ total = 0, metric ]) => render(<View metric={metric} total={total} />, div)
    )
)

renderPopup()
storageChange$.subscribe(renderPopup)

// window.onblur = function(){
//     chrome.browserAction.setBadgeText({"text":"ABCD"});
// }

