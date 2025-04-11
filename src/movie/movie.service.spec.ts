import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../config/redis.config';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from '../schemas/movie.schema';

describe('MovieService', () => {
  let service: MovieService;
  let mockMovieModel: any;
  let mockConfigService: any;
  let mockRedisService: any;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      setex: jest.fn(),
    };

    mockMovieModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      insertMany: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken(Movie.name),
          useValue: mockMovieModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMovies', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ];
      mockMovieModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMovies),
      });

      const result = await service.getMovies();
      expect(result).toEqual(mockMovies);
    });

    it('should handle errors', async () => {
      mockMovieModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.getMovies()).rejects.toThrow('Database error');
    });
  });

  describe('fetchMovies', () => {
    it('should return cached data if available', async () => {
      const cachedData = { results: [{ id: 1, title: 'Cached Movie' }] };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.fetchMovies();
      expect(result).toEqual(cachedData);
    });

    it('should fetch and process new movies if no cache', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'TMDB_API_URL') return 'http://api.tmdb.org';
        if (key === 'TMDB_API_KEY') return 'test-key';
      });

      mockMovieModel.find.mockResolvedValue([]);
      mockMovieModel.insertMany.mockResolvedValue([]);

      const result = await service.fetchMovies();
      expect(result).toBeDefined();
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });
  });

  describe('scheduledMovieSync', () => {
    it('should run movie sync successfully', async () => {
      const fetchMoviesSpy = jest.spyOn(service, 'fetchMovies')
        .mockResolvedValue({ results: [] });

      await service.scheduledMovieSync();
      expect(fetchMoviesSpy).toHaveBeenCalled();
    });

    it('should handle errors during sync', async () => {
      jest.spyOn(service, 'fetchMovies')
        .mockRejectedValue(new Error('Sync failed'));

      await service.scheduledMovieSync();
      // Should not throw error and log it instead
    });
  });
});