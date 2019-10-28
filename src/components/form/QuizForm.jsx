import React from "react";


class QuizForm extends React.Component {
    constructor(props) {
        super(props);

        let newQuiz = this.props.newQuiz;

        let state = {
            newQuiz: newQuiz,
            newChoices: [{choice: "", isCorrect: false, score: ""}],
            errors: '',
        };


        this.state = state
    }

    componentWillReceiveProps(props) {
        let newQuiz = props.newQuiz;

        let newChoices = newQuiz.choices || [{choice: "", isCorrect: false, score: ""}];
        console.log(newQuiz);


        let state = {
            'newQuiz': newQuiz,
            'newChoices': newChoices,
            'newQuiz.quizId': newQuiz.quizId || "",
            'newQuiz.quizQuestion': newQuiz.quizQuestion || "",
            'errors': '',
        };

        newChoices.forEach(function (choice, i) {
            state['newChoice.choiceId.' +i] = choice.choiceId;
            state['newChoice.choice.' +i] = choice.choice;
            state['newChoice.isCorrect.' +i] = choice.isCorrect;
            state['newChoice.score.' +i] = choice.score;
        });

        console.log(state);

        this.state = state
    }

    onChange(e) {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    onSetChange(e, i) {

        const { name, value, type, checked } = e.target;


        let key = name + '.' + i;
        let state = {
            [key]: value,
        };


        if (type === 'checkbox') {
            state = {
                [key]: checked,
            };
        }

        this.setState(state)
    }

    onAddQuestion(e) {
        var newChoices = this.state.newChoices || [];
        if (newChoices.length >= 6) return;
        newChoices.push({choice: "", isCorrect: false, score: ""});

        this.setState({
            newChoices: newChoices
        })
    }

    onSubmitQuiz(e) {
        e.preventDefault()

        let quiz = {
            quizId: this.state['newQuiz.quizId'],
            quizQuestion: this.state['newQuiz.quizQuestion'],
            isDelete: false
        };


        var errors = [];

        if (typeof(quiz.quizId) === 'undefined' || quiz.quizId === '') {
            errors.push('quizId is required.')
        }

        if (typeof(quiz.quizQuestion) === 'undefined' || quiz.quizQuestion === '') {
            errors.push('quizQuestion is required.')
        }


        if (errors.length > 0) {
            this.setState({
                'errors': errors,

            });
            return true;
        }

        var choices = [];
        for (var i =0; i< 6; i++) {
            console.log('choices');

            if (!(typeof(this.state['newChoice.choiceId.'+i]) === "undefined" || typeof(this.state['newChoice.choiceId.'+i]) === "") &&
                !(typeof(this.state['newChoice.choice.'+i]) === "undefined" || typeof(this.state['newChoice.choice.'+i]) === "") &&
                !(typeof(this.state['newChoice.score.'+i]) === "undefined" || typeof(this.state['newChoice.score.'+i]) === "")) {
                var item = {
                    'id': this.state['newChoice.choiceId.'+i],
                    'choiceId': this.state['newChoice.choiceId.'+i],
                    'choice': this.state['newChoice.choice.'+i],
                    'isCorrect': this.state['newChoice.isCorrect.'+i] || false,
                    'score': this.state['newChoice.score.'+i]  || 0
                };

                choices.push(item);
            }


        };
        quiz['choices'] = choices;
        console.log('choices', choices);
        console.log('quiz', quiz);

        this.props.onSubmitQuiz(e, quiz);
        return true
    }


    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        { this.state.errors.length > 0?  <ul className="alert alert-warning">
                            {this.state.errors.map((error, i) => <li>{ error }</li>)}
                        </ul>: <ul></ul>}
                    </div>

                    <div className="container">
                        <div className="row">
                            <div className="col-6">
                                <div className="form-group">
                                    <label htmlFor="">Quiz Question</label>
                                    <input type="text" className="form-control" id="" name="newQuiz.quizQuestion" onChange={(e) =>this.onChange(e)} value={this.state['newQuiz.quizQuestion']}/>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="form-group">
                                    <label htmlFor="inputcover">Quiz ID</label>
                                    <input type="text" className="form-control" id="" name="newQuiz.quizId" onChange={(e) =>this.onChange(e)} value={this.state['newQuiz.quizId']}/>
                                </div>
                            </div>
                        </div>
                        {
                            this.state.newChoices.map((choice, i) =>
                                <div className="row">
                                    <div className="col-2">
                                        <div className="form-group">
                                            <label htmlFor="">Quiz Choice Id { (i+1) }</label>
                                            <input type="text" className="form-control" id=""  name={`newChoice.choiceId`} onChange={(e) =>this.onSetChange(e, i)} value={this.state[`newChoice.choiceId.${i}`]}/>
                                        </div>
                                    </div>
                                    <div className="col-5">
                                        <div className="form-group">
                                            <label htmlFor="">Quiz Choice { (i+1) }</label>
                                            <input type="text" className="form-control" id=""  name={`newChoice.choice`} onChange={(e) =>this.onSetChange(e, i)} value={this.state[`newChoice.choice.${i}`]}/>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="form-group">
                                            <label htmlFor="">True/False?</label>
                                            <input type="checkbox" className="form-control" id=""  name={`newChoice.isCorrect`}  onChange={(e) =>this.onSetChange(e, i)} checked={this.state[`newChoice.isCorrect.${i}`]} value={this.state[`newChoice.isCorrect.${i}`]}/>
                                        </div>
                                    </div>
                                    <div className="col-2">
                                        <div className="form-group">
                                            <label htmlFor="">Score</label>
                                            <input type="number" className="form-control" id=""  name={`newChoice.score`}  onChange={(e) =>this.onSetChange(e, i)} value={this.state[`newChoice.score.${i}`]}/>
                                        </div>
                                    </div>
                                </div>)
                        }
                        <p><button type="button" className="btn btn-link" onClick={(e) => this.onAddQuestion(e)}>+ Add Choice</button></p>
                        <a className="btn btn-primary" onClick={(e) => this.onSubmitQuiz(e)}>บันทึก</a>

                    </div>


                </div>
            </div>

        );
    }
}

export default QuizForm;
