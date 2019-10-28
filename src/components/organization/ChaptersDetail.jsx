import React from "react";
import Header from "./Header";

import BaseSchoolPage from "../common/BaseSchoolPage";

import StudentPieChart from "../chart/StudentPieChart";
import ScoreBarChart from "../chart/ScoreBarChart";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

import firebase from "../../firebase";
let db = firebase.firestore();

import swal from "sweetalert";

const CollectionConfig = require('../../config/collection.json');

class ChaptersDetail extends BaseSchoolPage {
    constructor(props) {
        super(props);

        let chapterId = this.props.params.chapterId;

        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .get()
            .then((doc) => {

                var chapter = {
                    id: doc.id,
                    subjectId: doc.data().subjectId,
                    subjectName: doc.data().subjectName || doc.data().subjectId,
                    chapterCode: doc.data().chapterCode,
                    chapterName: doc.data().chapterName,
                    chapterLevel: doc.data().chapterLevel,
                    chapterScore: doc.data().chapterScore,
                    chapterQuiz: doc.data().chapterQuiz,
                    chapterObjective: doc.data().chapterObjective,
                    chapterAssessment: doc.data().chapterAssessment,
                    chapterCoverUrl: doc.data().chapterCoverUrl,
                    totalChallenge: doc.data().totalChallenge,
                    isDelete: doc.data().isDelete
                };

                this.setState({
                    chapter: chapter
                })
            });

        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .get()
            .then((querySnapshot) => {
                let challenges = [];
                console.log(querySnapshot)
                querySnapshot.forEach((doc) => {
                    challenges[doc.data().challengeCode] = {
                        id: doc.id,
                        chapterId: doc.data().chapterId,
                        subjectId: doc.data().subjectId,
                        challengeCode: doc.data().challengeCode,
                        challengeName: doc.data().challengeName,
                        challengeLevel: doc.data().challengeLevel,
                        challengeScore: doc.data().challengeScore,
                        challengeQuiz: doc.data().challengeQuiz,
                        challengeObjective: doc.data().challengeObjective,
                        challengeAssessment: doc.data().challengeAssessment,
                        challengeCoverUrl: doc.data().challengeCoverUrl,
                        stat: {},
                        isDelete: doc.data().isDelete
                    };

                });

                console.log('challenges', challenges)

                this.setState({
                    challenges: challenges
                })
            });



        this.state = {
            organization: null,
            chapterId: chapterId,
            chapter: {stat: {}},
            challenges: {},
            demographics: {labels: [], data: []},
            scoreRange: {labels: [], data: []}

        }

    }

