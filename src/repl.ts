import { createInterface } from 'readline';

async function app() {
    console.log('Welcome to Taskmastersh!');

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '$> ',
    });

    rl.prompt();

    for await (const line of rl) {
        switch (line.trim()) {
        case 'hello':
            console.log('world!');
            break;
        default:
            console.log(`Say what? I might have heard '${line.trim()}'`);
            break;
        }

        rl.prompt();
    }

    console.log('Have a great day!');
}

app().catch(console.error);
