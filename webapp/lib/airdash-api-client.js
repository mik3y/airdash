/**
 * HTTP API client for the Airdash api.
 */
import { default as axios } from 'axios';

class ClientError extends Error {
  constructor(cause) {
    super();
    this.cause = cause;
  }
}

class ConnectionError extends ClientError {
  constructor(cause) {
    super();
    this.cause = cause;
  }
}

class ResponseError extends ClientError {
  constructor(cause) {
    super();
    this.cause = cause;
  }
}
export default class AirdashApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: this.baseUrl,
    });
  }

  async request(config) {
    const requestConfig = {
      ...config,
    };

    const { stack } = new Error();
    try {
      const result = await this.axios.request(requestConfig);
      return result.data;
    } catch (err) {
      err.stack = stack;
      if (err.response) {
        throw new ResponseError(err);
      } else if (err.request) {
        throw new ConnectionError(err);
      }
      throw new ClientError(err);
    }
  }

  get(url, config = {}) {
    return this.request({
      ...config,
      method: 'get',
      url,
    });
  }

  post(url, data = {}, config = {}) {
    return this.request({
      config: {
          ...config,
          data: {
              ...data,
          },
      },
      method: 'post',
      url,
    });
  }

  async addAISSource(hostname, port) {
    const data = await this.post(`/api/sources/ais/${hostname}/${port}`);
    return data;
  }

  async getAISUpdates(hostname, port) {
    const data = await this.get(`/api/sources/ais/${hostname}/${port}`);
    return data;
  }

  async getEntities() {
    const data = await this.get(`/api/entities`);
    return data;
  }
}

AirdashApiClient.ClientError = ClientError;
AirdashApiClient.ConnectionError = ConnectionError;
AirdashApiClient.ResponseError = ResponseError;
