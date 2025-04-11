import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MovieService } from './movie.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all movies' })
  @ApiResponse({ status: 200, description: 'Return all movies' })
  async getMovies() {
    return this.movieService.getMovies();
  }

  @Get('sync')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sync movies from TMDB' })
  @ApiResponse({ status: 200, description: 'Movies synced successfully' })
  @ApiResponse({ status: 500, description: 'Sync failed' })
  async syncMovies() {
    return this.movieService.fetchMovies();
  }
}