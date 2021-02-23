import { request } from 'http';

import {
    Fetcher, FetcherOptions, FetcherOptionsPost, Response,
} from './types';

type RequestWrapperArgs =
    | { method: 'GET', options: FetcherOptions }
    | { method: 'POST', options: FetcherOptionsPost }

interface CreateFetcherArgs {
    hostname: string
    port: string
}

export function createFetcher({ hostname, port }: CreateFetcherArgs): Fetcher {
    function requestWrapper(args: RequestWrapperArgs): Promise<Response> {
        return new Promise((resolve, reject) => {
            const req = request({
                hostname,
                port,
                method: args.method,
                path: args.options.path,
                headers: args.options.headers,
            }, (res) => {
                resolve(
                    Object.assign(res, {
                        async json(): Promise<unknown> {
                            let data = '';

                            for await (const chunk of res) {
                                data += chunk;
                            }

                            return JSON.parse(data);
                        },
                    }),
                );
            });

            req.on('error', (err) => {
                reject(err);
            });

            if (args.method === 'POST') {
                const { body } = args.options;

                req.write(body);
            }

            req.end();
        });
    }

    const fetcher: Fetcher = {
        async get({ path, headers }: FetcherOptions): Promise<Response> {
            const response = await requestWrapper({
                method: 'GET',
                options: {
                    path,
                    headers,
                },
            });

            return response;
        },

        async post({ path, headers, body }: FetcherOptionsPost): Promise<Response> {
            const response = await requestWrapper({
                method: 'POST',
                options: {
                    path,
                    headers,
                    body,
                },
            });

            return response;
        },
    };

    return fetcher;
}
