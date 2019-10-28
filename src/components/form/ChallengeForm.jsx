import React from "react";


class ChallengeForm extends React.Component {
    constructor(props) {
        super(props);

        let newChallenge = this.props.newChallenge;

        this.state = {
            newChallenge: newChallenge,
            'challengeCoverUrl': newChallenge.challengeCoverUrl,
            'newChallenge.challengeName': newChallenge.challengeName || "",
            'newChallenge.challengeCode': newChallenge.challengeCode || "",
            'newChallenge.challengeLevel': newChallenge.challengeLevel || "",
            'newChallenge.challengeScore': newChallenge.challengeScore || "",
            'newChallenge.challengeQuiz': newChallenge.challengeQuiz || "",
            'newChallenge.challengeObjective': newChallenge.challengeObjective || "",
            'newChallenge.challengeAssessment': newChallenge.challengeAssessment || "",
            errors: '',
        }
    }

    componentWillReceiveProps(props) {
        let newChallenge = props.newChallenge;

        this.state = {
            'newChallenge': newChallenge,
            'challengeCoverUrl': newChallenge.challengeCoverUrl,
            'newChallenge.challengeName': newChallenge.challengeName || "",
            'newChallenge.challengeCode': newChallenge.challengeCode || "",
            'newChallenge.challengeLevel': newChallenge.challengeLevel || "",
            'newChallenge.challengeScore': newChallenge.challengeScore || "",
            'newChallenge.challengeQuiz': newChallenge.challengeQuiz || "",
            'newChallenge.challengeObjective': newChallenge.challengeObjective || "",
            'newChallenge.challengeAssessment': newChallenge.challengeAssessment || "",
            'errors': '',
        }
    }

    onChange(e) {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    onSubmitChallenge(e) {
        e.preventDefault()

        let challenge = {
            challengeName: this.state['newChallenge.challengeName'],
            challengeCode: this.state['newChallenge.challengeCode'],
            challengeLevel: this.state['newChallenge.challengeLevel'],
            challengeScore: this.state['newChallenge.challengeScore'],
            challengeQuiz: this.state['newChallenge.challengeQuiz'],
            challengeObjective: this.state['newChallenge.challengeObjective'],
            challengeAssessment: this.state['newChallenge.challengeAssessment'],
            challengeCoverUrl: this.state.newChallenge.challengeCoverUrl,
            isDelete: false
        };

        var errors = [];

        if (typeof(challenge.challengeName) === 'undefined' || challenge.challengeName === '') {
            errors.push('challengeName is required.')
        }

        if (typeof(challenge.challengeCode) === 'undefined' || challenge.challengeCode === '') {
            errors.push('challengeCode is required.')
        }

        if (typeof(challenge.challengeLevel) === 'undefined' || challenge.challengeLevel === '') {
            errors.push('challengeLevel is required.')
        }

        if (typeof(challenge.challengeScore) === 'undefined' || challenge.challengeScore === '') {
            errors.push('challengeScore is required.')
        }

        if (typeof(challenge.challengeQuiz) === 'undefined' || challenge.challengeQuiz === '') {
            errors.push('challengeQuiz is required.')
        }

        if (typeof(challenge.challengeObjective) === 'undefined' || challenge.challengeObjective === '') {
            errors.push('challengeObjective is required.')
        }

        if (typeof(challenge.challengeAssessment) === 'undefined' || challenge.challengeAssessment === '') {
                errrs.push('challengeAssessment is required.')
        }

        if (errors.length > 0) {
            this.setState({
                'errors': errors,

            });
            return true;
        }

        var challengeCover =  this.state['newChallenge.challengeCover'];
        this.props.onSubmitChallenge(e, challenge, challengeCover);
        return true
    }

    changeChallengeCover() {
        const file = document.querySelector('#challengeCoverFile').files[0];

        console.log("file", file.name);
        this.setState({
            'challengeCoverName': file.name,
            'newChallenge.challengeCover': file
        });
    }


    render() {
        return (
            <div className="container">
                <div className="row">
                    {!this.props.isCreated ? <div></div>: <h2 className="card-title text-primary ic-edit">Edit Challenge</h2>}

                    <div className="col-12">
                        { this.state.errors.length > 0?  <ul className="alert alert-warning">
                            {this.state.errors.map((error, i) => <li>{ error }</li>)}
                        </ul>: <ul></ul>}
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputchallengeID">Challenge ID</label>
                            <input type="text" className="form-control" id="inputchallengeID" name="newChallenge.challengeCode" onChange={(e) =>this.onChange(e)} value={this.state['newChallenge.challengeCode']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputcover">Challenge Cover</label>
                            <div className="custom-file mb-3">
                                <input type="file" className="custom-file-input" id="challengeCoverFile" name="filename" onChange={(e) => this.changeChallengeCover(e)}/>
                                <label className="custom-file-label" htmlFor="customFile">{typeof(this.state.challengeCoverName) == 'undefined'? 'Attach file (Photo)': this.state.challengeCoverName}</label>
                                {typeof(this.state.challengeCoverUrl) === 'undefined'?<small></small>:<small><a href={this.state.challengeCoverUrl} target="_blank">{this.state.challengeCoverUrl}</a></small>}
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputchallengeName">Challenge Name</label>
                            <input type="text" className="form-control" id="inputchallengeName" name="newChallenge.challengeName" onChange={(e) =>this.onChange(e)} value={this.state['newChallenge.challengeName']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label for="inputchallengeLevel">Challenge Level (ระดับความยากง่าย)</label>
                            <input type="text" className="form-control" id="inputchallengeLevel"  name="newChallenge.challengeLevel" onChange={(e) =>this.onChange(e)} value={this.state['newChallenge.challengeLevel']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputTotalScore">Challenge Total Score (คะแนนเต็ม)</label>
                            <input type="number" className="form-control" id="inputTotalScore"  name="newChallenge.challengeScore" onChange={(e) =>this.onChange(e)} value={this.state['newChallenge.challengeScore']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label for="inputchallengeQuizNo">Challenge Quiz No. (จำนวนข้อ)</label>
                            <input type="number" className="form-control" id="inputchallengeQuizNo"  name="newChallenge.challengeQuiz" onChange={(e) =>this.onChange(e)} value={this.state['newChallenge.challengeQuiz']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputObjectives">Challenge Learning Objectives</label>
                            <textarea className="form-control" id="inputObjectives" rows="5"  name="newChallenge.challengeObjective" onChange={(e) =>this.onChange(e)} value={this.state['newChallenge.challengeObjective']}></textarea>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label for="inputOutcome">Challenge Assessment Outcome</label>
                            <textarea className="form-control" id="inputOutcome" rows="5"  name="newChallenge.challengeAssessment" onChange={(e) =>this.onChange(e)} value={this.state['newChallenge.challengeAssessment']}></textarea>
                        </div>
                    </div>
                </div>
                {!this.props.isCreated ?  <a href="#" className="btn btn-green" onClick={(e) => this.onSubmitChallenge(e)}>Create</a>:  <a href="#" className="btn btn-primary" onClick={(e) => this.onSubmitChallenge(e)}>บันทึก</a>}

            </div>

        );
    }
}

export default ChallengeForm;
