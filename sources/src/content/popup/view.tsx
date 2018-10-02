import { h, render } from 'preact';
import { compose, lifecycle } from 'recompose';
import styled from 'styled-components';

const div = document.createElement('div')

div.classList.add('cursor-traveler-container')
document.body.appendChild(div);



const StyledTitle = styled.div`
    font-size: 1.5em;
    text-align: center;
    color: palevioletred;
`;

const TitleComponent = (props) => (
    <span className={props.className}>You traveled 🏁</span>
)

const Title = compose(
    lifecycle({
        componentDidMount() {
            console.log('component mount')
        }
    })
)(TitleComponent)

const DataComponent = (props) => (
    <div className="data">
        <div class="number">
            155<span>.123</span>
        </div>
        <div class="text">kilometres</div>
    </div>
)

render(
    <StyledTitle>
        <Title />
        <DataComponent />
    </StyledTitle>
, div);
