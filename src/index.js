import ReactDOM from 'react-dom';
import React from 'react';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from './stores/configureStores';
import routes from './routes';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} />
  </Provider>, document.getElementById('root')
);

// components/app.js
import React from 'react';
import { Jumbotron, Row, Col} from 'reactstrap';
import NavigationBar from './navigationBar';
import Users from '../containers/userList';

export default class App extends React.Component {
    render() {
      return (
         <div>
            <NavigationBar/>
            <Jumbotron>
                  <Row className="show-grid">
                      <Col xs={6} md={2}></Col>
                      <Col xs={6} md={8}>
                          <h2 className="text-center">Our Employees</h2>
                      </Col>
                      <Col md={2}></Col>
                  </Row>
                  <Users />
            </Jumbotron>
         </div>
      );
   }
}


//components/employeeCards
import React from 'react';
import { Card, CardImg, CardText,
  CardTitle, CardSubtitle, Button, Container, Row,CardBody } from 'reactstrap';
import EmployeeDetailModal from './employeeDetail';

class EmployeeCard extends React.Component {
  // console.log('From Card ===>');
  //
  constructor(props) {
    super(props);
    this.thisModal = true;
    this.toggle = this.toggle.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  toggle() {
    console.log('OPEN being called upon clicking on button');
    this.thisModal = !this.thisModal;
    // console.log(this.props.cardId);
    this.props.toggle(this.props.cardId);

  }

  closeModal() {
    this.props.closeModal(this.props.cardId);
  }


  render() {
    const {card, modal, className, cardId} = this.props;
    console.log(modal, cardId);
    const isOpen = modal === cardId? true: false;
    console.log('isOpen ==> ', isOpen);
    return (
      <Card body>
        <CardImg top width="100%" src={card.avatar} alt="Card image cap" />
        <CardBody>
          <CardTitle>{`${card.firstName} ${card.lastName}`}</CardTitle>
          <CardText>{`${card.bio.substr(0,50)}...`}</CardText>
          <Button color="success" block onClick={this.toggle}>View Detail</Button>
          <EmployeeDetailModal
            modal={isOpen}
            className={className}
            toggle={this.closeModal}
            card={card}

          />
        </CardBody>
      </Card>

    );
  }

};

export default EmployeeCard;


//components/employeeDetails
/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Media, Col, Row  } from 'reactstrap';

const  EmployeeDetailModal = (props) => {
    console.log('From EmployeeDetailModal ===>');
    console.log(props);
    const {card} = props;
    let dateJoined = new Date(card.dateJoined);

    dateJoined = `${dateJoined.getDay()}-${dateJoined.getMonth()}-${dateJoined.getFullYear()}`;
    return (
        <Modal isOpen={props.modal} toggle={props.toggle} className={props.className} backdrop={true}>

          <ModalBody>
            <Media>
              <Col xs="3" sm="4">
              <Media left top >
                  <Row>
                    <Media object src={`${card.avatar}`} alt="Generic placeholder image" />
                  </Row>
                  <Row>
                    <font size="1px">{card.jobTitle}</font>
                  </Row>
                  <Row>
                    {card.age}
                  </Row>
                  <Row>
                    {dateJoined}
                  </Row>

              </Media>
              </Col>
              <Col xs="9" sm="8">
              <Media body>
                <Media heading>
                  {`${card.firstName} ${card.lastName}`}
                </Media>
                  {card.bio}
              </Media>
              </Col>
            </Media>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={props.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
    );
}

export default EmployeeDetailModal;


//components/navigationBar.js

import React from 'react';
import PropTypes from 'prop-types';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink, Row } from 'reactstrap';

const NavBar = (props) =>  {
  console.log('From Component/nav ===>');
  console.log(props);
  const {isLoading, companyInfo } = props;
  if(!isLoading) {
    let establishedDate  = new Date(companyInfo.companyEst);
    establishedDate = `${establishedDate.getDay()}/${establishedDate.getMonth()}/${establishedDate.getFullYear()}`;
    return (
      <div>
        <Navbar color="dark" className="navbar-dark navbar-expand-sm" toggleable light expand="md">
          <NavbarBrand >
            <Row>
              <font color="white">{companyInfo.companyName}</font>
            </Row>
            <Row>
              <font color="white">{companyInfo.companyMotto}</font>
            </Row>
          </NavbarBrand>
          <Nav className="ml-auto" pills>
            <NavItem>
              <font color="white">Estd: {establishedDate}</font>
            </NavItem>
          </Nav>
        </Navbar>
      </div>
    );
  } else {
    return (<div>
      Loading...
    </div>)

  }

};

export default NavBar;


//config/config.js

import  _ from 'lodash';
import defaultconfig from '../env/default/app-config.json';
import localconfig from '../env/local/app-config.json';

