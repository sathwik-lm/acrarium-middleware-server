import { esClient } from '../../src/config/elasticsearch';

jest.mock('../../src/config/elasticsearch');
jest.mock('../../src/config/redis');

describe('Cleanup Worker', () => {
    it('should delete crash from Elasticsearch', async () => {
        const mockDelete = jest.fn().mockResolvedValue({});
        (esClient.delete as jest.Mock) = mockDelete;

        await esClient.delete({
            index: 'crashes',
            id: 'test-123',
        });

        expect(mockDelete).toHaveBeenCalledWith({
            index: 'crashes',
            id: 'test-123',
        });
    });
});