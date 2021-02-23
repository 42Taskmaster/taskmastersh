import { createInterface } from 'readline';

import { statusCommand } from './commands';
import { createFetcher } from './http';
import { ReplCommandArgs, Context } from './types';

type ReplCommand = (args: ReplCommandArgs) => Promise<void>

const CommandsMap = new Map<string, ReplCommand>([
    ['status', statusCommand],
]);

async function app() {
    const context: Context = {
        fetcher: createFetcher({
            hostname: 'localhost',
            port: 8080,
        }),
    };

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

    rl.prompt();

    for await (const line of rl) {
        const trimmedCommand = line.trim();

        const commandToRun = CommandsMap.get(trimmedCommand);
        if (commandToRun === undefined) {
            console.error('invalid command');
        } else {
            await commandToRun({
                context,
                line,
            });
        }

        rl.prompt();
    }

    console.log('Have a great day!');
}

app().catch(console.error);
