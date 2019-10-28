import React from "react";


class SchoolForm extends React.Component {
    constructor(props) {
        super(props);

        let newOrganization = this.props.newOrganization;

        this.state = {
            'newOrganization': newOrganization,
            'newOrganization.organizationCode': newOrganization.organizationCode,
            'newOrganization.organizationCredit': newOrganization.organizationCredit,
            'newOrganization.organizationName': newOrganization.organizationName,
            'newOrganization.organizationLogo': null,
            'errors': '',
        }
    }

    componentWillReceiveProps(props) {
        let newOrganization = props.newOrganization;

        this.state = {
            'newOrganization': newOrganization,
            'organizationLogoUrl': newOrganization.organizationLogoUrl,
            'newOrganization.organizationCode': newOrganization.organizationCode || "",
            'newOrganization.organizationCredit': newOrganization.organizationCredit || "",
            'newOrganization.organizationName': newOrganization.organizationName || "",
            'newOrganization.organizationLogo': null,
            'errors': '',
        }
    }

    onChange(e) {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    onSubmitOrganization(e) {
        e.preventDefault()

        let organization = {
            organizationCode: this.state['newOrganization.organizationCode'],
            organizationCredit: this.state['newOrganization.organizationCredit'],
            organizationName: this.state['newOrganization.organizationName'],
            isDelete: false
        };

        var errors = [];

        if (typeof(organization.organizationName) === 'undefined' || organization.organizationName === '') {
            errors.push('organizationName is required.')
        }

        if (typeof(organization.organizationCredit) === 'undefined' || organization.organizationCredit === '') {
            errors.push('organizationCredit is required.')
        }

        if (typeof(organization.organizationCode) === 'undefined' || organization.organizationCode === '') {
            errors.push('organizationCode is required.')
        }

        if (errors.length > 0) {
            this.setState({
                'errors': errors,

            });
            return true;
        }

        var organizationLogo =  this.state['newOrganization.organizationLogo'];

        this.props.onSubmitOrganization(e, organization, organizationLogo);
        return true
    }

    changeLogo() {
        const file = document.querySelector('#logoFile').files[0];

        console.log("file", file.name);
        this.setState({
            'organizationLogoName': file.name,
            'newOrganization.organizationLogo': file
        });
    }

    render() {
        return (
            <div className="">
                {
                    !this.props.isCreated? <h2 className="card-title text-green ic-plus">Create School</h2>: <h2 className="card-title text-primary ic-edit">Edit School</h2>
                }
                <div className="row">
                    <div className="col-12">
                        { this.state.errors.length > 0?  <ul className="alert alert-warning">
                            {this.state.errors.map((error, i) => <li>{ error }</li>)}
                        </ul>: <ul></ul>}
                    </div>

                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputschool">School Name</label>
                            <input type="text" className="form-control" id="inputschool" value={this.state['newOrganization.organizationName']} name="newOrganization.organizationName" onChange={(e) =>this.onChange(e)} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputschool">School ID</label>
                            <input type="text" className="form-control" id="inputschool" readOnly={this.props.isCreated} value={this.state['newOrganization.organizationCode']} name="newOrganization.organizationCode" onChange={(e) =>this.onChange(e)} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputcredit">Credit</label>
                            <input type="text" className="form-control" id="inputcredit" value={this.state['newOrganization.organizationCredit']} name="newOrganization.organizationCredit" onChange={(e) =>this.onChange(e)}  />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputlogo">Logo</label>
                            <div className="custom-file mb-3">
                                <input type="file" className="custom-file-input" id="logoFile" name="filename" onChange={(e) => this.changeLogo(e)}/>
                                <label className="custom-file-label" htmlFor="customFile">{typeof(this.state.organizationLogoName) == 'undefined'? 'Attach file': this.state.organizationLogoName}</label>

                                {typeof(this.state.organizationLogoUrl) === 'undefined'?<small></small>:<small><a href={this.state.organizationLogoUrl} target="_blank">{this.state.organizationLogoUrl}</a></small>}
                            </div>
                        </div>
                    </div>
                </div>
                {
                    !this.props.isCreated?  <a href="#" className="btn btn-green" onClick={(e) => this.onSubmitOrganization(e)}>Create</a>:  <a href="#" className="btn btn-primary" onClick={(e) => this.onSubmitOrganization(e)}>บันทึก</a>
                }

            </div>

        );
    }
}

export default SchoolForm;
