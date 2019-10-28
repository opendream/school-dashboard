import React from "react";


import {Bar, Pie} from 'react-chartjs-2';
import BeatLoader from 'react-spinners/BeatLoader';

class ScoreBarChart extends React.Component {
    constructor(props) {
        super(props);

        const data = {
            labels: [],
            datasets: [
                {
                    label: 'จำนวนคน',
                    backgroundColor: '#607AD3',
                    borderColor: '#607AD3',
                    borderWidth: 1,
                    hoverBackgroundColor: '#607AD3',
                    hoverBorderColor: '#607AD3',
                    data: []
                }
            ]
        };

        const legendOpts = {
            display: false
        };

        const options = {
            responsive: true,
            scales: {
                xAxes: [
                    {
                        display: true,
                        gridLines: {
                            display: false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'คะแนน'
                        }
                    }
                ],
                yAxes: [
                    {
                        display: true,
                        gridLines: {
                            display: false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'คน'
                        },
                        ticks: {
                            beginAtZero:true,
                        }
                    }
                ],
            }
        };


        this.state = {
            data: data,
            legend: legendOpts,
            options: options,
            isLoading: true,
            isShow: false
        }
    }


    componentDidUpdate() {
        if (typeof(this.props.data.labels) == 'undefined'
            || this.props.data.labels.length == 0
            || this.state.isUpdate) {

            if (this.props.data.labels.length == 0 && this.state.isLoading) {
                this.setState({
                    isLoading: false,
                });
            }
            return;
        }

        var data =  {
            labels: this.props.data.labels,
            datasets: [
                {
                    label: 'จำนวนคน',
                    backgroundColor: '#607AD3',
                    borderColor: '#607AD3',
                    borderWidth: 1,
                    hoverBackgroundColor: '#607AD3',
                    hoverBorderColor: '#607AD3',
                    data: this.props.data.data
                }
            ]
        };

        console.log(data);

        this.setState({
            data: data,
            isUpdate: true,
            isLoading: false,
            isShow: this.props.data.data.length > 0
        });

    }

    render() {
        return (
            <div className=" align-items-center">
                <div className=" align-items-center">
                    {
                        this.state.isLoading ?
                            <div className="text-center" style={{'margin': '150px'}}>
                                <BeatLoader
                                    sizeUnit={"px"}
                                    size={30}
                                    color={'#6c6c6d'}
                                    loading={this.state.loading}
                                />
                            </div> : <div>{this.state.isShow ? <Bar data={this.state.data} height={100} legend={this.state.legend} options={this.state.options} height="150"/> :<div>ยังไม่มีข้อมูล</div>}</div>
                    }
                </div>

            </div>
        );
    }
}

export default ScoreBarChart;