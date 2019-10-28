import React, {Component} from "react";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;


export default class Header extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        let user = this.props.user;
        let organization = this.props.organization;

        let name = typeof(user) !== "undefined"? user.name: "";
        let avatarUrl = typeof(organization) !== "undefined"
            && organization !== null
            && (typeof(organization.organizationLogoUrl) !== "undefined" || organization.organizationLogoUrl.indexOf('https') === -1) ? organization.organizationLogoUrl: "/static/images/default-user.png";

        const schoolClass = location.pathname === "/admin/" || location.pathname.match(/^\/admin\/school/) ? "nav-link active" : "nav-link";
        const subjectClass = location.pathname.match(/^\/admin\/subject/) ? "nav-link active" : "nav-link";
        const chapterClass = location.pathname.match(/^\/admin\/chapter/) ? "nav-link active" : "nav-link";

        return (
            <div className="header-cms">
                <header>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-9">
                                <nav className="navbar navbar-expand-lg navbar-light justify-content-center">
                                    <a className="navbar-brand" href="/admin/school">
                                        <img src="/static/images/app-logo-cms.png"
                                            srcSet="/static/images/app-logo-cms@2x.png 2x"
                                            alt="School CMS Dashboard" />
                                    </a>
                                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                                        <span className="navbar-toggler-icon"></span>
                                    </button>
                                    <div className="collapse navbar-collapse" id="navbarNav">
                                        <ul className="navbar-nav">
                                        <li className="nav-item">
                                            <Link className={schoolClass} to="/admin/school" activeClassName="active">Create School</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={subjectClass} to="/admin/subject" activeClassName="active">Create Subject</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={chapterClass} to="/admin/chapter" activeClassName="active">Create Chapter</Link>
                                        </li>
                                        </ul>
                                    </div>
                                </nav>
                            </div>
                            <div className="col-3 d-flex align-items-center justify-content-end">
                                <div className="username text-right mr-2 pr-2 border-right d-flex align-items-center justify-content-center">
                                    <span className="show-name text-secondary">{name}</span>
                                    <img className="rounded-circle" src={avatarUrl} width="40px" />
                                </div>    
                                <div className="ic-signout">
                                <a href="/logout"><i className="fa fa-sign-out text-secondary"></i></a></div>           
                            </div>
                        
                        </div>
                        
                    </div>
                
                </header>

                {/* <div className="btn-group" role="group" aria-label="Basic example">
                    <div type="" className="">
                        dsfsdf
                    Left</div>
                    <div type="" className="btn btn-primary">Middle</div>
                    <div type="" className="btn btn-primary">Right</div>
                </div> */}
            </div>
        )
    }
}
