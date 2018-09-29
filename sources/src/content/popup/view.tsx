import { Component, h, render } from 'preact';

const div = document.createElement('div')
div.classList.add('cursor-traveler-container')
document.body.appendChild(div);
class Clock extends Component {
    render() {
        let time = new Date().toLocaleTimeString();
        return <span>{ time }</span>;
    }
}
render(<Clock />, div);
