import { Fetcher, isStopProgramResponse } from '../types';

export async function stopProgram(fetcher: Fetcher, programId: string): Promise<void> {
    const response = await fetcher.post({
        path: '/stop',
        json: {
            program_id: programId,
        },
    });
    const data = await response.json();
    if (!isStopProgramResponse(data)) {
        throw new Error('Invalid response');
    }
}
