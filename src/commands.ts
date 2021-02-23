import { ReplCommandArgs, isGetAllProgramsResponse } from './types';

export async function statusCommand({
    context,
}: ReplCommandArgs): Promise<void> {
    const { fetcher } = context;

    const response = await fetcher.get({
        path: '/status',
    });

    const content = await response.json();

    if (!isGetAllProgramsResponse(content)) {
        throw new Error('Invalid content');
    }

    console.dir(content.result.programs, {
        depth: null,
    });
}
