import React from "react";

import firebase from "../../firebase";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            currentUser: null,
            message: ''
        }
    }

    onChange(e) {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    onSubmit(e) {
        e.preventDefault()

        let email = this.state.email;
        let password = this.state.password;

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then(response => {
                this.setState({
                    currentUser: response.user
                })

                window.location.href = "/admin/school";
            })
            .catch(error => {
                this.setState({
                    message: error.message
                })
            })

    }

    render() {
        let message = this.state.message;

        return (
            <div className="page bg-color-1 text-white">
                <section className="section container h-100">
                    <div className="row justify-content-center align-items-center h-100">
                        <div className="col-lg-5 col-md-8">
                            <div className="header text-center">
                                <h1 className="title center m-0">
                                    <a href="/" className="navbar-brand">
                                        <img src="/static/images/app-logo-white.png"
                                                srcSet="/static/images/app-logo-white@2x.png 2x"
                                                alt="School Dashboard" />
                                    </a>
                                </h1>
                                <p className="_remark">CMS Admin</p>
                            </div> {/* /header */}
                            <form className="" onSubmit={(e) => this.onSubmit(e)}>
                                {message ? 
                                <div className="alert alert-danger" role="alert">
                                  {message}
                                </div> : null}
                                <div className="form-group form-inline">
                                    <label className="w-25 justify-content-end pr-2">Email</label>
                                    <input className="form-control" type="email" name="email" onChange={(e) =>this.onChange(e)} />                                     
                                </div>

                                <div className="form-group form-inline">
                                    <label className="w-25 justify-content-end pr-2">Password</label>
                                    <input className="form-control" type="password" name="password" onChange={(e) => this.onChange(e)} />
                                </div>

                                <div className="form-group text-center">
                                    <button className="btn btn-black">Log In</button>
                                </div>
                            </form> 
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default Login;
