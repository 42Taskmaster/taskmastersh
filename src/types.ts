import type { OutgoingHttpHeaders, IncomingMessage } from 'http';

export interface FetcherOptions {
    path: string
    headers?: OutgoingHttpHeaders
}

export interface FetcherOptionsPost extends FetcherOptions {
    body: string
}

export interface Response extends IncomingMessage {
    json(): Promise<unknown>
}

export interface Fetcher {
    get(args: FetcherOptions): Promise<Response>
    post(args : FetcherOptionsPost): Promise<Response>
}

export interface Context {
    fetcher: Fetcher
}

export interface ReplCommandArgs {
    context: Context
    line: string
}

export interface ResponseWithError {
    error?: string
}

export interface Process {
    id: string
    pid: string
    state: string
}

export enum ProgramState {
    STARTING = 'STARTING',
    BACKOFF = 'BACKOFF',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING',
    STOPPED = 'STOPPED',
    EXITED = 'EXITED',
    FATAL = 'FATAL',
    UNKNOWN = 'UNKNOWN',
}

export interface ProgramConfiguration {
    name: string
    cmd: string
    numprocs: number
    umask: string
    workingdir: string
    autostart: boolean
    autorestart: string
    exitcodes: number[]
    startretries: number
    starttime: number
    stopsignal: string
    stoptime: number
    stdout: string
    stderr: string
    env: string[]
}

export interface Program {
    id: string
    state: ProgramState
    configuration: ProgramConfiguration
    processes: Process[]
}

export interface Programs {
    programs: Program[]
}

interface GetAllProgramsResponse extends ResponseWithError {
    result: Programs
}

export function isProgram(input: unknown): input is Program {
    return (
        typeof input === 'object'
            && typeof (input as Program).id === 'string'
    );
}

export function isProgramsList(input: unknown): input is Programs {
    return (
        typeof input === 'object'
            && Array.isArray((input as Programs).programs)
            && (input as Programs).programs.every(isProgram)
    );
}

export function isGetAllProgramsResponse(input: unknown): input is GetAllProgramsResponse {
    return (
        typeof input === 'object'
            && isProgramsList((input as GetAllProgramsResponse).result)
    );
}
