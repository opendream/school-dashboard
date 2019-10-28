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

class ChallengeDetail extends BaseSchoolPage {
    constructor(props) {
        super(props);

        let chapterId = this.props.params.chapterId;
        let challengeId = this.props.params.challengeId;

        let self = this;

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
            .doc(challengeId)
            .get()
            .then((doc) => {
                let challenge  = {
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

                self.setState({
                    'challenge': challenge
                })
            });


        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challengeId)
            .collection(CollectionConfig.QUIZ)
            .orderBy('quizId')
            .get()
            .then((querySnapshot) => {
                let questions = {};
                querySnapshot.forEach((doc) => {
                    var quizId = doc.data().quizId;

                    questions[quizId] = {
                        id: doc.id,
                        chapterId: doc.data().chapterId,
                        subjectId: doc.data().subjectId,
                        challengeId: challengeId,

                        quizId: doc.data().quizId,
                        quizQuestion: doc.data().quizQuestion,
                        isDelete: doc.data().isDelete,

                        choices: [],
                        totalChoices: 0
                    };

                    db.collection(CollectionConfig.CHAPTER)
                        .doc(chapterId)
                        .collection(CollectionConfig.CHALLENGE)
                        .doc(challengeId)
                        .collection(CollectionConfig.QUIZ)
                        .doc(quizId)
                        .collection(CollectionConfig.CHOICE)
                        .orderBy('isCorrect', 'desc')
                        .get()
                        .then((querySnapshot) => {
                            let choices = {};
                            let questions = self.state.quiz;

                            let totalChoices = 0;
                            querySnapshot.forEach((doc) => {
                                var item = {
                                    id: doc.id,
                                    choice: doc.data().choice || "",
                                    isCorrect: doc.data().isCorrect || false,
                                    score:  doc.data().score || "",

                                };

                                choices[doc.id] = (item);
                                totalChoices += 1
                            });

                            questions[quizId].choices = choices;
                            questions[quizId].totalChoices = totalChoices;

                            this.setState({
                                quiz: questions
                            })

                        });


                });

                this.setState({
                    quiz: questions
                })
            });



        this.state = {
            organization: null,
            challengeId:challengeId,
            chapterId: chapterId,
            chapter: {},
            challenge: {stat:{}},
            finishedStudent: [],
            unFinishedStudent: [],
            quiz: [],
            errors: '',
            currentQuestion: "",
            demographics: {labels: [], data: []},
            scoreRange: {labels: [], data: []}
        }
    }

