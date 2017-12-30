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


//env/default/app-config.json

{
  "sourceappconfig" :{
    "basepath": "api/exp/employees/banker/v1/",
    "uripaths":{
      "companyInfo" : "companyInfo",
      "employees":"employees"
    }
  }
}


//env/local/app-config.json
{
  "sourceappconfig" :{
    "_comments" : "Change the hostname and port accordingly. If you are running config app fake api[<project>/fake-api] on local machine, please change it to localhost or 127.0.0.1",
    "protocol" : "http",
    "hostname" : "127.0.0.1",
    "port": "7000"
  }
}


//layout/app.js
import React from 'react';
import { Container, Row, Col} from 'reactstrap';
import NavigationBar from '../containers/navigationBar';
import Users from '../containers/userList';
import EmployeeDetail from '../containers/employeeDetail';

export default class App extends React.Component {
    render() {
      return (
         <div>
            <NavigationBar/>
            <Container fluid>
              <Row>
                <Col xs={12} md={12}>
                    <h2 className="text-center">Our Employees</h2>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={12}>

                </Col>
              </Row>


              <Users />

            </Container>
         </div>
      );
   }
}


//redux/middleware

import { actions as appconfigActions } from '../modules/contextHandover.module';

export default ({store, dispatch}) => next => action => {
  const { payload, type } = action;
  switch (type) {
    case appconfigActions.app.contextConfig.receive().type:
      if (!payload) {
        return next(action);
      }
      window.open(payload.redirectURL, '_blank');
      break;
    default:
      break;
  }

  if (next) next(action);
};


//redux/modules/appconfig.module.js

import { createActions, handleActions } from 'redux-actions';

export const actions = createActions({
  app: {
    config: {
      REQUEST: () => {},
      RECEIVE: config => ({ ...config }),
      ERROR: null,
    },
  },
});

export const reducer = handleActions(
  {
    [actions.app.config.request]: (state, action) => {
      console.log('actions.app.config.request ===>');
      console.log(state);
      return {
        isLoading: true
      }

    },
    [actions.app.config.receive]: (state, action) => {
      console.log('actions.app.config.receive ===>');
      console.log(state);
      console.log(action.payload);
      return {
        isLoading: false,
        ...action.payload,
      }

    },
    [actions.app.config.error]: (state, action) => ({}),
  },
  {}
);

export default reducer;


//redux/modules/appmodal.module.js
import { createActions, handleActions } from 'redux-actions';

export const actions = createActions({
  app: {
    modal: {
      OPEN: (payload) => {console.log(payload); return payload},
      CLOSE: () => ({}),
      ERROR: null,
    },
  },
});

export const reducer = handleActions(
  {
    [actions.app.modal.open]: (state, action) => {
      console.log('From actions.app.modal.open ==>');
      console.log(state);
      console.log(action.payload);
      return action.payload;

    },
    [actions.app.modal.close]: (state, action) => {
      console.log('From Modal Reducer ===>');
      console.log(state);
      return false;


    },
    [actions.app.modal.error]: (state, action) => ({}),
  },
  {}
);

export default reducer;


//redux/sagas/appconfig.saga.js

import { put, call, takeEvery } from 'redux-saga/effects';
import { actions } from '../modules/appconfig.module';
import {COMPANYINFO_URL,EMPLOYEE_URL} from '../../constant';
import { get } from '../../services/api';

export function* loadAppConfig() {
  try {
    const company = yield call(get, COMPANYINFO_URL);
    const companyInfo = company.data ? company.data : null;
    const comployees = yield call(get, EMPLOYEE_URL);
    const employeesInfo = comployees.data ? comployees.data: null;
    // console.log('From Saga =====>');
    // console.log(companyInfo,employeesInfo);
    yield put(actions.app.config.receive({companyInfo,employeesInfo}));
  } catch (error) {
    yield put(actions.app.config.error(error));
  }
}

export function* watchAppConfig() {
  yield takeEvery(actions.app.config.request().type, loadAppConfig);
}


//redux/sagas/index.js
import { all } from 'redux-saga/effects';
import { watchAppConfig } from './appconfig.saga';
// import { watchContextManagementConfig } from './contextHandover.saga';

export default function* rootSaga() {
  yield all([watchAppConfig()]);
}


