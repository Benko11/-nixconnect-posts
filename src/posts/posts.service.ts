import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtDto } from 'src/dto/jwt-dto';
import { TogglePostDto } from 'src/dto/toggle-post.dto';
import { Toggle } from './schemas/toggle.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private jwtService: JwtService,
  ) {}

  async getAll(jwt: string) {
    const userId = await this.getUserId(jwt);
    return await this.postModel.find({ userId }).exec();
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const userId = await this.getUserId(createPostDto.jwt);

    const createdPost = new this.postModel({ ...createPostDto, userId });
    return await createdPost.save();
  }

  async findById(id: Types.ObjectId, jwt?: JwtDto) {
    const authUserId = await this.getUserId(jwt as unknown as string);
    const filteredPost = await this.postModel.findById(id).exec();
    return {
      filteredPost,
      authUserId: authUserId == null ? null : authUserId,
    };
  }

  async deleteById(id: Types.ObjectId) {
    this.verifyID(id);

    await this.postModel.findByIdAndDelete(id);
    return;
  }

  async pingPost(id: Types.ObjectId, togglePostDto: TogglePostDto) {
    const authUserId = await this.getUserId(togglePostDto.jwt);
    const filteredPost = await this.postModel.findById(id).exec();

    if (authUserId === filteredPost.userId || authUserId == null)
      throw new UnauthorizedException();

    const pingByUserId = await this.findPingByUserId(id, authUserId);
    const existsPing = pingByUserId.length > 0;

    if (togglePostDto.toggle) {
      if (existsPing) return;

      const ping = new Toggle();
      ping.userId = authUserId;

      return this.postModel.findByIdAndUpdate(
        id,
        { $push: { pings: ping } },
        { new: true },
      );
    }

    if (existsPing) {
      await this.postModel.findByIdAndUpdate(
        id,
        {
          $pull: { pings: { userId: authUserId } },
        },
        { new: true },
      );
    }
  }

  async findPingByUserId(postId: Types.ObjectId, userId: number) {
    const ping = (await this.findPostPings(postId)).filter(
      (item) => item.userId === userId,
    );
    return ping;
  }

  async findPostPings(postId: Types.ObjectId) {
    return (await this.postModel.findOne({ _id: postId })).pings;
  }

  async getUserId(jwt: string) {
    try {
      const payload = await this.jwtService.verifyAsync(jwt, {
        secret: process.env.JWT_SECRET,
      });
      return payload.id;
    } catch {
      return null;
    }
  }

  async verifyID(id: Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException();
    }

    if ((await this.postModel.findById(id).exec()) == null)
      throw new NotFoundException();
  }
}
