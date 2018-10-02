import { h, render } from 'preact';
import { compose, lifecycle } from 'recompose';
import * as style from './test.css';

const div = document.createElement('div')

div.classList.add('cursor-traveler-container')
document.body.appendChild(div);

const TitleComponent = () => (
    <span className={style.title}>You traveled 🏁</span>
)


const DataComponent = (props) => (
    <div className={style.data}>
        <div className={style.number}>
            155<span>.123</span>
        </div>
        <div className={style.unit}>kilometres</div>
    </div>
)

render(
    <div className={style.wrapper}>
             <TitleComponent />
             <DataComponent />
         </div>
, div);
