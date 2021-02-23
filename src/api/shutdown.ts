import { Fetcher } from '../types';

export async function shutdown(fetcher: Fetcher): Promise<void> {
    const response = await fetcher.delete({
        path: '/shutdown',
    });
    if (response.statusCode !== 200) {
        throw new Error('Invalid response');
    }
}
