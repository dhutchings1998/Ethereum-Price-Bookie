import React from "react";
import factoryInstance from "../ethereum/factory";

class HomepageIndex extends React.Component {
    static async getInitialProps() {
        const manager = await factoryInstance.methods.manager().call()

        return {manager}
    }

    render() {
        return (
            <div>
                <h1>Manager: <span>{this.props.manager}</span></h1>
            </div>
        )
    }
}

export default HomepageIndex;
