import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Axios, { AxiosResponse } from 'axios';

type RegistryResponse = {
  name: string;
  modified: string;
  homepage?: string;
  description?: string;
  time: {
    [K: string]: string;
  };
  'dist-tags': {
    latest: string;
  };
};

function assertFulfilled<T>(item: PromiseSettledResult<T>): item is PromiseFulfilledResult<T> {
  return item.status === 'fulfilled';
}

const makeResponse = (data: Record<string, any>): APIGatewayProxyResult => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

const makeError = (statusCode: number, error: { message: string; code?: string }): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify({
      message: error.message,
      code: error.code,
    }),
  };
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const packages = event.queryStringParameters?.packages?.split(',');
  if (packages === undefined || packages.length === 0) {
    return makeError(400, {
      message: 'Please provide a list of comma-separated package names.',
      code: 'packages-required',
    });
  }

  const client = Axios.create({
    baseURL: 'https://registry.npmjs.org',
  });

  const requests = packages
    .filter((name) => name.trim().length > 0)
    .map((name) => {
      return client.get<RegistryResponse>(name).then((response) => response.data);
    });

  const responses = await Promise.allSettled(requests);
  const values = responses.filter(assertFulfilled).map((promise) => promise.value);

  const data = values.map((value) => ({
    name: value.name,
    version: value['dist-tags'].latest,
    modifiedAt: value.time[value['dist-tags'].latest],
    description: value.description,
    homepage: value.homepage,
  }));

  return makeResponse(data);
};