    componentWillUpdate(nextProps, nextState) {

        $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip();
        });

        var self = this;

        let chapterId = this.state.chapterId;
        let challengeId = this.state.challengeId;


        if (this.state.organization == null && nextState.user) {

            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        self.setState({
                            'organizationId': organizationId,
                            'organization':  doc.data(),
                        })

                    }
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(this.state.chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(this.state.challengeId)
                .get()
                .then((doc) => {
                    let challenge = self.state.challenge;
                    if (doc.exists) {
                        challenge.stat = doc.data().stat;

                        self.setState({
                            'challenge':  challenge,
                        })

                    }

                });

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(challengeId)
                .collection(CollectionConfig.STUDENT)
                .where("isCompleted", "==", true)
                .get()
                .then((querySnapshot) => {

                    this.setState({
                        totalFinishedStudent: querySnapshot.size,
                    })
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(challengeId)
                .collection(CollectionConfig.STUDENT)
                .where("isCompleted", "==", true)
                .orderBy("studentId")
                .limit(5)
                .get()
                .then((querySnapshot) => {
                    let student = [];
                    var latestFinishedId = null;
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            firstName: doc.data().firstName,
                            lastName: doc.data().lastName,
                            studentId: doc.data().studentId,
                            latestQuizId: doc.data().latestQuizId,
                            totalScore: doc.data().totalScore,
                            avatarUrl: doc.data().avatarUrl,
                            isCompleted: doc.data().isCompleted
                        };


                        student.push(item);
                        latestFinishedId =  doc.data().studentId;
                    });


                    this.setState({
                        currentFinishedStudent: 5,
                        latestFinishedId: latestFinishedId,
                        finishedStudent: student
                    })
                });

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(challengeId)
                .collection(CollectionConfig.STUDENT)
                .where("isCompleted", "==", false)
                .get()
                .then((querySnapshot) => {

                    this.setState({
                        totalUnFinishedStudent: querySnapshot.size,
                    })
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(challengeId)
                .collection(CollectionConfig.STUDENT)
                .where("isCompleted", "==", false)
                .orderBy("studentId")
                .limit(5)
                .get()
                .then((querySnapshot) => {
                    let student = [];
                    let latestUnFinishedId = null;
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            firstName: doc.data().firstName,
                            lastName: doc.data().lastName,
                            studentId: doc.data().studentId,
                            totalScore: doc.data().totalScore,
                            avatarUrl: doc.data().avatarUrl,
                            latestQuizId: doc.data().latestQuizId,
                            isCompleted: doc.data().isCompleted
                        };

                        student.push(item);

                        latestUnFinishedId = doc.data().studentId;
                    });

                    this.setState({
                        currentUnFinishedStudent: 5,
                        latestUnFinishedId: latestUnFinishedId,
                        unFinishedStudent: student
                    })
                });



            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(challengeId)
                .collection(CollectionConfig.CHALLENGE_STAT)
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
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(challengeId)
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

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .doc(challengeId)
                .collection(CollectionConfig.QUIZ)
                .get()
                .then((querySnapshot) => {
                    let questions = self.state.quiz;

                    querySnapshot.forEach((doc) => {
                        var choiceStat = doc.data().choiceStat;
                        var totalEvent = doc.data().totalEvent;
                        console.log('choiceStat', choiceStat)

                        if (typeof(choiceStat) !== 'undefined') {
                            Object.keys(choiceStat).forEach(function (key) {
                                questions[doc.id].choices[key]['value'] = choiceStat[key] * 100/ totalEvent;
                            });
                        }
                    });


                    this.setState({
                        quiz: questions
                    })

                });


        }


    }


    loadFinishedStudent() {
        var self = this;

        let organizationId = this.state.organizationId;

        let chapterId = this.state.chapterId;
        let challengeId = this.state.challengeId;

        let latestFinishedId = this.state.latestFinishedId;
        let currentFinishedStudent = this.state.currentFinishedStudent;

        console.log(organizationId, chapterId, challengeId)

        db.collection(CollectionConfig.ORGANIZATION)
            .doc(organizationId)
            .collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challengeId)
            .collection(CollectionConfig.STUDENT)
            .where("isCompleted", "==", true)
            .where("studentId", ">", latestFinishedId)
            .orderBy("studentId")
            .limit(5)
            .get()
            .then((querySnapshot) => {
                let student = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        firstName: doc.data().firstName,
                        lastName: doc.data().lastName,
                        studentId: doc.data().studentId,
                        latestQuizId: doc.data().latestQuizId,
                        totalScore: doc.data().totalScore,
                        isCompleted: doc.data().isCompleted
                    };

                    student.push(item);
                    currentFinishedStudent += 1;
                });


                this.setState({
                    currentFinishedStudent: currentFinishedStudent,
                    latestFinishedId: latestFinishedId,
                    finishedStudent: student
                })
            });


    }

    loadUnFinishedStudent() {
        var self = this;

        let organizationId = this.state.organizationId;

        let chapterId = this.state.chapterId;
        let challengeId = this.state.challengeId;

        let latestUnFinishedId = this.state.latestUnFinishedId;
        let currentUnFinishedStudent = this.state.currentUnFinishedStudent;

        db.collection(CollectionConfig.ORGANIZATION)
            .doc(organizationId)
            .collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challengeId)
            .collection(CollectionConfig.STUDENT)
            .where("isCompleted", "==", true)
            .where("studentId", ">", latestFinishedId)
            .orderBy("studentId")
            .limit(5)
            .get()
            .then((querySnapshot) => {
                let student = [];
                querySnapshot.forEach((doc) => {
                    var item = {
                        id: doc.id,
                        firstName: doc.data().firstName,
                        lastName: doc.data().lastName,
                        studentId: doc.data().studentId,
                        latestQuizId: doc.data().latestQuizId,
                        totalScore: doc.data().totalScore,
                        isCompleted: doc.data().isCompleted
                    };

                    student.push(item);
                    currentUnFinishedStudent += 1;
                });


                this.setState({
                    currentUnFinishedStudent: currentUnFinishedStudent,
                    latestUnFinishedId: latestUnFinishedId,
                    unFinishedStudent: student
                })
            });


    }

    renderCurrentQuestion(quiz) {
        this.setState({
            currentQuestion: quiz,
        })
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
                                    <li className="breadcrumb-item"><Link to={`/chapter/`}>รวมคอร์ส</Link></li>
                                    <li className="breadcrumb-item"><Link to={`/chapter/?subjectId=${this.state.chapter.subjectId}`}>{this.state.chapter.subjectName}</Link></li>
                                    <li className="breadcrumb-item"><Link to={`/chapter/${this.state.chapter.chapterCode}/detail`}>Chapter {this.state.chapter.chapterName}</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Challenge {this.state.challenge.challengeName}</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-lg-3">
                            <div className="float-right">

                                <Link to={`/chapter/${this.state.chapterId}/challenge/${this.state.challengeId}/export/?file=xls`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                    XLS</Link>
                                <Link to={`/chapter/${this.state.chapterId}/challenge/${this.state.challengeId}/export/?file=csv`} target="_blank"  className="btn btn-download btn-sm ic-export">
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
                                            src={typeof(this.state.challenge.challengeCoverUrl) === 'undefined' || this.state.challenge.challengeCoverUrl.indexOf('https') === -1? "/static/images/default-chapter.png": this.state.challenge.challengeCoverUrl}
                                            alt={this.state.challenge.challengeName} />
                                    </div>
                                    <div className="col-lg-8">
                                        <div>Challenge</div>
                                        <h3>{this.state.challenge.challengeName}</h3>
                                        <div>บทเรียน: {this.state.chapter.chapterName}</div>
                                        <div>ระดับความรู้: {this.state.challenge.challengeLevel}</div>
                                        <div>จำนวนข้อ: {this.state.challenge.challengeQuiz} ข้อ</div>
                                        <div>จำนวนบทย่อย: {this.state.challenge.challengeScore} คะแนน</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="icon-item icon-start">
                                            <strong>เริ่มเรียน</strong>
                                            {typeof(this.state.challenge.stat) !== 'undefined' && typeof(this.state.challenge.stat.totalStart) !== 'undefined'? <span>{this.state.challenge.stat.totalStart} คน</span>: <span>- คน</span> }
                                        </div>
                                        <div className="icon-item icon-finish">
                                            <strong>เรียนจบ</strong>
                                            {typeof(this.state.challenge.stat) !== 'undefined' && typeof(this.state.challenge.stat.totalComplete) !== 'undefined'? <span>{this.state.challenge.stat.totalComplete} คน</span>: <span>- คน</span> }
                                        </div>
                                        <div className="icon-item icon-route">
                                            <strong>อัตราเรียนจบ</strong>
                                            {typeof(this.state.challenge.stat) !== 'undefined' && typeof(this.state.challenge.stat.totalComplete) !== 'undefined'? <span>{(this.state.challenge.stat.totalComplete * 100 /this.state.challenge.stat.totalStart).toFixed(2)} %</span>: <span>- %</span> }
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="icon-item icon-top">
                                            <strong>คะแนนเต็ม</strong>
                                            <span> {this.state.challenge.challengeScore}  คะแนน</span>
                                        </div>
                                        <div className="icon-item icon-top1">
                                            <strong>คะแนนเฉลี่ย</strong>
                                            <span>{typeof(this.state.challenge.stat.avgScore) == 'undefined'? '-': this.state.challenge.stat.avgScore.toFixed(2)} คะแนน</span>
                                        </div>
                                        <div className="icon-item icon-piechart">
                                            <strong>อัตราคะแนนเฉลี่ย</strong>
                                            <span>{typeof(this.state.challenge.stat.avgScorePercent) == 'undefined'? '-': this.state.challenge.stat.avgScorePercent.toFixed(2)} %</span>
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
                                        {typeof(this.state.challenge.challengeObjective) === 'undefined'? '': this.state.challenge.challengeObjective.split('\n').map((item, key) => {
                                            return <span>{item}<br/></span>
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 d-flex">
                            <div className="card shadow-none mb-3 flex-fill">
                                <div className="card-body">
                                    <h3 className="card-title ic-outcome d-flex align-items-center">
                                     Assessment Outcome</h3>
                                     <div className="">
                                         {typeof(this.state.challenge.challengeAssessment) === 'undefined'? '': this.state.challenge.challengeAssessment.split('\n').map((item, key) => {
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
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="table-responsive my-3">
                        <h3 className="card-title ic-line-chart d-flex align-items-center mb-0">Learning Statistics</h3>
                        <table className="table table-hover table-answer mt-0">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col" className="w-50"></th>
                                    <th scope="col">Correct</th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col">ดูละเอียด</th>
                                    
                                </tr>
                            </thead>
                            <tbody>
                            {
                                Object.keys(this.state.quiz).map((key, i) =>
                                <tr>
                                    <td>{this.state.quiz[key].quizId}</td>
                                    <td>{this.state.quiz[key].quizQuestion}</td>
                                    {
                                        Object.keys(this.state.quiz[key].choices).map((choiceKey, i) =>
                                            this.state.quiz[key].choices[choiceKey].isCorrect?
                                            <td>
                                                <div className="ans-point ans-point--correct" data-toggle="tooltip" title={this.state.quiz[key].choices[choiceKey].choice}>
                                                    <a href="#" data-toggle="modal" data-target="#viewStat">
                                                        {typeof(this.state.quiz[key].choices[choiceKey].value) !== 'undefined'? this.state.quiz[key].choices[choiceKey].value.toFixed(2): '0.0' }
                                                    </a></div>
                                            </td>:
                                            <td>
                                                <div className="ans-point" data-toggle="tooltip" title={this.state.quiz[key].choices[choiceKey].choice}>
                                                    {typeof(this.state.quiz[key].choices[choiceKey].value) !== 'undefined'? this.state.quiz[key].choices[choiceKey].value.toFixed(2): '0.0' }
                                                </div>
                                            </td>
                                    )}
                                    {
                                        [...Array(6 - this.state.quiz[key].totalChoices).keys()].map((choice, i) =>
                                            <td><div className="ans-point">-</div></td>
                                        )
                                    }
                                    <td><a data-toggle="modal" data-target="#viewStat" className="btn btn-outline ic-search" onClick={(e)=> this.renderCurrentQuestion(key)}></a></td>
                                </tr>
                                )
                            }
                            </tbody>
                        </table>
                        <div className="small">
                        * % ระบุถึงสัดส่วนผู้เรียนที่เลือกตอบข้อนั้นๆ<br />
                        * สีเขียว หมายถึง ข้อที่ถูกต้อง
                        </div>
                    </div>

                    <div className="clearfix"></div>
                    <div className="row mt-4">
                        <div className="col-lg-6">
                            <div className="table-responsive mt-3 pb-5">
                                <h3 className="card-title ic-complete d-flex align-items-center mb-0">{this.state.totalFinishedStudent} Finished Learners</h3>
                                <table className="table table-hover text-left">
                                    <thead>
                                        <tr>
                                            <th scope="col" colSpan="2">เรียนจบแล้ว</th>
                                            <th scope="col"></th>
                                            <th scope="col" colSpan="2">คะแนนที่ได้</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.finishedStudent.map((student, i) =>
                                            <tr>
                                                <td className="text-center">#{i+1}</td>
                                                <td className="text-center">
                                                    <img className="img-cover"
                                                         src="/static/images/default-user.png"
                                                         src={typeof(student.avatarUrl) === 'undefined' || student.avatarUrl.indexOf('https') === -1 ? "/static/images/default-user.png": student.avatarUrl}
                                                         alt={ student.firstName } />
                                                </td>
                                                <td>{student.firstName} {student.lastName}</td>
                                                <td className="text-center">{student.totalScore}</td>
                                                <td className="text-center">
                                                    <Link to={`/user/${student.id}/detail`} className="btn btn-outline btn-sm ic-search">รายละเอียด</Link>
                                                </td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                </table>
                                {
                                    this.state.finishedStudent.length == 0? <div className="text-center" style={{'padding-bottom': '20px'}}>ยังไม่มีข้อมูล</div>:<span></span>
                                }
                                <div className={"text-center mb-4 " + (this.state.currentFinishedStudent >= this.state.totalFinishedStudent ? 'd-none' : '')}>
                                    <button className="btn btn-radius mb-1" onClick={(e) => this.loadFinishedStudent()}>See more</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="table-responsive mt-3 pb-5">
                                <h3 className="card-title ic-pause d-flex align-items-center mb-0">{this.state.totalUnFinishedStudent} Unfinished Learners</h3>
                                <table className="table table-hover text-left">
                                    <thead>
                                        <tr>
                                            <th scope="col" colSpan="3">เริ่มเรียนแล้ว (แต่ยังไม่จบ)</th>
                                            <th scope="col" colSpan="2">ข้อล่าสุด</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.unFinishedStudent.map((student, i) =>
                                            <tr>
                                                <td className="text-center">#{i+1}</td>
                                                <td className="text-center">
                                                    <img className="img-cover"
                                                         src="/static/images/default-user.png"
                                                         src={typeof(student.avatarUrl) === 'undefined' || student.avatarUrl.indexOf('https') === -1 ? "/static/images/default-user.png": student.avatarUrl}
                                                         alt={ student.firstName } />
                                                </td>
                                                <td>{student.firstName} {student.lastName}</td>
                                                <td className="text-center">{student.latestQuizId}</td>
                                                <td className="text-center">
                                                    <Link to={`/user/${student.id}/detail`} className="btn btn-outline btn-sm ic-search" >รายละเอียด</Link>
                                                </td>
                                            </tr>
                                        )
                                    }

                                    </tbody>
                                </table>
                                {
                                    this.state.unFinishedStudent.length == 0? <div className="text-center" style={{'padding-bottom': '20px'}}>ยังไม่มีข้อมูล</div>:<span></span>
                                }
                                <div className={"text-center mb-4 " + (this.state.currentUnFinishedStudent >= this.state.totalUnFinishedStudent ? 'd-none' : '')}>
                                    <button className="btn btn-radius mb-1" onClick={(e) => this.loadUnFinishedStudent()}>See more</button>
                                </div>

                            </div>
                        </div>
                    </div>
                    
                </div>

                {
                    typeof(this.state.quiz) !== 'undefined' && typeof(this.state.quiz[this.state.currentQuestion]) !== 'undefined'?
                        <div className="modal fade" id="viewStat">
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="card-title text-primary mb-0">{this.state.quiz[this.state.currentQuestion].quizQuestion}</h2>
                                        <button type="button" className="close" data-dismiss="modal">×</button>
                                    </div>
                                    <div className="modal-body">
                                        {
                                            Object.keys(this.state.quiz[this.state.currentQuestion].choices).map((choiceKey, i) =>
                                                this.state.quiz[this.state.currentQuestion].choices[choiceKey].isCorrect?
                                                    <div className="row text-success">
                                                        <div className="col-lg-4 font-weight-bold">
                                                            Choice ที่ถูกต้อง
                                                        </div>
                                                        <div className="col-lg-2">{typeof(this.state.quiz[this.state.currentQuestion].choices[choiceKey].value) !== 'undefined'? this.state.quiz[this.state.currentQuestion].choices[choiceKey].value.toFixed(2): '-' }</div>
                                                        <div className="col-lg-4"><p>{this.state.quiz[this.state.currentQuestion].choices[choiceKey].choice}</p></div>
                                                    </div>:
                                                    <div className="row">
                                                        <div className="col-lg-4">
                                                            Choice อื่นๆ
                                                        </div>
                                                        <div className="col-lg-2">{typeof(this.state.quiz[this.state.currentQuestion].choices[choiceKey].value) !== 'undefined'? this.state.quiz[this.state.currentQuestion].choices[choiceKey].value.toFixed(2): '-' }</div>
                                                        <div className="col-lg-4"><p>{this.state.quiz[this.state.currentQuestion].choices[choiceKey].choice}</p></div>
                                                    </div>

                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>: <div></div>
                }


                
            </div>
        );
    }
}

export default ChallengeDetail;