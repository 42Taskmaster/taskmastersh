import { request } from 'http';

import {
    Fetcher, FetcherOptions, isFetcherOptionsPostWithJSON, Response, FetcherOptionsPost,
} from './types';

type RequestWrapperArgs =
    | { method: 'GET' | 'DELETE', options: FetcherOptions }
    | { method: 'POST', options: FetcherOptionsPost }

interface CreateFetcherArgs {
    hostname: string
    port: string
}

export function createFetcher({ hostname, port }: CreateFetcherArgs): Fetcher {
    function requestWrapper(args: RequestWrapperArgs): Promise<Response> {
        return new Promise((resolve, reject) => {
            const hasJSONBody = isFetcherOptionsPostWithJSON(args.options);

            const req = request({
                hostname,
                port,
                method: args.method,
                path: args.options.path,
                headers: {
                    ...args.options.headers,
                    ...(hasJSONBody && {
                        'Content-Type': 'application/json',
                    }),
                },
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
                let body: string;
                if (isFetcherOptionsPostWithJSON(args.options)) {
                    body = JSON.stringify(args.options.json);
                } else {
                    body = args.options.body;
                }

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

        async post({ path, headers, ...args }: FetcherOptionsPost): Promise<Response> {
            const response = await requestWrapper({
                method: 'POST',
                options: {
                    path,
                    headers,
                    ...args,
                },
            });

            return response;
        },

        async delete({ path, headers }: FetcherOptionsPost): Promise<Response> {
            const response = await requestWrapper({
                method: 'DELETE',
                options: {
                    path,
                    headers,
                },
            });

            return response;
        },
    };

    return fetcher;
}