    componentWillUpdate(nextProps, nextState) {

        var self = this;
        if (this.state.organization == null && nextState.user) {

            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        self.setState({
                            'organization':  doc.data(),
                        })

                    }
                })

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .get()
                .then((doc) => {

                    if (doc.exists) {
                        var chapter =  self.state.chapter;
                        chapter.stat = doc.data().stat;

                        this.setState({
                            chapter: chapter
                        })
                    }
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .get()
                .then((querySnapshot) => {
                    let challenges = self.state.challenges;
                    console.log(querySnapshot)
                    querySnapshot.forEach((doc) => {
                        challenges[doc.id].stat = doc.data().stat;
                    });

                    this.setState({
                        challenges: challenges
                    })
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHAPTER_STAT)
                .doc('demographics')
                .get()
                .then((doc) => {

                    if (typeof(doc.data()) !== 'undefined' && typeof(doc.data().values) !== 'undefined') {
                        var item = {
                            labels: Object.keys(doc.data().values),
                            data: Object.values(doc.data().values),
                        };

                        this.setState({
                            demographics: item
                        })
                    }

                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.STUDENT)
                .get()
                .then((querySnapshot) => {


                    var data = {}
                    querySnapshot.forEach((doc) => {
                        let key = doc.data().totalScore+"";
                        if (key == 'undefined') { key = 0; }

                        if (typeof(data[key]) == "undefined") {
                            data[key] = 1
                        } else {
                            data[key] += 1
                        }
                    });

                    var labels = [];
                    var scoreData = [];
                    Object.keys(data).forEach(function (key) {
                        labels.push(key);
                        scoreData.push(data[key]);
                    });

                    this.setState({
                        scoreRange: {labels: labels, data: scoreData}
                    })

                });



        }


    }



    render() {
        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }

        return (
            <div className="bg-light mh-100vh">
                <Header user={this.state.user} organization={this.state.organization} />
                <div className="container pb-2">
                    <div className="row justify-content-between">
                        <div className="col-lg-9">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"> <Link to={`/chapter/`}>รวมคอร์ส</Link></li>
                                    <li className="breadcrumb-item"> <Link to={`/chapter/?subjectId=${this.state.chapter.subjectId}`}>{this.state.chapter.subjectName}</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">{this.state.chapter.chapterName}</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-lg-3">
                            <div className="float-right">

                                <Link to={`/chapter/${this.state.chapterId}/export/?file=xls`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                    XLS</Link>
                                <Link to={`/chapter/${this.state.chapterId}/export/?file=csv`} target="_blank"  className="btn btn-download btn-sm ic-export">
                                    CSV</Link>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="bg-white py-4 mb-3">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="row">
                                    <div className="col-lg-4">
                                        <img
                                            className="img-fluid"
                                            src={typeof(this.state.chapter.chapterCoverUrl) === 'undefined' || this.state.chapter.chapterCoverUrl.indexOf('https') === -1 ? "/static/images/default-chapter.png": this.state.chapter.chapterCoverUrl}
                                            alt={this.state.chapter.chapterName} />
                                    </div>
                                    <div className="col-lg-8">
                                        <div>Chapter</div>
                                        <h3>{this.state.chapter.chapterName}</h3>
                                        <div>วิชา: {this.state.chapter.subjectName}</div>
                                        <div>ระดับความรู้: {this.state.chapter.chapterLevel}</div>
                                        <div>จำนวนข้อ: {this.state.chapter.chapterQuiz} ข้อ</div>
                                        <div>จำนวนบทย่อย: {this.state.chapter.totalChallenge} ชาเล้นจ์</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="icon-item icon-start">
                                            <strong>เริ่มเรียน</strong>
                                            {typeof(this.state.chapter.stat) !== 'undefined' && typeof(this.state.chapter.stat.totalStart) !== 'undefined'? <span>{this.state.chapter.stat.totalStart} คน</span>: <span>- คน</span>}
                                        </div>
                                        <div className="icon-item icon-finish">
                                            <strong>เรียนจบ</strong>
                                            {typeof(this.state.chapter.stat) !== 'undefined'&& typeof(this.state.chapter.stat.totalComplete) !== 'undefined'? <span>{this.state.chapter.stat.totalComplete} คน</span>: <span>- คน</span>}
                                        </div>
                                        <div className="icon-item icon-route">
                                            <strong>อัตราเรียนจบ</strong>
                                            {typeof(this.state.chapter.stat) !== 'undefined'&& typeof(this.state.chapter.stat.totalComplete) !== 'undefined'? <span>{(this.state.chapter.stat.totalComplete*100/this.state.chapter.stat.totalStart).toFixed(2)} %</span>: <span>- %</span>}
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="icon-item icon-top">
                                            <strong>คะแนนเต็ม</strong>
                                            <span>{this.state.chapter.chapterScore} คะแนน</span>
                                        </div>
                                        <div className="icon-item icon-top1">
                                            <strong>คะแนนเฉลี่ย</strong>
                                            {typeof(this.state.chapter.stat) !== 'undefined'&& typeof(this.state.chapter.stat.avgScore) !== 'undefined'? <span>{typeof(this.state.chapter.stat.avgScore) === 'undefined'? '-':this.state.chapter.stat.avgScore.toFixed(2)} คะแนน</span>: <span>- คะแนน</span>}
                                        </div>
                                        <div className="icon-item icon-piechart">
                                            <strong>อัตราคะแนนเฉลี่ย</strong>
                                            {typeof(this.state.chapter.stat) !== 'undefined'&& typeof(this.state.chapter.stat.avgScorePercent) !== 'undefined'? <span>{typeof(this.state.chapter.stat.avgScorePercent) === 'undefined'? '-':this.state.chapter.stat.avgScorePercent.toFixed(2)} %</span>: <span>- %</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 d-flex">
                            <div className="card shadow-none mb-3 flex-fill">
                                <div className="card-body">
                                    <h3 className="card-title ic-intelligence d-flex align-items-center">Learning Objectives</h3>
                                    <div className="">
                                        {typeof(this.state.chapter.chapterObjective) === 'undefined'? '': this.state.chapter.chapterObjective.split('\n').map((item, key) => {
                                            return <span>{item}<br/></span>
                                        })}
                                    </div>
                                    {/* Graph */}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 d-flex">
                            <div className="card shadow-none mb-3 flex-fill">
                                <div className="card-body">
                                    <h3 className="card-title ic-outcome d-flex align-items-center">
                                     Assessment Outcome</h3>
                                     <div className="">
                                         {typeof(this.state.chapter.chapterAssessment) === 'undefined'? '': this.state.chapter.chapterAssessment.split('\n').map((item, key) => {
                                             return <span>{item}<br/></span>
                                         })}
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-6 d-flex">
                            <div className="card shadow-none mb-3 flex-fill">
                                <div className="card-body">
                                    <h3 className="card-title ic-diamond d-flex align-items-center">Demographics</h3>
                                    <div className="px-3">
                                        <StudentPieChart data={this.state.demographics}/>
                                    </div>
                                    {/* Graph */}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 d-flex">
                            <div className="card shadow-none mb-3 flex-fill">
                                <div className="card-body">
                                    <h3 className="card-title ic-team d-flex align-items-center">Scores</h3>
                                    <div className="px-3">
                                        <ScoreBarChart data={this.state.scoreRange}/>
                                    </div>
                                    {/* Graph */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="clearfix"></div>
                    <div className="table-responsive mt-3 pb-5">
                        <h3 className="card-title ic-game d-flex align-items-center">Challenges</h3>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col" className="w-25">ชาเล้นจ์</th>
                                    <th scope="col">ระดับความรู้</th>
                                    <th scope="col">จำนวนควิซ</th>
                                    <th scope="col">คะแนนเต็ม</th>
                                    <th scope="col">คะแนนเฉลี่ย</th>
                                    <th scope="col">เริ่มเรียน</th>
                                    <th scope="col">เรียนจบ</th>

                                </tr>
                            </thead>
                            <tbody>
                            {
                                Object.keys(this.state.challenges).map((key, i) =>
                                        <tr>
                                            <td>
                                                <div className="img-thumb">
                                                    <img
                                                    width="44"
                                                    src={typeof(this.state.challenges[key].challengeCoverUrl) === 'undefined' || this.state.challenges[key].challengeCoverUrl.indexOf('https') === -1? "/static/images/default-chapter.png": this.state.challenges[key].challengeCoverUrl}
                                                    alt={this.state.challenges[key].challengeName} />
                                                </div>
                                                </td>
                                            <td>{i+1}</td>
                                            <td>{this.state.challenges[key].challengeName}</td>
                                            <td>{this.state.challenges[key].challengeLevel}</td>
                                            <td className="text-center">{this.state.challenges[key].challengeQuiz}</td>
                                            <td className="text-center">{this.state.challenges[key].challengeScore}</td>
                                            <td className="text-center">{typeof(this.state.challenges[key].stat.avgScore) === 'undefined'? '-': this.state.challenges[key].stat.avgScore.toFixed(2)}</td>
                                            <td className="text-center">{typeof(this.state.challenges[key].stat.totalStart) === 'undefined'? '-':this.state.challenges[key].stat.totalStart}</td>
                                            <td className="text-center">{typeof(this.state.challenges[key].stat.totalComplete) === 'undefined'? '-':this.state.challenges[key].stat.totalComplete}</td>
                                            <td className="text-center">
                                                <Link to={`/chapter/${this.state.chapterId}/challenge/${this.state.challenges[key].id}/detail`} className="btn btn-outline btn-sm ic-search">รายละเอียด</Link>
                                            </td>
                                        </tr>)
                            }
                            </tbody>
                        </table>
                        <div className="text-center d-none">
                            <button className="btn btn-radius mb-4">See more</button>
                        </div>
                    </div>

                </div>

            </div>
        );
    }
}

export default ChaptersDetail;
