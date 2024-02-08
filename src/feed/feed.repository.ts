import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedEntity } from '../entities/feeds.entity';
import { Repository, Not } from 'typeorm';
import { CreateFeedDTO } from './dto/create-feed.dto';
import { FeedImageEntity } from 'src/entities/feedImages.entity';
import { UpdateFeedDTO } from './dto/update-feed.dto';

@Injectable()
export class FeedRepository {
  constructor(
    @InjectRepository(FeedEntity)
    private readonly feedRepository: Repository<FeedEntity>,
    @InjectRepository(FeedImageEntity)
    private readonly feedImageRepository: Repository<FeedImageEntity>,
  ) {}

  async getFeedListWithDetails(): Promise<FeedEntity[]> {
    try {
      const feedList = await this.feedRepository.find({
        relations: {
          user: true,
          feedImage: true,
          feedComment: true,
          feedLike: true,
          weatherCondition: true,
          bookmark: {
            user: true,
          },
          feedTag: {
            tag: true,
          },
        },
        order: { createdAt: 'DESC' },
        where: {
          deletedAt: null,
          user: Not(null),
        },
      });
      console.log(feedList);
      return feedList;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async getFeedWithDetailsById(feedId: number): Promise<FeedEntity> {
    try {
      const [feed] = await this.feedRepository.find({
        relations: {
          user: true,
          feedImage: true,
          feedComment: {
            user: true,
          },
          feedLike: true,
          weatherCondition: true,
          bookmark: {
            user: true,
          },
          feedTag: {
            tag: true,
          },
        },
        where: { id: feedId, user: Not(null) },
      });
      return feed;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async createFeed(
    userId: number,
    feedData: CreateFeedDTO,
  ): Promise<FeedEntity> {
    try {
      const { weatherConditionId, imageUrl } = feedData;
      const savedFeed = await this.feedRepository.save({
        user: { id: userId },
        weatherCondition: { id: weatherConditionId },
        ...feedData,
      });
      const savedFeedImage = await this.feedImageRepository.save({
        feed: savedFeed,
        imageUrl: imageUrl,
      });
      return savedFeed;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async deletedFeed(feedId: number, newDate: Date): Promise<void> {
    try {
      const result = await this.feedRepository.save({
        id: feedId,
        deletedAt: newDate,
      });
      console.log('delete feed result : ', result);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async updateFeed(feedId: number, feedData: UpdateFeedDTO) {
    const { weatherConditionId, imageUrl, ...updateData } = feedData;
    try {
      if (weatherConditionId) {
        await this.feedRepository.update(
          { id: feedId },
          { weatherCondition: { id: weatherConditionId } },
        );
      }
      const updateFeed = await this.feedRepository.update(
        { id: feedId },
        { ...updateData },
      );
      const updateFeedImage = await this.feedImageRepository.update(
        { feed: { id: feedId } },
        { imageUrl: imageUrl },
      );
      return updateFeed;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async findFeedById(feedId: number): Promise<FeedEntity> {
    try {
      const result = await this.feedRepository.findOne({
        where: { id: feedId, user: Not(null) },
        relations: ['user', 'feedTag'],
      });
      console.log('repo result : ', result);
      return result;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
}
