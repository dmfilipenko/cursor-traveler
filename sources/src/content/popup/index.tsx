// import './view';
import { Component, h, render } from 'preact';

class Clock extends Component {
    render() {
        let time = new Date().toLocaleTimeString();
        return <span>{ time }</span>;
    }
}

// message$.subscribe(console.log)

const div = document.createElement('div')
div.classList.add('cursor-traveler-container')
document.body.appendChild(div);
render(<Clock />, div);