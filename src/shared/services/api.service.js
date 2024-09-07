import * as querystring from 'node:querystring';
import https from 'https';

export class ApiService {
  constructor() {
    if (ApiService._instance) {
      return ApiService._instance;
    }

    ApiService._instance = this;
  }

  get(url, params = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      const queryString = querystring.stringify(params);
      const urlWithParams = `${url}?${queryString}`;

      const options = {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      https.get(urlWithParams, options, res => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            reject(new Error('Error parsing JSON'));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`, { cause: error }));
      });
    });
  }

  post(url, postData = {}, requestOptions = {}) {
    return new Promise((resolve, reject) => {
      const dataString = JSON.stringify(postData);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': dataString.length,
          ...requestOptions?.headers
        },
      };

      const req = https.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            reject(new Error('Error parsing JSON'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error('Request failed: ' + error.message));
      });

      req.write(dataString);
      req.end();
    });
  }
}