const Config = (() => {

    let context = {
        export: {}
    };
    let pipeline = [

        () => (context) => {
            context.defaults = defaultconfig;
        },
        () => (context) => {
            context.file = localconfig || {};
        },
        () => (context) => {
            context.result = _.merge(context.defaults, context.file);
        },
        ({parseEnvValue}) => (context) => {
            let recurse = (baseKey, object) => {
                // console.log(object);
                _.forEach(object, (value, key) => {
                    // console.log(key);
                    let envKey = baseKey + '_' + key.replace(/([A-Z]+)/g, '$1').toUpperCase();
                    if (_.isPlainObject(value)) {
                        recurse(envKey, value);
                    } else {
                        let val = process.env[envKey];
                        if (val) {
                            object[key] = parseEnvValue(val,
                                _.isArray(object[key]));
                        }
                    }
                });
            }
            recurse('BATCH', context.result);
        },

        (...arg) => (context) => {
            if (process.env.NODE_ENV) {
                context.result.env = process.env.NODE_ENV;
            }
        },
    ];


    /**
     * @description {Config Class for generating configuration}
     *
     * @class Config
     * @extends {Yaml(Lodash(File))}
     */
    class Config  {

        constructor() {
            _.forEach(pipeline, (step) => {
                step(this)(context);
            });
        }

        getConfig() {
            if (context && context.hasOwnProperty('result')) {
                return context.result;
            } else {
                return {};
            }
        }

        parseEnvValue(value, isArray) {
            value = value.trim();
            if (isArray) {
                return this.map(value.split(','), function(value) {
                    return this.parseEnvValue(value);
                });
            } else if (/^(y|yes|true|on)$/i.test(value)) {
                return true;
            } else if (/^(n|no|false|off)$/i.test(value)) {
                return false;
            } else if (/^[+-]?\d+.?\d*$/.test(value) &&
                !isNaN(parseInt(value, 10))) {
                return parseInt(value, 10);
            }
            return value;
        }
    };
    return Config;
})();

let { getConfig } = new Config();
export const configuration = getConfig();


//config/index.js
import {configuration} from './config';
const {sourceappconfig } = configuration;
console.log(sourceappconfig);
export const companyInfo = `${sourceappconfig.protocol}://${sourceappconfig.hostname}:${sourceappconfig.port}/${sourceappconfig.basepath}${sourceappconfig.uripaths.companyInfo}`;
export const employees = `${sourceappconfig.protocol}://${sourceappconfig.hostname}:${sourceappconfig.port}/${sourceappconfig.basepath}${sourceappconfig.uripaths.employees}`;


// constants/index.js
import {companyInfo, employees } from '../config';
// console.log(companyInfo, employees);
export const COMPANYINFO_URL = companyInfo;
export const EMPLOYEE_URL = employees;



//container/employeeDetail.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import EmployeeDetailModal from '../components/employeeDetail';
import { actions as modalActions } from '../redux/modules/appmodal.module';


class EmployeeDetail extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.props.modalActionClose();
  }

  render() {
    console.log('From EmployeeDetail() ===>');
    console.log(this.props.state);
    return (
      <EmployeeDetailModal
        modal={this.props.modal}
        toggle={this.toggle}
      />

    )

  }

}

export default connect(
  state => ({
    config: state.config,
    modal: state.modal,
    state
  }),
  {
    modalActionClose: modalActions.app.modal.close
  }
)(EmployeeDetail);


//container/navigationBar.js

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as configActions } from '../redux/modules/appconfig.module';
import NavigationBar from '../components/navigationBar';

class NavBar extends Component {
  constructor(props) {
    super(props);

  }
  componentDidMount() {
    this.props.requestPageConfig();
  }

  render() {
      console.log('from container/Nav ==>');
      console.log(this.props);
      const {config, state} = this.props
      let isLoading = true;

      if(config && config.companyInfo) {
        isLoading = false;
        return (
          <NavigationBar
            isLoading={isLoading}
            companyInfo={config.companyInfo}
          />
        )
      } else {
        return (
          <NavigationBar
            isLoading={isLoading}
          />
        )
      }

  }

}

export default connect(
  state => ({
    config: state.config,
    isLoading: state.isLoading,
    state
  }),
  {
    requestPageConfig: configActions.app.config.request
  }
)(NavBar);


//container/userList.js

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Container, Row, Col,CardDeck  } from 'reactstrap';
import EmployeeCard from '../components/employeeCard';
import { actions as configActions } from '../redux/modules/appconfig.module';
import { actions as modalActions } from '../redux/modules/appmodal.module';
import _ from 'lodash';
import uuid from 'uuid/v1';


class Users extends Component {

  constructor(props) {
    super(props);
    console.log('From Users constructor ===>');
    console.log(this.props.state);
    this.modal = this.props.modal;
    this.toggle = this.toggle.bind(this);
    this.closeModal = this.closeModal.bind(this);

  }

  toggle(arg) {
    this.props.modalActionOpen(arg);
  }

  closeModal(arg) {
    this.props.modalActionClose(arg)
  }


  componentDidMount() {
    this.props.requestPageConfig();
  }

  renderRow(employees, rowIndex){
    console.log('From renderRow ==>');
    // console.log(employees);
    let {modal}  = this.props;
    if(employees) {
      return employees.map( (employee,index) => {
        if(employee) {
          return (
            <EmployeeCard
              key = {uuid()}
              cardId={`${rowIndex}_${index}`}
              card={employee}
              className={employee.firstName + index}
              toggle={this.toggle}
              modal={modal}
              closeModal={this.closeModal}
            />
          )
        }
      });
    } else {
      return (
        <Col xs="6" sm="4">
          Loading...
        </Col>
      )
    }


  }

    renderList() {
      // console.log('From Employee List ===>');
      // console.log(this.props);
      const config = this.props.config;

      if(config.isLoading === false && config.employeesInfo) {
        const employees = config.employeesInfo;
        const employeesRows = _.chunk(employees, 4);
        return employeesRows.map((employeesRow, index) => {
          return (
            <Row key={uuid()}>
              <CardDeck >
                {this.renderRow(employeesRow, index)}
              </CardDeck>
            </Row>

          )
        });
      } else  {
        return (
          <Col xs="6" sm="4">
            Loading...
          </Col>
        )
      }

    }

    render(){
      return (
        <div>
          {this.renderList()}
        </div>
      );
    }
}


export default connect(
  state => ({
    config: state.config,
    modal:state.modal,
    state: state
  }),
  {
    requestPageConfig: configActions.app.config.request,
    modalActionOpen: modalActions.app.modal.open,
    modalActionClose: modalActions.app.modal.close
  }
)(Users);



