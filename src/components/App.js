import '../css/styles.css';
import React from 'react';
//eslint-disable-next-line
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Modal from 'react-responsive-modal';
import axios from 'axios';
import logo from '../assets/logo.png';
import data from '../assets/data.json';
import loader from '../assets/Rolling-1s-200px.svg';

const URL_SUSC_CHECK = 'http://lander2.casiposible.com/Services/intertronmobile.asmx/isSuscript';
const URL_ADD_POINTS = 'http://lander2.casiposible.com/Services/intertronmobile.asmx/AddPoints';
const URL_PORTAL = 'http://py.clanmacabro.com/?icode=CduMwcMLDnyjDPCDWksNLmhOf5h9WT4FlUglJ87pSQ';
const config = {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
    }
}


class App extends React.Component {
    state = {
        canplay: false,
        trivia: false,
        randomTrivia: [],
        current: 0,
        timeStart: 0,
        timeEnd: 0,
        points: 0,
        keyword: 0,
        service: '',
        shortnumber: 0,
        idtrivia: 0,
        open: false,
        open2: false
    }

    onOpenModal = () => {
        this.setState({ open: true });
    };
    
    onCloseModal = () => {
        this.setState({ open: false });
        this.handleBtnContinue();
    };

    onCloseModal2 = () => {
        this.setState({ open: false });
        window.location.reload();
    }

    componentWillMount = () => {
        this.setState({
                keyword: localStorage.getItem('keyword'),
                service: localStorage.getItem('service'),
                shortnumber: localStorage.getItem('shortnumber'),
                idtrivia: localStorage.getItem('idtrivia'),
        }, () => {
            axios.post(URL_SUSC_CHECK,
                {
                    trivia_id: parseInt(this.state.idtrivia, 10),
                    keyword: this.state.keyword,
                    servicio: parseInt(this.state.service, 10)  
                }, config)
                .then(result => {
                    if(result.data.d == 1){
                        this.setState({
                            canplay: true
                        })
                    }else if(result.data.d == 2){
                        this.setState({
                            canplay: true,
                            open2: true
                        });
                    }
                    else if(result.data.d == 0){
                        window.location.href = URL_PORTAL;
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        });
    }

    componentDidMount = () => {
        let timeStart = Date.now(); 
        const shuffled = data.sort(() => 0.5 - Math.random());
        let randomTrivia = shuffled.slice(0, 5);
        this.setState(
            {
                randomTrivia,
                timeStart,
            }
        );
    }

    checkAnswer = (currentQuestion, answer) => {
        if(this.state.current >= (this.state.randomTrivia.length - 1)){
            let timeEnd = Date.now();
            let tiempoTrivia = (timeEnd - this.state.timeStart) / 1000;
            axios.post(
                URL_ADD_POINTS,
                {
                    trivia_id: parseInt(this.state.idtrivia, 10),
                    keyword: this.state.keyword,
                    tiempoTrivia,
                    puntos: parseInt(this.state.points, 10)  
                }).then(result => {
                    console.log(result);
                    this.setState({open: true});
                })
        }else{
            let points = 0;
            if(currentQuestion.answer === answer){
                points = this.state.points + 1000;
            }
            else{
                points = this.state.points +  500;
            }
            this.setState({
                points,
                current: this.state.current + 1
            });
        }
        
    }

    parseString = stringData => {
        return ReactHtmlParser(stringData);
    }

    renderTrivia = () => {
        let currentQuestion = this.state.randomTrivia[this.state.current];
        return (
            <div className="ans-ques-container">
                <span className="progress">Pregunta {this.state.current+1} de 5</span>
                <span className="points-obtained">{this.state.points} puntos</span>
                <div className="question-container">
                    {this.parseString(currentQuestion.question)}
                </div>
                <div className="answer-container">
                    <div className="buttons-container">
                        <span className="btnTrue" onClick={() => this.checkAnswer(currentQuestion, true)}>VERDADERO</span>
                        <span className="btnFalse" onClick={() => this.checkAnswer(currentQuestion, false)}>FALSO</span>
                    </div>
                </div>
                <span className="btn-continue" onClick={this.handleBtnContinue}>Ir a Clan Macabro</span>
            </div>
        );
    }

    handleBtnContinue = () => {
        window.location.href = URL_PORTAL;
    }

    renderComponent = () => {
        if(this.state.randomTrivia.length > 0){
            return this.renderTrivia();
        }
        return this.rendeloader();
    }

    renderWelcome = () => {
        return (
            <div className="welcome">
                <span className="btn-start" onClick={() => this.setState({trivia: true})}>Comezar</span>
            </div>
        );
    }

    renderFooter = () => {
        return (
            <span className="footer">
              COPYRIGHT ©2016 CLAN MACABRO. ALL RIGHTS RESERVED - TÉRMINOS Y CONDICIONES - POLITICA DE CANCELACIÓN DEL SERVICIO  
            </span>
        );
    }

    handleWifiContinue = () => {
        this.onCloseModal2();
    }

    gameAccess= () => {
        if(this.state.canplay){
            const { open, open2 } = this.state;
            return (
                <div className="container">
                    <Modal 
                        open={open} 
                        onClose={this.onCloseModal} 
                        center
                        focusTrapped={false}
                        showCloseIcon={false}
                    >
                        <h2>Felicitaciones</h2>
                        <div className="modal-info-container">
                            <span 
                                className="points-text">
                                    Sumaste <span className="points">{this.state.points} </span>puntos
                            </span>
                            <span 
                                className="btn-continue-from-modal"
                                onClick={() => this.onCloseModal()}>Ok</span>
                        </div>
                    </Modal>
                    <Modal
                        open={open2} 
                        onClose={this.onCloseModal2} 
                        center
                        focusTrapped={false}
                        showCloseIcon={false}
                    >
                        <div className="modal-wifi-check">
                            <span>Para continuar, desactive su WiFi</span>
                            <span className="btn-wifi" onClick={() => this.handleWifiContinue()}>Continuar</span>
                        </div>
                    </Modal>
                    <header>
                        <img src={logo} alt="Clan Macabro" id="logo" />
                        <div className="red-bar"></div>
                    </header>
                    <span 
                        className="main-text">
                            ¡¡Bienvenido a la promo de Clan Macabro, te llevamos al festival de San Sebastian 2019!!
                    </span>
                    <span 
                        className="sub-title">Responde las preguntas y suma puntos</span>
                    {this.renderComponent()}
                    {this.renderFooter()}
                </div>
            );
        }
        return this.rendeloader();
    }

    rendeloader = () => {
        return <div className="loader-container"><img src={loader} alt="Clan Macabro" /></div>
    }

    render() {
        return this.gameAccess();
    }
}

export default App;