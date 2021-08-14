import React from 'react';
import { XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, DiscreteColorLegend } from "react-vis";
import 'react-vis/dist/style.css';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import Typography from '@material-ui/core/Typography';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import ReactDOM from 'react-dom';

import './index.css';




class InputForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);


  }
  handleSliderChange(e, newValue) {
    this.props.onValueChange(newValue);
  }

  handleInputChange(e) {
    this.props.onValueChange(e.target.value === '' ? '' : Number(e.target.value));
  }

  handleBlur(e) {
    if (e.target.value < 0) {
      this.props.onValueChange(0);
    } else if (e.target.value > 1000000) {
      this.props.onValueChange(1000000);
    }
  };

  render() {
    const value = this.props.value;
    return (
      <div className="root">
        <Typography id="input-slider" gutterBottom>
          {this.props.id} [{this.props.units}]
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={value}
              onChange={this.handleSliderChange}
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid item>
            <Input
              className="input"
              value={value}
              margin="dense"
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              inputProps={{
                step: 1,
                min: 0,
                max: 1000000,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Grid>
        </Grid>
      </div >
    );
  }
}

function floorN(value, n) {
  return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n)
}

function VoltOutput(props) {
  const resistance = props.resistance;
  const power = props.power;
  const deltaTime = props.deltaTime * 0.000001;
  const capa = props.capa * 0.000001;
  const tau = resistance * capa;
  return (
    <div>
      <p className="formula">
        Euler's method: <TeX>{String.raw`v(t+Δt) = \text{${floorN(1 - deltaTime / tau, 3)}} \cdot v(t) + \text{${floorN(deltaTime / tau * power, 3)}}`}</TeX>
      </p>
      <p className="formula">
        Laplace's transform method: <TeX>{String.raw`v(t) = \text{${power}} \cdot ( 1 - e^{-\frac{t}{\text{${floorN(tau, 4)}}}})`}</TeX>
      </p>
    </div>
  )
}

function dataCal(resistance, Capa, power, DeltaTime) {
  const capa = Capa * 0.000001;
  const deltaTime = DeltaTime * 0.000001;
  const tau = resistance * capa
  let data = [
    { x: 0, y: 0 }
  ];
  for (let i = 1; i < 101; i++) {
    data.push({ x: deltaTime * i * 1000, y: ((1 - deltaTime / tau) * data[i - 1].y + deltaTime * power / tau) }) //x:[ms] y:[V]  xはμsからmsにするために*1000している
  }
  return data;
}

function dataCalH(resistance, Capa, power, DeltaTime) {
  const capa = Capa * 0.000001;
  const deltaTime = DeltaTime * 0.000001;
  const tau = resistance * capa
  let data = [
    { x: 0, y: 0 }
  ];
  for (let i = 1; i < 101; i++) {
    let t = deltaTime * i;
    data.push({ x: t * 1000, y: power * (1 - Math.exp(-1 * t / tau)) }) //x:[ms] y:[V]  xはμsからmsにするために*1000している
  }
  return data;
}



function GraphView(props) {
  const HEIGHT = 300;
  const WIDTH = 800;
  return (
    <XYPlot className="graph" height={HEIGHT} width={WIDTH}>
      <DiscreteColorLegend
        items={["Euler's method", "Laplace's transform method"]}
        orientation="horizontal"
      />
      <XAxis top={HEIGHT - 50} orientation="bottom" title="[ms]" tickTotal={10} />
      <YAxis left={0} title="[V]" />
      <LineSeries data={props.data1} />
      <LineSeries data={props.data2} />
      <VerticalGridLines />
      <HorizontalGridLines />
    </XYPlot>
  )
}


class Management extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      resistance: 0,
      capa: 0,
      power: 0,
      deltaTime: 0
    };
  }

  handleChange(item, newValue) {
    this.setState((state) => {
      return {
        [item]: newValue
      }
    });
  }



  render() {
    const arr = [
      ['resistance', 'Ω'],
      ['capa', 'μF'],
      ['power', 'V'],
      ['deltaTime', 'μs']
    ]
    return (
      <div >
        <h1 className="title">Response voltage of RC series circuit v(t)</h1>
        <GraphView
          arr={arr}
          data1={dataCal(
            Number(this.state.resistance),
            Number(this.state.capa),
            Number(this.state.power),
            Number(this.state.deltaTime)
          )}
          data2={dataCalH(
            Number(this.state.resistance),
            Number(this.state.capa),
            Number(this.state.power),
            Number(this.state.deltaTime)
          )}
        />
        {
          arr.map(item =>
            <InputForm
              onValueChange={newValue => this.handleChange(item[0], newValue)}
              id={item[0]}
              units={item[1]}
              value={this.state[[item[0]]]}
              key={item[0]}
            />
          )
        }
        < VoltOutput
          resistance={Number(this.state.resistance)}
          capa={Number(this.state.capa)}
          power={Number(this.state.power)}
          deltaTime={Number(this.state.deltaTime)}
        />
      </div >

    )
  }
}



ReactDOM.render(
  <Management />,
  document.getElementById('root')
);
