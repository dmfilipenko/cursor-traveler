import { Component, h, render } from 'preact';
import styled from 'styled-components';
// import styledComponentsTS from 'styled-components-ts'

const div = document.createElement('div')

div.classList.add('cursor-traveler-container')
document.body.appendChild(div);


class TitleComponent extends Component {
    render() {
        return (<span>You traveled 🏁</span>)
    }
}

const StyledTitle = styled.div`
          font-size: 1.5em;
          text-align: center;
          color: palevioletred;
        `;

class DataComponent extends Component {
    render() {
        return (
            <div className="data">
                <div class="number">155<span>.123</span>
                </div>
                <div class="text">kilometres</div>
            </div>
        );
    }
}

render((
    <div className="cursor-traveler-container">
        <StyledTitle>
            <TitleComponent />
        </StyledTitle>
        <DataComponent />
    </div>), div);
