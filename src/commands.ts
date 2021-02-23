import { ReplCommandArgs, assertContextWithFetcher } from './types';

export async function statusCommand({
    context,
}: ReplCommandArgs): Promise<void> {
    assertContextWithFetcher(context);

    const { fetcher } = context;

    const response = await fetcher.get({
        path: '/status',
    });

    const content = await response.json();

    console.log('content', content);
}
