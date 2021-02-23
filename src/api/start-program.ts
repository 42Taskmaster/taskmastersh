import { Fetcher, isStartProgramResponse } from '../types';

export async function startProgram(fetcher: Fetcher, programId: string): Promise<void> {
    const response = await fetcher.post({
        path: '/start',
        json: {
            program_id: programId,
        },
    });
    const data = await response.json();
    if (!isStartProgramResponse(data)) {
        throw new Error('Invalid response');
    }
}
