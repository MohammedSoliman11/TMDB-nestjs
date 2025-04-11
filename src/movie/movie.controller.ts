import { Controller, Get } from '@nestjs/common';
import { MovieService } from './movie.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('sync')
  @ApiOperation({ summary: 'Sync movies from TMDB API' })
  @ApiResponse({ status: 200, description: 'Movies synced successfully' })
  async syncMovies() {
    return this.movieService.fetchMovies();
  }
}