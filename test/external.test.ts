import test from 'ava';
import { SinonSpy, spy } from 'sinon';
import {
  ExpressMaintenance,
  GetExternalMaintenanceStateFunction,
  MaintenanceState,
  ServerMode,
  SetExternalMaintenanceStateFunction
} from '../src';
import { Request, Response } from 'express';

type MockResponse = { json: SinonSpy; status: SinonSpy } & Partial<Response>;
type MaintenanceResponseBody = { string: string };

const getExternalState: GetExternalMaintenanceStateFunction<MaintenanceResponseBody> = (): MaintenanceState<MaintenanceResponseBody> => {
  return {
    currentServerMode: ServerMode.maintenance
  };
};

const getExternalStateAsync: GetExternalMaintenanceStateFunction<MaintenanceResponseBody> = async (): Promise<
  MaintenanceState<MaintenanceResponseBody>
> => {
  return {
    currentServerMode: ServerMode.maintenance
  };
};

const setExternalState: SetExternalMaintenanceStateFunction<MaintenanceResponseBody> = spy(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  (maintenanceState: MaintenanceState<MaintenanceResponseBody>) => {}
);

test('Middleware should be in sync with external state if external state function provided', async (t) => {
  const maintenance = new ExpressMaintenance({
    getExternalMaintenanceState: getExternalState
  });
  const mockRequest = {
    url: '/maintenance',
    path: '/maintenance',
    method: 'GET',
    query: {}
  };
  const mockResponse: MockResponse = {
    status: spy(),
    json: spy()
  };
  await maintenance.middleware(
    mockRequest as Request,
    mockResponse as Response,
    spy()
  );
  t.regex(mockResponse.json.getCall(-1).firstArg.message, /maintenance/);
});

test('Middleware should be in sync with external state if external state function provided. Even if it async!', async (t) => {
  const maintenance = new ExpressMaintenance({
    getExternalMaintenanceState: getExternalStateAsync
  });
  const mockRequest = {
    url: '/maintenance',
    path: '/maintenance',
    method: 'GET',
    query: {}
  };
  const mockResponse: MockResponse = {
    status: spy(),
    json: spy()
  };
  await maintenance.middleware(
    mockRequest as Request,
    mockResponse as Response,
    spy()
  );
  t.regex(mockResponse.json.getCall(-1).firstArg.message, /maintenance/);
});

test('Middleware should be update external state if update function provided', async (t) => {
  const maintenance = new ExpressMaintenance({
    setExternalMaintenanceState: setExternalState.bind(this)
  });
  const mockRequest = {
    url: '/maintenance',
    path: '/maintenance',
    method: 'POST',
    query: {}
  };
  const mockResponse: MockResponse = {
    status: spy(),
    json: spy()
  };
  await maintenance.middleware(
    mockRequest as Request,
    mockResponse as Response,
    spy()
  );
  t.regex(
    (setExternalState as SinonSpy).getCall(-1).firstArg.currentServerMode,
    /maintenance/
  );
});
