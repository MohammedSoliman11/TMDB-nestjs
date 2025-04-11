import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/CreatUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
//   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async getUsers() {
    return this.userService.getUsers();
  }

  @Get(':id')
//   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return a user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
//   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Post(':id/favorites/:movieId')
//   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add movie to user favorites' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'movieId', description: 'Movie ID' })
  @ApiResponse({ status: 201, description: 'Movie added to favorites' })
  @ApiResponse({ status: 404, description: 'User or movie not found' })
  async addFavorite(@Param('id') id: string, @Param('movieId') movieId: number) {
    return this.userService.addFavorite(id, movieId);
  }

  // get user favorites
  @Get(':id/favorites')
//   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return user favorites' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getFavorites(@Param('id') id: string) {
    return this.userService.getFavorites(id);
  }
}