//rootReducer.js

import { combineReducers } from 'redux';
import configReducer from './modules/appconfig.module';
import modalReducer from './modules/appmodal.module';


const rootReducer = combineReducers({
  isDevMode: () => process.env.NODE_ENV !== 'production',
  config: configReducer,
  modal: modalReducer
});

export default rootReducer;


//rootReducer.test.js

import { combineReducers } from 'redux';
import { createStore } from 'redux';

import rootReducer from './rootReducer';

import configReducer from './modules/appconfig.module';
import entitiesReducer from './modules/contextHandover.module';

describe('rootReducer', () => {
  let store = createStore(rootReducer);

  beforeEach(() => {
    store = createStore(rootReducer);
  });

  it('initial store state for the shape isDevMode in test should be true ', () => {
    expect(store.getState().isDevMode).toEqual(true);
  });

  it('initial store state for the shape config in test should be empty ', () => {
    expect(store.getState().config).toEqual(configReducer(undefined, {}));
  });

  it('initial store state for the shape entities in test should be empty ', () => {
    expect(store.getState().entities).toEqual(entitiesReducer(undefined, {}));
  });


});


//store.js

import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import wdpUIMiddleware from './middleware/wdpUIMiddleware';
import rootReducer from './rootReducer';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();
const defaultState = {};
const middlewares = [sagaMiddleware, wdpUIMiddleware];

export const store = createStore(
  rootReducer,
  defaultState,
  composeWithDevTools(applyMiddleware(...middlewares))
);

sagaMiddleware.run(rootSaga);


//services/api.js

import apiclient from './apiclient';

export const get = (url, params) => apiclient.get(url, params )
export const post = (url, params) => apiclient.post(url, params);


//services/apiclient.js

import axios from 'axios';
import shortid from 'shortid';

// This client should only be used for json type request/response
// For non-json types, please use a specific axios instance
//
// e.g. export const uploadDocument = (url, multi-part-form) => axios.post();
// Authorization Header should be moved to middleware once that is setup as part of SSO
export const genericConfig = () => {
  return {
    'Content-Type': 'application/json',
    headers: {
      "Authorization": 'Basic NDc5YjkxMDctN2E3Ny00OThlLTg3YTMtMDk3MjRmNTk4OTcwOmFjZDY1NmQzLTgwNzgtNGY3Ny1hODI5LWY5YjMyMWEzM2Y2ZQ==',
    },


  };
};

export const genericRequestInterceptor = config => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'x-messageId': shortid.generate(),
    },
  };
};

const apiclient = axios.create(genericConfig());
apiclient.interceptors.request.use(
  config => genericRequestInterceptor(config),
  error => Promise.reject(error)
);
export default apiclient;

//index.js

/**
 * [Demo Source Application - React + Redux + Redux-Saga Middleware]
 * [Note: This is not actual app, integration with WDP requires design of EXIT and ENTRY handler]
 * @author TCS
 * @type {[type]}
 */
import 'bootstrap/dist/css/bootstrap.css';
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import {store} from './redux/store';

import App from "./layout/app";


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);


//package-scripts.js
const { crossEnv } = require('nps-utils');

const startClient = 'react-scripts start';

let scripts = {
  // Starts the app dev server
  default: startClient,

  commit: {
    default: 'git-cz',
    retry: 'git-cz --retry',
  },

  client: startClient,

  // Compiles the app to static, production ready output
  build: 'react-scripts build',

  // Run the Jest test suite
  test: {
    default: 'react-scripts test --env=jsdom',
    coverage: 'react-scripts test --env=jsdom --coverage',
    ci: `${crossEnv('CI=true')} react-scripts test --env=jsdom --coverage`,
  },

  // Removes the dependency to react-scripts/create-react-app.
  // Executing this is a one way road, you cannot undo this.
  eject: 'react-scripts eject',

  // Interface for the commitizen commit manager
  // commit: "./node_modules/.bin/git-cz",

  // Generate the changelog
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s -r 0',
};

module.exports = { scripts };


//package.json

