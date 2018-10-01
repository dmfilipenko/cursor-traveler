import { Component, h, render } from 'preact';

const div = document.createElement('div')
div.classList.add('cursor-traveler-container')
document.body.appendChild(div);

class Title extends Component {
    render() {
        return (
            <title>
                <span>You traveled</span>
                <div>test</div>
            </title>
        );
    }
}

class Data extends Component {
    render() {
        return <span>HELLO</span>;
    }
}

render((
    <div>
        <Title />
        <Data />
    </div>), div);
