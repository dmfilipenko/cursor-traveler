import { h, Component, render } from 'preact';
import { compose, lifecycle } from 'recompose';
import * as style from './test.css';

const div = document.createElement('div')

div.classList.add('cursor-traveler-container')
document.body.appendChild(div);

class DemoComponent extends Component <{}, { isToggleOn: boolean }>{
    constructor(props) {
        super(props);
        this.state = {isToggleOn: true};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState(state => ({
            isToggleOn: !state.isToggleOn
        }));
    }

    render() {
        return (
            <div>
                {this.state.isToggleOn && (
                    <div className={style.wrapper}>
                        <button className={style.close} onClick={this.handleClick}>
                        </button>
                        <span className={style.title}>You traveled 🏁</span>
                        <div className={style.data}>
                            <div className={style.number}>
                                155<span>.123</span>
                            </div>
                            <div className={style.unit}>kilometres</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

render(<DemoComponent />, div);
