import type { OutgoingHttpHeaders, IncomingMessage } from 'http';
import { ParsedCommand } from './parser';

export interface FetcherOptions {
    path: string
    headers?: OutgoingHttpHeaders
}

export interface FetcherOptionsPostWithJSON extends FetcherOptions {
    json: unknown
}

export function isFetcherOptionsPostWithJSON(input: unknown): input is FetcherOptionsPostWithJSON {
    return (
        typeof input === 'object'
        && Reflect.has((input as FetcherOptionsPostWithJSON), 'json')
    );
}

export interface FetcherOptionsPostWithBody extends FetcherOptions {
    body: string
}

export function isFetcherOptionsPostWithBody(input: unknown): input is FetcherOptionsPostWithBody {
    return (
        typeof input === 'object'
        && typeof (input as FetcherOptionsPostWithBody).body === 'string'
    );
}

export type FetcherOptionsPost = FetcherOptionsPostWithJSON | FetcherOptionsPostWithBody

export interface Response extends IncomingMessage {
    json(): Promise<unknown>
}

export interface Fetcher {
    get(args: FetcherOptions): Promise<Response>
    post(args: FetcherOptionsPostWithBody): Promise<Response>
    post(args: FetcherOptionsPostWithJSON): Promise<Response>
}

export interface Context {
    fetcher: Fetcher
}

export interface ReplCommandArgs extends ParsedCommand {
    context: Context
}

export interface ResponseWithError {
    error?: string
}

function isResponseWithError(input: unknown): input is ResponseWithError {
    return (
        ['undefined', 'string'].includes(typeof (input as ResponseWithError).error)
    );
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

export interface Process {
    id: string
    pid: number
    state: ProgramState
    startedAt: string
    endedAt: string
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

export interface StartProgramResponse extends ResponseWithError {
}

export function isStartProgramResponse(input: unknown): input is StartProgramResponse {
    return isResponseWithError(input);
}
