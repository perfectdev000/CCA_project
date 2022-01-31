import React from 'react';

class ErrorState extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            show: 'none',
        }
    }

    componentWillReceiveProps = (props) => {
        this.setState({show: props.show});
    }

    componentWillMount = () => {
        this.setState({show: this.props.show});
    }

    render() {
        return (
            <div className="row" style={{marginTop: '10px', fontSize: '16px', 
               display: this.state.show, paddingLeft: '50px', color: 'red'}}>
                Error : {this.props.name}
            </div>                     
        );
    }
}
export default ErrorState;