{
  "name": "wdpui-test",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "axios": "0.17.0",
    "bootstrap": "4.0.0-beta.2",
    "lodash": "4.17.4",
    "path": "0.12.7",
    "prop-types": "^15.6.0",
    "react": "^16.2.0",
    "react-dom": "^16.2.0",
    "react-redux": "^5.0.6",
    "react-router": "4.2.0",
    "react-router-dom": "4.2.2",
    "react-router-redux": "^4.0.8",
    "react-scripts": "1.0.17",
    "react-transition-group": "^2.2.1",
    "reactstrap": "^5.0.0-alpha.4",
    "redux": "^3.7.2",
    "redux-actions": "2.2.1",
    "redux-middleware": "^0.1.21",
    "redux-saga": "0.16.0",
    "shortid": "^2.2.8",
    "uuid": "^3.1.0"
  },
  "scripts": {
    "start": "nps",
    "dev": "set REACT_APP_CH_HOSTNAME=AUUW02VP1673&& nps",
    "test": "nps test"
  },
  "devDependencies": {
    "nps": "^5.7.1",
    "nps-utils": "^1.5.0",
    "redux-devtools-extension": "^2.13.2"
  }
}


//cd .. /packahe-scripts.js

const { crossEnv, concurrent } = require('nps-utils');

const startClient = 'lerna exec --scope wdpui-test yarn start';
const startCoreApiMockServer = 'lerna exec --scope fake-api yarn start';


let scripts = {
  // Starts the app dev server
  default: concurrent({
    app: {
      script: startClient,
      color: 'green',
    },
    coreApi: {
      script: startCoreApiMockServer,
      color: 'cyan',
    }
  }),

  commit: {
    default: 'git-cz',
    retry: 'git-cz --retry',
  },

  client: startClient,

  // Compiles the app to static, production ready output
  build: 'react-scripts build',

  // Run the Jest test suite
  test: {
    default: `${crossEnv(
      'CI=true'
    )} react-scripts test --env=jsdom --coverage --silent`,
    local: {
      default: 'react-scripts test --env=jsdom --coverage',
    },
    coverage: 'lerna exec yarn start test.coverage',
    ci: `${crossEnv('CI=true')} react-scripts test --env=jsdom --coverage`,
  },

  // Removes the dependency to react-scripts/create-react-app.
  // Executing this is a one way road, you cannot undo this.
  eject: 'react-scripts eject',

  // Interface for the commitizen commit manager
  // commit: "./node_modules/.bin/git-cz",

  // Generate the changelog
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s -r 0',
};

module.exports = { scripts };


//cd../package.json

{
 "author": "Somenath Ghosh",
 "license": "UNLICENSED",
 "devDependencies": {
  "lerna": "^2.5.1",
  "nps": "^5.7.1",
  "nps-utils": "^1.5.0"
 },
 "dependencies": {
  "bootstrap": "3",
  "react-bootstrap": "^0.31.5"
 },
 "scripts": {
  "start": "nps",
  "dev": "set REACT_APP_CH_HOSTNAME=AUUW02VP1673&& nps",
  "pretest": "lerna bootstrap",
  "test": "lerna exec yarn test",
  "prebuild": "rm -rf ./build",
  "build": "lerna bootstrap && lerna exec yarn start build",
  "postbuild": "mv ./packages/dashboard-framework/build/ ./build",
  "commitmsg": "commitlint -e",
  "postinstall": "lerna bootstrap",
  "mock-api-server": "node ./tools/fake-api"
 }
}





//App.js TEST

import 'jest-styled-components';
import React from 'react';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import App from './App';

const mockStore = configureMockStore();

/**
 * Note: There is no value in rendering the full app as a snapshot
 *       as the snapshot will change with every change to any of
 *       the components within the framework.
 *
 *       Instead we ensure that with missing config data, the app
 *       is showing a loader and that without a valid theme it
 *       will return null (not render) thus testing the HOCs that
 *       <App /> is wrapped with.
 */
describe('App', () => {
  it('should show a loader if no config is present', () => {
    const store = mockStore({ config: {} });
    const component = (
      <Provider store={store}>
        <App />
      </Provider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should return null if no theme is present', () => {
    const store = mockStore({
      config: {
        appName: 'test',
      },
    });
    const component = (
      <Provider store={store}>
        <App />
      </Provider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toBeNull();
  });
});


//public/index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <!--
      manifest.json provides metadata used when your web app is added to the
      homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>React Redux</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>

