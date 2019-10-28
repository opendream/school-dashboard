import React, {Component} from "react";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

export default class Header extends Component {
    render() {
        let user = this.props.user;
        let organization = this.props.organization;

        let name = typeof(user) !== "undefined"? user.name: "";
        let avatarUrl = typeof(organization) !== "undefined"
            && organization !== null
            && (typeof(organization.organizationLogoUrl) !== "undefined" && organization.organizationLogoUrl.indexOf('https') === -1)? organization.organizationLogoUrl: "/static/images/default-school.png";

        const homeClass = location.pathname === "/" ? "nav-link active" : "nav-link";
        const chapterClass = location.pathname.match(/^\/chapter/) ? "nav-link active" : "nav-link";
        const userClass = location.pathname.match(/^\/user/) ? "nav-link active" : "nav-link";
        const reportClass = location.pathname.match(/^\/report/) ? "nav-link active" : "nav-link";


        return (
            <div className="header header-dashboard">
                <header>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-9">
                                <nav className="navbar navbar-expand-lg navbar-light justify-content-center">
                                    <a className="navbar-brand" href="/">
                                        <img src="/static/images/app-logo-white.png"
                                            srcSet="/static/images/app-logo-white@2x.png 2x"
                                            alt="School CMS Dashboard" />
                                    </a>
                                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                                        <span className="navbar-toggler-icon"></span>
                                    </button>
                                    <div className="collapse navbar-collapse" id="navbarNav">
                                        <ul className="navbar-nav">
                                            <li className="nav-item">
                                                <Link className={homeClass} to="/" activeClassName="active">School</Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link className={chapterClass} to="/chapter" activeClassName="active">Chapters</Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link className={userClass} to="/user" activeClassName="active">Users</Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link className={reportClass} to="/report" activeClassName="active">Report</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </nav>
                            </div>
                            <div className="col-3 d-flex align-items-center justify-content-center">
                                <div className="username text-right mr-2 pr-2 border-right d-flex align-items-center justify-content-center">
                                    <span className="show-name">{name} </span>
                                    <img className="rounded-circle" src={avatarUrl} width="40px" />
                                </div>    
                                <div className="ic-signout">
                                <a href="/logout"><i className="fa fa-sign-out text-white"></i></a></div>           
                            </div>
                            
                        </div>
                        
                    </div>
                
                </header>
            </div>
        )
    }
}
