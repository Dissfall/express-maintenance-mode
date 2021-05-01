import test from 'ava';
import { spy, match, SinonSpy } from 'sinon';
import { Request, Response } from 'express';
import { ExpressMaintenance } from '../src';

type MockResponse = { json: SinonSpy; status: SinonSpy } & Partial<Response>;

test('Middleware should be function', (t) => {
  const maintenance = new ExpressMaintenance();
  t.is(typeof maintenance.middleware, 'function');
});

test('GET /middleware should return server maintenance state', async (t) => {
  const maintenance = new ExpressMaintenance();
  const mockRequest = {
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
  t.true(mockResponse.status.calledWith(200));
  t.true(
    mockResponse.json.calledWithMatch(
      match.hasNested('message', match(/default/))
    )
  );
});

test('POST /middleware should turn server to maintenance mode', async (t) => {
  const maintenance = new ExpressMaintenance();
  const mockRequest = {
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
  t.true(mockResponse.status.calledWith(200));
  t.true(
    mockResponse.json.calledWithMatch(
      match.hasNested('message', match(/maintenance/))
    )
  );
});

test('Application API should not be available when server in maintenance mode', async (t) => {
  const maintenance = new ExpressMaintenance();
  const mockRequest = {
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
    // @ts-expect-error
    {
      status: spy(),
      json: spy()
    } as Response,
    spy()
  );
  await maintenance.middleware(
    {
      path: '/api/something',
      url: '/api/something',
      method: 'GET',
      query: {}
    } as Request,
    mockResponse as Response,
    spy()
  );
  t.is(mockResponse.status.getCall(-1).firstArg, 503);
});

test('POST /middleware with body should turn server to maintenance mode and set response options', async (t) => {
  const maintenance = new ExpressMaintenance<{ message: string }>();
  const mockRequest = {
    path: '/maintenance',
    url: '/maintenance',
    method: 'POST',
    query: {},
    body: {
      body: { message: 'Server in maintenance mode now' },
      statusCode: 503
    }
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
  t.true(mockResponse.status.calledWith(200));
  t.true(
    mockResponse.json.calledWithMatch(
      match.hasNested('message', match(/maintenance/))
    )
  );
  const context = maintenance.getContext();
  t.is(context.body.message, mockRequest.body.body.message);
  t.is(context.statusCode, mockRequest.body.statusCode);
});

test('DELETE /middleware should turn server in regular mode', async (t) => {
  const maintenance = new ExpressMaintenance<{ message: string }>();
  const mockRequest = {
    path: '/maintenance',
    url: '/maintenance',
    method: 'DELETE',
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
  t.true(mockResponse.status.calledWith(200));
  t.true(
    mockResponse.json.calledWithMatch(
      match.hasNested('message', match(/default/))
    )
  );
});

test('Attempt to execute API with others methods should be failed', async (t) => {
  const maintenance = new ExpressMaintenance<{ message: string }>();
  const mockRequest = {
    path: '/maintenance',
    url: '/maintenance',
    method: 'PUT',
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
  t.true(mockResponse.status.calledWith(405));
  t.regex(mockResponse.json.getCall(-1).firstArg.message, /not/);
});
