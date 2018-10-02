import { h, render } from 'preact';
import { compose, lifecycle } from 'recompose';
import * as style from './test.css';

const div = document.createElement('div')

div.classList.add('cursor-traveler-container')
document.body.appendChild(div);

const TitleComponent = () => (
    <span className={style.local}>You traveled 🏁</span>
)


const DataComponent = (props) => (
    <div className="data">
        <div class="number">
            155<span>.123</span>
        </div>
        <div class="text">kilometres</div>
    </div>
)

render(
    <div>
        <TitleComponent />
        <DataComponent />
    </div>
, div);
