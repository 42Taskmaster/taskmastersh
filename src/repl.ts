import { createInterface, Interface } from 'readline';

import { statusCommand, startCommand, stopCommand } from './commands';
import { createFetcher } from './http';
import { ReplCommandArgs, Context, Fetcher } from './types';
import { parseCommandLine } from './parser';

type ReplCommand =
    | ((args: ReplCommandArgs) => Promise<void>)
    | ((args: ReplCommandArgs) => void)
    | (() => void)

type Commands = 'status' | 'start' | 'restart'| 'stop' | 'refresh' | 'shutdown' | 'help'

interface AskArgs {
    rl : Interface
    question: string
}

type TryToConnectToTaskmasterdResult =
    | { connected: false }
    | { connected: true; fetcher: Fetcher }

const CommandsMap = new Map<Commands, ReplCommand>([
    ['status', statusCommand],
    ['start', startCommand],
    ['stop', stopCommand],
    ['help', () => {
        console.log('Available commands:\n');

        for (const command of CommandsMap.keys()) {
            console.log(command);
        }
    }],
]);

function ask({
    rl,
    question,
}: AskArgs): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function tryToConnectToTaskmasterd(url: string): Promise<TryToConnectToTaskmasterdResult> {
    try {
        const parsedURL = new URL(url);

        const fetcher = createFetcher({
            hostname: parsedURL.hostname,
            port: parsedURL.port,
        });

        await fetcher.get({
            path: '/version',
        });

        return {
            connected: true,
            fetcher,
        };
    } catch (err) {
        return {
            connected: false,
        };
    }
}

async function askForConnectionURL(rl: Interface): Promise<Fetcher | undefined> {
    const MAX_TRIES = 3;
    const DEFAULT_URL = 'http://localhost:8080';
    let tries = 0;

    while (tries < MAX_TRIES) {
        const url = await ask({
            rl,
            question: `What is the URL of the Taskmasterd you want to connect to? (Default: ${DEFAULT_URL}) `,
        });

        let urlToConnectTo: string = url;
        if (url === '') {
            urlToConnectTo = DEFAULT_URL;
        }

        console.log('Trying to connect to the Taskmasterd...');

        const connectionTryResult = await tryToConnectToTaskmasterd(urlToConnectTo);

        if (connectionTryResult.connected) {
            console.log('Connected to the Taskmasterd! 🎉');
            return connectionTryResult.fetcher;
        }

        console.log(`Could not connect to ${urlToConnectTo}, try another URL.`);

        tries += 1;
    }

    return undefined;
}

async function app() {
    console.log('Welcome to Taskmastersh!');

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '$> ',
        completer(line: string) {
            const completions = [...CommandsMap.keys()];
            const hits = completions.filter((c) => c.startsWith(line));

            return [hits.length ? hits : completions, line];
        },
    });

    const fetcher = await askForConnectionURL(rl);
    if (fetcher === undefined) {
        console.log('We exceeded the maximum number of tries, try again later');
        rl.close();
        return;
    }

    const context: Context = {
        fetcher,
    };

    rl.prompt();
    for await (const line of rl) {
        const { command, args } = parseCommandLine(line);

        const commandToRun = CommandsMap.get(command as Commands);
        if (commandToRun === undefined) {
            console.error('invalid command');
        } else {
            await commandToRun({
                context,
                command,
                args,
            });
        }

        rl.prompt();
    }

    console.log('\nHave a great day!');
}

app().catch(console.error);
