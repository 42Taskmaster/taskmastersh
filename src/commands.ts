import {
    Program, ProgramState, ReplCommandArgs,
} from './types';
import { getAllPrograms } from './api/get-programs';
import { startProgram } from './api/start-program';

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
