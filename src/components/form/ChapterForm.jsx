import React from "react";


class ChapterForm extends React.Component {
    constructor(props) {
        super(props);

        let newChapter = this.props.newChapter;

        this.state = {
            newChapter: newChapter,
            errors: '',
        }
    }

    componentWillReceiveProps(props) {
        let newChapter = props.newChapter;

        console.log(newChapter);

        this.state = {
            'newChapter': newChapter,
            'chapterCoverUrl': newChapter.chapterCoverUrl,
            'newChapter.chapterName': newChapter.chapterName || "",
            'newChapter.chapterCode': newChapter.chapterCode || "",
            'newChapter.chapterLevel': newChapter.chapterLevel || "",
            'newChapter.chapterScore': newChapter.chapterScore || "",
            'newChapter.chapterQuiz': newChapter.chapterQuiz || "",
            'newChapter.chapterObjective': newChapter.chapterObjective || "",
            'newChapter.chapterAssessment': newChapter.chapterAssessment || "",
            'newChapter.subjectId': newChapter.subjectId || "",
            'errors': '',
        }
    }

    onChange(e) {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    onSubmitChapter(e) {
        e.preventDefault()

        let chapter = {
            chapterName: this.state['newChapter.chapterName'],
            chapterCode: this.state['newChapter.chapterCode'],
            chapterLevel: this.state['newChapter.chapterLevel'],
            chapterScore: this.state['newChapter.chapterScore'],
            chapterQuiz: this.state['newChapter.chapterQuiz'],
            chapterObjective: this.state['newChapter.chapterObjective'],
            chapterAssessment: this.state['newChapter.chapterAssessment'],
            chapterCoverUrl: this.state.newChapter.chapterCoverUrl,
            subjectId: this.state['newChapter.subjectId'],
            subjectName: "",
            isDelete: false
        };

        console.log("Here", chapter)

        var errors = [];

        if (typeof(chapter.chapterName) === 'undefined' || chapter.chapterName === '') {
            errors.push('chapterName is required.')
        }

        if (typeof(chapter.chapterCode) === 'undefined' || chapter.chapterCode === '') {
            errors.push('chapterCode is required.')
        }

        if (typeof(chapter.chapterLevel) === 'undefined' || chapter.chapterLevel === '') {
            errors.push('chapterLevel is required.')
        }

        if (typeof(chapter.chapterScore) === 'undefined' || chapter.chapterScore === '') {
            errors.push('chapterScore is required.')
        }

        if (typeof(chapter.chapterQuiz) === 'undefined' || chapter.chapterQuiz === '') {
            errors.push('chapterQuiz is required.')
        }

        if (typeof(chapter.subjectId) === 'undefined' || chapter.subjectId === '') {
            errors.push('subjectId is required.')
        }

        if (typeof(chapter.chapterObjective) === 'undefined' || chapter.chapterObjective === '') {
            errors.push('chapterObjective is required.')
        }

        if (typeof(chapter.chapterAssessment) === 'undefined' || chapter.chapterAssessment === '') {
            errors.push('chapterAssessment is required.')
        }

        if (errors.length > 0) {
            this.setState({
                'errors': errors,

            });
            return true;
        }

        let subjectName = ""
        this.props.contents.forEach(function (content) {
            if (content.id === chapter.subjectId) {
                subjectName = content.subjectName;
                return;
            }
        });

        if (subjectName == "") {
            chapter['subjectName'] = chapter.subjectId;
        } else {
            chapter['subjectName'] = subjectName;

        }

        var chapterCover =  this.state['newChapter.chapterCover'];
        this.props.onSubmitChapter(e, chapter, chapterCover);
        return true
    }

    changeCover() {
        const file = document.querySelector('#coverFile').files[0];

        console.log("file", file.name);
        this.setState({
            'chapterCoverName': file.name,
            'newChapter.chapterCover': file
        });
    }

    render() {
        return (
            <div className="">
                {!this.props.isCreated ? <h2 className="card-title text-green ic-plus">Create Chapter</h2>: <h2 className="card-title text-primary ic-edit">Edit Chapter</h2>}
                <div className="row">
                    <div className="col-12">
                        { this.state.errors.length > 0?  <ul className="alert alert-warning">
                            {this.state.errors.map((error, i) => <li>{ error }</li>)}
                        </ul>: <ul></ul>}
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputchapterID">Chapter ID</label>
                            <input type="text" className="form-control" id="inputchapterID" name="newChapter.chapterCode" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.chapterCode']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputcover">Chapter Cover</label>
                            <div className="custom-file mb-3">
                                <input type="file" className="custom-file-input" id="coverFile" name="filename" onChange={(e) => this.changeCover(e)}/>
                                <label className="custom-file-label" htmlFor="customFile">{typeof(this.state.chapterCoverName) == 'undefined'? 'Attach file (Photo)': this.state.chapterCoverName}</label>
                                {typeof(this.state.chapterCoverUrl) === 'undefined'?<small></small>:<small><a href={this.state.chapterCoverUrl} target="_blank">{this.state.chapterCoverUrl}</a></small>}
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputchapterName">Chapter Name</label>
                            <input type="text" className="form-control" id="inputchapterName" name="newChapter.chapterName" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.chapterName']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="selectsubject">Subject</label>
                            <select className="form-control" id="selectsubject" name="newChapter.subjectId" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.subjectId']}>
                                <option value="">--select--</option>
                                {
                                    this.props.contents.map((content, i) =>
                                        <option value={content.id}>{content.subjectName}</option>
                                    )
                                }
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label for="inputchapterLevel">Chapter Level (ระดับความยากง่าย)</label>
                            <input type="text" className="form-control" id="inputchapterLevel"  name="newChapter.chapterLevel" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.chapterLevel']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputTotalScore">Chapter Total Score (คะแนนเต็ม)</label>
                            <input type="number" className="form-control" id="inputTotalScore"  name="newChapter.chapterScore" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.chapterScore']} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label for="inputchapterQuizNo">Chapter Quiz No. (จำนวนข้อ)</label>
                            <input type="number" className="form-control" id="inputchapterQuizNo"  name="newChapter.chapterQuiz" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.chapterQuiz']} />
                        </div>
                    </div>
                    <div className="col-6"></div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="inputObjectives">Chapter Learning Objectives</label>
                            <textarea className="form-control" id="inputObjectives" rows="5"  name="newChapter.chapterObjective" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.chapterObjective']}></textarea>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label for="inputOutcome">Chapter Assessment Outcome</label>
                            <textarea className="form-control" id="inputOutcome" rows="5"  name="newChapter.chapterAssessment" onChange={(e) =>this.onChange(e)} value={this.state['newChapter.chapterAssessment']}></textarea>
                        </div>
                    </div>
                </div>
                {!this.props.isCreated ?  <a href="#" className="btn btn-green" onClick={(e) => this.onSubmitChapter(e)}>Create</a>:  <a href="#" className="btn btn-primary" onClick={(e) => this.onSubmitChapter(e)}>บันทึก</a>}

            </div>

        );
    }
}

export default ChapterForm;
