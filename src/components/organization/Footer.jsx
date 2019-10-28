import React from "react";


class Footer extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div className="footer bg-dark text-white py-2 d-flex align-items-center">
            <div className="container">
              <div className="row">
                  <div className="col text-left">© School (Thailand) Co. Ltd.</div>
                  <div className="col text-right"><a href="mailto:hello@school.co.th">hello@school.co.th</a></div>
              </div>
            </div>
          </div>
        );
    }
}

export default Footer;