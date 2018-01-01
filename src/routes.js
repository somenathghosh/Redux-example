import React from 'react';
import { Route, IndexRoute } from 'react-router';
import MediaGalleryPage from './containers/MediaGalleryPage';
import App from './containers/App';
import HomePage from './components/HomePage';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="library" component={MediaGalleryPage} />
  </Route>
);

//appconfig.saga.test.js

import { put, call, takeEvery } from 'redux-saga/effects';
import { loadAppConfig, watchAppConfig } from './appconfig.saga';
import { actions as appActions } from '../modules/appconfig.module';
import {COMPANYINFO_URL, EMPLOYEE_URL} from '../../constants';
import { get } from '../../services/api';

describe('AppConfig', () => {
  describe('watchAppConfig', () => {
    const saga = watchAppConfig();
    it('should trigger on REQUEST action type', () => {
      const expectedYield = takeEvery(
        appActions.app.config.request().type,
        loadAppConfig
      );
      const actualYield = saga.next().value;
      expect(actualYield).toEqual(expectedYield);
    });
  });
  describe('loadAppConfig', () => {
    const saga = loadAppConfig();
    it('should hit the COMPANYINFO_URL api', () => {
      const expectedyield = call(get, COMPANYINFO_URL);
      const baseUrlyield = saga.next().value;
      expect(baseUrlyield).toEqual(expectedyield);
    });

    it('should hit the EMPLOYEE_URL api', () => {
      const expectedyield = call(get, EMPLOYEE_URL);
      const baseUrlyield = saga.next().value;
      expect(baseUrlyield).toEqual(expectedyield);
    });

    // it('dispatch the RECEIVE action type', () => {
    //   const mockApiResponse = { companyInfo: {test:1}, employeesInfo: {test:1 } };
    //   const expectedAction = put(
    //     appActions.app.config.receive(mockApiResponse)
    //   );
    //   const actualAction = saga.next(mockApiResponse).value;
    //   expect(actualAction).toEqual(expectedAction);
    // });
    
    it('should dispatch an ERROR action', () => {
      const error = new Error('Test error');
      const expectedAction = put(appActions.app.config.error(error));
      const actualAction = saga.throw(error).value;
      expect(actualAction).toEqual(expectedAction);
    });
  });
});


//appconfig.module.test.js

import { actions, reducer } from "./appconfig.module";

describe("appconfig.module", () => {
    describe("request action", () => {
        test("should have the correct type", () => {
            expect(actions.app.config.request()).toEqual({
                type: "app/config/REQUEST",
            });
        });
        test("should never have a payload", () => {
            expect(actions.app.config.request("I should not be here")).toEqual({
                type: "app/config/REQUEST",
            });
        });
    });
    describe("receive action", () => {
        const config = {
            configExample: "test1",
            configKey2: "test2",
        };
        test("should accept config object as its payload", () => {
            expect(actions.app.config.receive(config)).toEqual({
                type: "app/config/RECEIVE",
                payload: config,
            });
        });
    });
    describe("error action", () => {
        test("should have error flag set as per FSA standard", () => {
            const error = new Error("My error message");
            expect(actions.app.config.error(error)).toEqual({
                type: "app/config/ERROR",
                payload: error,
                error: true,
            });
        });
        test("should not have error flag if no error is given", () => {
            expect(actions.app.config.error(undefined)).toEqual({
                type: "app/config/ERROR",
            });
        });
    });
    describe("reducer", () => {
        test("should set isLoading on request", () => {
            const state = {};
            expect(reducer(state, actions.app.config.request())).toEqual({
                isLoading: true,
            });
        });
        test("should store config and set isLoading to false", () => {
            const state = {};
            const config = { configItem: "test" };
            expect(reducer(state, actions.app.config.receive(config))).toEqual({
                isLoading: false,
                ...config,
            });
        });
        test("should retain existing values on receive", () => {
            const state = { myExistingState: "test" };
            const config = { configItem: "test" };
            expect(reducer(state, actions.app.config.receive(config))).toEqual({
                ...state,
                isLoading: false,
                ...config,
            });
        });
        test("should clear values on error", () => {
            const state = { myExistingState: "test" };
            const error = new Error("My Error");
            expect(reducer(state, actions.app.config.error(error))).toEqual({});
        });
    });
});

      

 //Selector
      
  import { get } from 'lodash';
