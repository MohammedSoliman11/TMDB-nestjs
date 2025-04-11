import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { UserFavorite } from '../schemas/UserFavorite.schema';
import { Movie } from '../schemas/movie.schema';
import { HttpException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: any;
  let mockUserFavoriteModel: any;
  let mockMovieModel: any;

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
    };

    mockUserFavoriteModel = {
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockMovieModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(UserFavorite.name),
          useValue: mockUserFavoriteModel,
        },
        {
          provide: getModelToken(Movie.name),
          useValue: mockMovieModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto = { email: 'test@test.com', password: 'password' };
      const mockUser = { ...createUserDto, save: jest.fn().mockResolvedValue(createUserDto) };
      mockUserModel.prototype.save = jest.fn().mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', email: 'user1@test.com' }];
      mockUserModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUsers) });

      const result = await service.getUsers();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: '1', email: 'user1@test.com' };
      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      const result = await service.getUserById('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto = { userName: 'test name' };
      const mockUser = { id: '1', ...updateUserDto };
      mockUserModel.findByIdAndUpdate.mockReturnValue({ 
        exec: jest.fn().mockResolvedValue(mockUser) 
      });

      const result = await service.updateUser('1', updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('addFavorite', () => {
    it('should add a movie to favorites', async () => {
      const userId = '1';
      const movieId = 123;
      const mockUser = { id: userId };
      const mockMovie = { id: movieId };
      const mockFavorite = { userId, movieId };

      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      mockMovieModel.findOne.mockResolvedValue(mockMovie);
      mockUserFavoriteModel.create.mockResolvedValue(mockFavorite);

      const result = await service.addFavorite(userId, movieId);
      expect(result).toEqual(mockFavorite);
    });

    it('should throw if user not found', async () => {
      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.addFavorite('1', 123))
        .rejects.toBeInstanceOf(HttpException);
    });

    it('should throw if movie not found', async () => {
      const mockUser = { id: '1' };
      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      mockMovieModel.findOne.mockResolvedValue(null);

      await expect(service.addFavorite('1', 123))
        .rejects.toBeInstanceOf(HttpException);
    });
  });
});