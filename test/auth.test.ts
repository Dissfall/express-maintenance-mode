import test from 'ava';
import { spy, SinonSpy } from 'sinon';
import { ExpressMaintenance } from '../src';
import { Request, Response } from 'express';

type MockResponse = { json: SinonSpy; status: SinonSpy } & Partial<Response>;

test('API should not be available without authorization if it enabled', async (t) => {
  const maintenance = new ExpressMaintenance({
    accessKey: 'jive_belarus'
  });
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
  t.is(mockResponse.status.getCall(-1).firstArg, 401);
});

test('Attempt to access API with invalid key should be failed', async (t) => {
  const maintenance = new ExpressMaintenance({
    accessKey: 'jive_belarus'
  });
  const mockRequest = {
    path: '/maintenance',
    method: 'POST',
    query: { accessKey: 'gestachaishe' }
  };
  const mockResponse: MockResponse = {
    status: spy(),
    json: spy()
  };
  await maintenance.middleware(
    mockRequest as Request & { query: { accessKey: string } },
    mockResponse as Response,
    spy()
  );
  t.is(mockResponse.status.getCall(-1).firstArg, 401);
});

test('Attempt to access API with valid key should be succeed', async (t) => {
  const maintenance = new ExpressMaintenance({
    accessKey: 'jive_belarus'
  });
  const mockRequest = {
    path: '/maintenance',
    method: 'POST',
    query: { accessKey: 'jive_belarus' }
  };
  const mockResponse: MockResponse = {
    status: spy(),
    json: spy()
  };
  await maintenance.middleware(
    mockRequest as Request & { query: { accessKey: string } },
    mockResponse as Response,
    spy()
  );
  t.is(mockResponse.status.getCall(-1).firstArg, 200);
});