import { createSelector } from 'reselect';

export const getConfig = state => get(state, 'config', null);

export const getApiBaseUrl = createSelector([getConfig], config =>
  get(config, 'apiUrl', null)
);

export const getAppCorrelationId = createSelector([getConfig], config =>
  get(config, 'appCorrelationId', null)
);

export const getBrandId = createSelector([getConfig], config =>
  get(config, 'brandId', null)
);

export const getCoreApiBaseUrl = state =>
  state && state.config && state.config.apiUrl && state.config.coreApiUrl
    ? state.config.apiUrl + state.config.coreApiUrl
    : null;

export const getBankerApiBaseUrl = state =>
  state && state.config && state.config.apiUrl && state.config.bankerApiUrl
    ? state.config.apiUrl + state.config.bankerApiUrl
    : null;


//Selector Test
      
      import { getApiBaseUrl, getAppCorrelationId, getBrandId } from './config';

describe('Config Selector', () => {
  it('Get null if a proper config state is not passed', () => {
    const configuredState = { config: {} };
    expect(getApiBaseUrl(configuredState)).toBeNull();
  });

  it('Get the Api Base Url if sent a proper state', () => {
    const configuredState = { config: { apiUrl: '/testApi' } };
    expect(getApiBaseUrl(configuredState)).toEqual('/testApi');
  });

  it('Get null if a proper config state is not passed', () => {
    const configuredState = { config: {} };
    expect(getAppCorrelationId(configuredState)).toBeNull();
  });

  it('Get the Api Base Url if sent a proper state', () => {
    const configuredState = { config: { appCorrelationId: 'Test-AppCorrelation-Id' } };
    expect(getAppCorrelationId(configuredState)).toEqual('Test-AppCorrelation-Id');
  });

  it('Get null if a proper config state is not passed', () => {
    const configuredState = { config: {} };
    expect(getBrandId(configuredState)).toBeNull();
  });

  it('Get the BrandId if sent a proper state', () => {
    const configuredState = { config: { brandId: 'WBC' } };
    expect(getBrandId(configuredState)).toEqual('WBC');
  });
});

      
 //apiclient.test.js
 
 import { genericConfig, genericRequestInterceptor } from './apiclient';

jest.mock('shortid', () => ({
  generate: jest.fn(() => 'shortid generated hardcoded uuid'),
}));
const shortid = require('shortid');

describe('axios apiClient wrapper', () => {
  it('Get the ContentType and hard-coded authorization header', () => {
    expect(() => genericConfig()).not.toThrow();
    expect(genericConfig()).not.toBeNull();
    expect(genericConfig()['Content-Type']).not.toBeUndefined();
    expect(genericConfig()['Content-Type']).not.toBeNull();
    expect(genericConfig()['Content-Type']).toEqual('application/json');
    expect(genericConfig().headers.Authorization).not.toBeUndefined();
    expect(genericConfig().headers.Authorization).not.toBeNull();
    expect(genericConfig().headers.Authorization).toEqual(
      'Basic NDc5YjkxMDctN2E3Ny00OThlLTg3YTMtMDk3MjRmNTk4OTcwOmFjZDY1NmQzLTgwNzgtNGY3Ny1hODI5LWY5YjMyMWEzM2Y2ZQ=='
    );
  });

  it('Get a shortid.generate() id as x-messageId Header', () => {
    const config = {};
    expect(genericRequestInterceptor(config)).not.toBeNull();
    expect(genericRequestInterceptor(config).headers).not.toBeNull();
    expect(
      genericRequestInterceptor(config).headers['x-messageId']
    ).not.toBeNull();
    expect(genericRequestInterceptor(config).headers['x-messageId']).toEqual(
      'shortid generated hardcoded uuid'
    );
  });
});

      
      
      
      
//Notes
      
1. Remove yarn.lock file. //add it to .gitignore
2. REmove test from root folder.
3. Addes State in appconfig
4. rearrange saga code to make test
5. 

      
      
      
