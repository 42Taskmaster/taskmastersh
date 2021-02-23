import {
    Program, ProgramState, ReplCommandArgs,
} from './types';
import { getAllPrograms } from './api/get-programs';
import { startProgram } from './api/start-program';
import { stopProgram } from './api/stop-program';
import { restartProgram } from './api/restart-program';
import { shutdown } from './api/shutdown';
import { refreshConfiguration } from './api/refresh-configuration';

interface ProgramToPrint {
    state: ProgramState
    processesCount: number
}

interface ProcessToPrint {
    id: string
    pid: number
    state: ProgramState
}

interface SingleProgramToPrint {
    name: string
    state: ProgramState
    processes: ProcessToPrint[]
}

function mergeProgramsIntoObject(programs: Program[]): Record<string, ProgramToPrint> {
    return programs.reduce<Record<string, ProgramToPrint>>(
        (acc, { id, state, processes: { length: processesCount } }) => {
            acc[id] = {
                state,
                processesCount,
            };

            return acc;
        }, {},
    );
}

function printPrograms(programs: Program[]) {
    const programsToPrint = mergeProgramsIntoObject(programs);

    console.dir(programsToPrint, {
        depth: null,
    });
}

function printSingleProgram(programs: Program[], programId: string) {
    const program = programs.find(({ id }) => id === programId);
    if (program === undefined) {
        console.log(`Could not find program ${programId}`);
        return;
    }

    const programToPrint: SingleProgramToPrint = {
        name: programId,
        processes: program.processes.map(({ id, pid, state }) => ({
            id,
            pid,
            state,
        })),
        state: program.state,
    };

    console.dir(programToPrint, {
        depth: null,
    });
}

export async function statusCommand({
    context: { fetcher },
    args,
}: ReplCommandArgs): Promise<void> {
    const programs = await getAllPrograms(fetcher);

    if (typeof args[0] === 'string') {
        const programId = args[0];

        printSingleProgram(programs, programId);
        return;
    }

    printPrograms(programs);
}

export async function startCommand({
    context: { fetcher },
    args: [commandToStart],
}: ReplCommandArgs): Promise<void> {
    if (commandToStart === undefined) {
        console.log('A program name must be given');
        return;
    }

    try {
        await startProgram(fetcher, commandToStart);
        console.log(`Program ${commandToStart} sucessfully started`);
    } catch (err) {
        console.error(err);
        console.log(`Could not start program ${commandToStart}`);
    }
}

export async function stopCommand({
    context: { fetcher },
    args: [commandToStop],
}: ReplCommandArgs): Promise<void> {
    if (commandToStop === undefined) {
        console.log('A program name must be given');
        return;
    }

    try {
        await stopProgram(fetcher, commandToStop);
        console.log(`Program ${commandToStop} sucessfully stopped`);
    } catch (err) {
        console.error(err);
        console.log(`Could not stop program ${commandToStop}`);
    }
}

export async function restartCommand({
    context: { fetcher },
    args: [commandToRestart],
}: ReplCommandArgs): Promise<void> {
    if (commandToRestart === undefined) {
        console.log('A program name must be given');
        return;
    }

    try {
        await restartProgram(fetcher, commandToRestart);
        console.log(`Program ${commandToRestart} sucessfully restarted`);
    } catch (err) {
        console.error(err);
        console.log(`Could not restart program ${commandToRestart}`);
    }
}

export async function shutdownCommand({
    context: { fetcher },
}: ReplCommandArgs): Promise<void> {
    try {
        await shutdown(fetcher);
        console.log('Taskmasterd is shutdowning, exiting');
        process.exit(0);
    } catch (err) {
        console.error(err);
        console.log('Could not shutdown Taskmasterd');
    }
}

export async function refreshConfigurationCommand({
    context: { fetcher },
}: ReplCommandArgs): Promise<void> {
    try {
        await refreshConfiguration(fetcher);
        console.log('Taskmasterd configuration has been successfully refreshed');
    } catch (err) {
        console.error(err);
        console.log('Could not refresh Taskmasterd configuration');
    }
}
