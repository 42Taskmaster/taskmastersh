import { Fetcher } from '../types';

export async function refreshConfiguration(fetcher: Fetcher): Promise<void> {
    const response = await fetcher.put({
        path: '/configuration/refresh',
    });
    if (response.statusCode !== 200) {
        throw new Error('Invalid response');
    }
}
