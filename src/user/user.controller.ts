import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Headers,
  UnauthorizedException,
  BadRequestException,
  Response,
  UseGuards,
  HttpCode,
  Req,
  Res,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import {
  GetCheckNicknameOverlapDto,
  LoginDto,
  UserFollowDto,
} from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from 'src/utils/verifyToken';
import { UserFollowEntity } from 'src/entities/userFollows.entity';

// 회원가입 : 회원가입 상세, 로그아웃, 회원탈퇴, 회원 정보 수정, 닉네임 중복 체크(O),
// 유저 팔로우 : 목록(O), 생성(O), 삭제(O)
// 유저 차단 : 목록, 생성, 삭제

@Controller('/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly JwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  // 닉네임 중복 체크 : O
  @Get('/check/:nickname')
  async getCheckNicknameOverlap(
    @Param('nickname') nickname: string,
  ): Promise<string> {
    return await this.userService.getCheckNicknameOverlap(nickname);
  }

  // 유저 팔로우(생성) : O
  @Post('/follow/:followUserId')
  async createUserFollow(
    @Headers('authorization') token: string,
    @Param('followUserId') followUserId: number,
  ): Promise<void> {
    const decodedToken = this.tokenService.verifyToken(token);
    const userFollowDto: UserFollowDto = {
      userId: Number(decodedToken.aud),
      followUserId: Number(followUserId),
    };

    return await this.userService.createUserFollow(userFollowDto);
  }

  // 유저 팔로우(삭제) : O
  @Delete('/follow/:followUserId')
  async deleteUserFollow(
    @Headers('authorization') token: string,
    @Param('followUserId') followUserId: number,
  ): Promise<void> {
    const decodedToken = this.tokenService.verifyToken(token);
    const userFollowDto: UserFollowDto = {
      userId: Number(decodedToken.aud),
      followUserId: Number(followUserId),
    };

    return await this.userService.deleteUserFollow(userFollowDto);
  }

  //  - 팔로잉 목록 : O / 내가 팔로우 한 = 내 id가 userId에 있고, followUserId를 찾아 출력
  @Get('/following')
  async userFollowingList(
    @Headers('authorization') token: string,
  ): Promise<UserFollowEntity[] | null> {
    const decodedToken = this.tokenService.verifyToken(token);

    const userId = decodedToken.aud;

    return await this.userService.followingList(userId);
  }

  //  - 팔로워 목록 : O / 나를 팔로우 한 = 내 id가 followUserId에 있고, userId를 찾아 출력
  @Get('/follower')
  async userFollowerList(
    @Headers('authorization') token: string,
  ): Promise<UserFollowEntity[] | null> {
    const decodedToken = this.tokenService.verifyToken(token);

    const followUserId = decodedToken.aud;

    return await this.userService.followerList(followUserId);
  }

  // 테스트용 로그인 -----------------------------------------------

  @Post('/login')
  @HttpCode(200)
  async login(@Req() req: Request): Promise<LoginDto> {
    const { socialAccountUid } = req.body;

    return await this.userService.login(socialAccountUid);
  }

  // -----------------------------------------------------------------
  // verifyToken(token: string): { aud: number } {
  //   const decodedToken = this.JwtService.verify(token);

  //   return decodedToken;
  // }

  // ------------------------------------------------------------

  // @Post('/signup')
  // async login(@Body() body: any, @Response() res): Promise<any> {
  //   try {
  //     const { domain } = body; // code,
  //     console.log(`domain:::::::::    ${domain}`);
  //     console.log(`body:::::::::    ${body}`);

  //     if (!domain) {
  //       // !code ||
  //       throw new BadRequestException('카카오 로그인 정보가 없습니다.');
  //     }
  //     const kakao = await this.userService.kakaoLogin({ domain }); // code,
  //     console.log(`kakaoUser: ${JSON.stringify(kakao)}`);
  //     res.send({
  //       user: kakao,
  //       message: 'success',
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     throw new UnauthorizedException();
  //   }
  // }
}
