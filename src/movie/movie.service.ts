import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from '../schemas/movie.schema';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../config/redis.config';
import axios from 'axios';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);
  private readonly CACHE_KEY = 'tmdb:movies';
  private readonly CACHE_DURATION = 3600; // 1 hour
  private readonly TOTAL_PAGES = 1;
  private readonly DELAY_BETWEEN_REQUESTS = 250;
  private readonly BATCH_SIZE = 100;

  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchMoviesFromPage(page: number): Promise<any[]> {
    try {
      const { data } = await axios.get(this.configService.get('TMDB_API_URL') || "", {
        params: { page },
        headers: { 
          Authorization: `Bearer ${this.configService.get('TMDB_API_KEY')}` 
        },
      });
    //   console.log('url :', this.configService.get('TMDB_API_URL'))
    //   console.log(`Fetched page ${JSON.stringify(data.results[0], null, 2)} movies`);
      return data.results;
    } catch (err) {
      console.error(`Error fetching page ${page}: ${err.message}`);
      return [];
    }
  }

  private async processMoviesBatch(movies: any[]): Promise<any> {
    try {
      const existingMovies = await this.movieModel.find(
        { id: { $in: movies.map(m => m.id) } },
        { id: 1 }
      );
      const existingIds = new Set(existingMovies.map(m => m.id));
      const newMovies = movies.filter(movie => !existingIds.has(movie.id));

      if (newMovies.length > 0) {
        await this.movieModel.insertMany(newMovies, {
          ordered: false,
          lean: true,
        });
        console.log(`Inserted ${newMovies.length} new movies`);
      }

      return {
        total: movies.length,
        new: newMovies.length,
        existing: movies.length - newMovies.length,
      };
    } catch (err) {
      console.error(`Error processing movies batch: ${err.message}`);
      return {
        total: movies.length,
        new: 0,
        existing: 0,
        error: err.message,
      };
    }
  }

  async fetchMovies() {
    try {
      const redis = this.redisService.getClient();
      const cachedData = await redis.get(this.CACHE_KEY);
      if (cachedData) {
        console.log('Using cached TMDB data from Redis');
        return JSON.parse(cachedData);
      }

      console.log('Starting to fetch movies from TMDB...');
      const allMovies: Movie[] = [];
      let processedStats = {
        total: 0,
        new: 0,
        existing: 0,
        errors: 0,
      };

      for (let page = 1; page <= this.TOTAL_PAGES; page++) {
        console.log(`Fetching page ${page}/${this.TOTAL_PAGES}`);
        const movies = await this.fetchMoviesFromPage(page);

        if (movies.length === 0) {
            
          console.log(`No more movies found after page ${page - 1}`);
          break;
        }

        allMovies.push(...movies);

        if (allMovies.length >= this.BATCH_SIZE) {
          const moviesToProcess = allMovies
            .splice(0, this.BATCH_SIZE)
            .map(movie => ({
              id: movie.id,
              title: movie.title,
              genre_ids: movie.genre_ids,
            }));

          const batchStats = await this.processMoviesBatch(moviesToProcess);
          processedStats.total += batchStats.total;
          processedStats.new += batchStats.new;
          processedStats.existing += batchStats.existing;
          if (batchStats.error) processedStats.errors++;
        }

        if (page < this.TOTAL_PAGES) {
          await this.delay(this.DELAY_BETWEEN_REQUESTS);
        }
      }

      if (allMovies.length > 0) {
        const moviesToProcess = allMovies.map(movie => ({
          id: movie.id,
          title: movie.title,
          genre_ids: movie.genre_ids,
        }));

        const batchStats = await this.processMoviesBatch(moviesToProcess);
        processedStats.total += batchStats.total;
        processedStats.new += batchStats.new;
        processedStats.existing += batchStats.existing;
        if (batchStats.error) processedStats.errors++;
      }

      await redis.setex(
        this.CACHE_KEY,
        this.CACHE_DURATION,
        JSON.stringify({ results: allMovies })
      );

      console.log('Sync completed with the following stats:');
      console.log(`- Total movies processed: ${processedStats.total}`);
      console.log(`- New movies inserted: ${processedStats.new}`);
      console.log(`- Existing movies skipped: ${processedStats.existing}`);
      console.log(`- Errors encountered: ${processedStats.errors}`);

      return { results: allMovies };
    } catch (err) {
      console.error(`Error syncing movies: ${err.message}`);
      throw err;
    }
  }
}