import { Fetcher, isGetAllProgramsResponse, Program } from '../types';

export async function getAllPrograms(fetcher: Fetcher): Promise<Program[]> {
    const response = await fetcher.get({
        path: '/status',
    });
    const programs = await response.json();
    if (!isGetAllProgramsResponse(programs)) {
        throw new Error('Invalid content');
    }

    return programs.result.programs;
}
