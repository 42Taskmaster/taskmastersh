import type { OutgoingHttpHeaders, IncomingMessage } from 'http';

export interface FetcherOptions {
    path: string
    headers?: OutgoingHttpHeaders
}

export interface FetcherOptionsPost extends FetcherOptions {
    body: string
}

export interface Response extends IncomingMessage {
    json(): Promise<JSON>
}

export interface Fetcher {
    get(args: FetcherOptions): Promise<Response>
    post(args : FetcherOptionsPost): Promise<Response>
}

export interface Context {
    fetcher?: Fetcher
}

export function assertContextWithFetcher(context: Context): asserts context is Required<Context> {
    if (context.fetcher === undefined) {
        throw new Error('fetcher property of Context must be set; do not forget to call createFetcher function');
    }
}

export interface ReplCommandArgs {
    context: Context
    line: string
}
