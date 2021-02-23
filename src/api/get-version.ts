import { Fetcher, isVersionResponse } from '../types';

export async function getVersion(fetcher: Fetcher): Promise<string> {
    const response = await fetcher.get({
        path: '/version',
    });

    const data = await response.json();
    if (!isVersionResponse(data)) {
        throw new Error('Invalid response');
    }

    return data.result;
}
