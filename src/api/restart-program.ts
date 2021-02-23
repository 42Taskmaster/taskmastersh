import { Fetcher, isRestartProgramResponse } from '../types';

export async function restartProgram(fetcher: Fetcher, programId: string): Promise<void> {
    const response = await fetcher.post({
        path: '/restart',
        json: {
            program_id: programId,
        },
    });
    const data = await response.json();
    if (!isRestartProgramResponse(data)) {
        throw new Error('Invalid response');
    }
}
