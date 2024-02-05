import {
  Controller,
  Get,
  Headers,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { WeatherDto } from './dto/get-temperature.dto';
import { ClothSetEntity } from 'src/entities/clothesSet.entity';
import { ClothesService } from './clothes.service';
import { TokenService } from 'src/utils/verifyToken';

@Controller('clothes')
export class ClothesController {
  constructor(
    private readonly clothesService: ClothesService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  async getClothesSetIdByWeather(
    @Query() weatherDto: WeatherDto,
    @Headers('Authorization') token?: string,
  ): Promise<{ temperatureSensitivity?: number; clothSets: ClothSetEntity[] }> {
    const { temperature } = weatherDto;

    let loginUserId: number | undefined;

    // 토큰이 존재하면 사용자 확인
    if (token) {
      try {
        loginUserId = this.tokenService.audienceFromToken(token);
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    const result = this.clothesService.getClothesSetIdByTemperature(
      temperature,
      loginUserId,
    );

    return result;
  }
}
