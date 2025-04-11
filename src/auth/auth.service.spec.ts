import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const signUpDto = { email: 'test@test.com', password: 'password' };
      mockUserModel.findOne.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const mockUser = {
        ...signUpDto,
        password: 'hashedPassword',
        toObject: () => ({ ...signUpDto, password: 'hashedPassword' }),
      };
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.signup(signUpDto);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw if email exists', async () => {
      const signUpDto = { email: 'test@test.com', password: 'password' };
      mockUserModel.findOne.mockResolvedValue({ email: signUpDto.email });

      await expect(service.signup(signUpDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('signin', () => {
    it('should return token on successful login', async () => {
      const signInDto = { email: 'test@test.com', password: 'password' };
      const mockUser = {
        _id: 'userId',
        ...signInDto,
        toObject: () => ({ _id: 'userId', ...signInDto }),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.signin(signInDto);
      expect(result).toHaveProperty('access_token');
    });

    it('should throw on invalid credentials', async () => {
      const signInDto = { email: 'test@test.com', password: 'wrong' };
      mockUserModel.findOne.mockResolvedValue({
        password: 'hashedPassword',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(signInDto))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});