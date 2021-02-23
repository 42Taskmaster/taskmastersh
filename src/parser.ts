import { createMachine } from './state-machine';

export interface ParsedCommand {
    command: string
    args: string[]
}

type ParserMachineStates =
    | 'whitespace'
    | 'in-word'
    | 'in-word-double-quoted'
    | 'in-word-single-quoted'
    | 'waiting'
    | 'end'

type ParserMachineEvents =
    | 'whitespace'
    | 'in-word'
    | 'double-quote'
    | 'single-quote'
    | 'end'

type ParserMachineContext = {
    inString: string

    processedChunks: string[]
    currentChunk: string
}

export function parseCommandLine(line: string): ParsedCommand {
    const machine = createMachine<ParserMachineContext, ParserMachineStates, ParserMachineEvents>({
        context: {
            inString: line,
            currentChunk: '',
            processedChunks: [],
        },

        initial: 'whitespace',

        states: {
            whitespace: {
                actions: [(context, event) => {
                    const currentCharacter = event.char;
                    if (typeof currentCharacter !== 'string') {
                        return;
                    }

                    if (currentCharacter === '') {
                        return;
                    }

                    machine.assign({
                        processedChunks: [...context.processedChunks, context.currentChunk],
                        currentChunk: '',
                    });
                }],

                on: {
                    whitespace: 'whitespace',
                    'in-word': 'in-word',
                    'double-quote': 'in-word-double-quoted',
                    'single-quote': 'in-word-single-quoted',
                    end: 'end',
                },
            },

            'in-word': {
                actions: [
                    (context, event) => {
                        const currentCharacter = event.char;
                        if (typeof currentCharacter !== 'string') {
                            return;
                        }

                        machine.assign({
                            currentChunk: context.currentChunk + currentCharacter,
                        });
                    },
                ],

                on: {
                    whitespace: 'whitespace',
                    'in-word': 'in-word',
                    'double-quote': 'in-word-double-quoted',
                    'single-quote': 'in-word-single-quoted',
                    end: 'end',
                },
            },

            'in-word-double-quoted': {
                actions: [
                    (context, event) => {
                        const currentCharacter = event.char;
                        if (typeof currentCharacter !== 'string') {
                            return;
                        }

                        if (currentCharacter === '"') {
                            return;
                        }

                        machine.assign({
                            currentChunk: context.currentChunk + currentCharacter,
                        });
                    },
                ],

                on: {
                    whitespace: 'in-word-double-quoted',
                    'in-word': 'in-word-double-quoted',
                    'single-quote': 'in-word-double-quoted',

                    'double-quote': 'waiting',
                },
            },

            'in-word-single-quoted': {
                actions: [
                    (context, event) => {
                        const currentCharacter = event.char;
                        if (typeof currentCharacter !== 'string') {
                            return;
                        }

                        if (currentCharacter === '\'') {
                            return;
                        }

                        machine.assign({
                            currentChunk: context.currentChunk + currentCharacter,
                        });
                    },
                ],

                on: {
                    whitespace: 'in-word-single-quoted',
                    'in-word': 'in-word-single-quoted',
                    'double-quote': 'in-word-single-quoted',

                    'single-quote': 'waiting',
                },
            },

            waiting: {
                on: {
                    whitespace: 'whitespace',
                    'in-word': 'in-word',
                    'double-quote': 'in-word-double-quoted',
                    'single-quote': 'in-word-single-quoted',
                    end: 'end',
                },
            },

            end: {
                actions: [
                    (context) => {
                        if (context.currentChunk === '') {
                            return;
                        }

                        machine.assign({
                            processedChunks: [...context.processedChunks, context.currentChunk],
                            currentChunk: '',
                        });
                    },
                ],
            },
        },
    });

    for (const char of line) {
        let event: ParserMachineEvents;
        if (/\s/.test(char)) {
            event = 'whitespace';
        } else if (char === '"') {
            event = 'double-quote';
        } else if (char === '\'') {
            event = 'single-quote';
        } else if (/[\x20-\x7E]/.test(char)) {
            event = 'in-word';
        } else {
            continue;
        }

        machine.send({
            type: event,
            char,
        });
    }

    machine.send({
        type: 'end',
    });

    return {
        command: machine.context.processedChunks[0],
        args: machine.context.processedChunks.slice(1),
    };
}
