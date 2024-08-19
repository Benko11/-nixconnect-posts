import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './post.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private jwtService: JwtService,
  ) {}

  async getAll() {
    return await this.postModel.find();
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const payload = await this.jwtService.verifyAsync(createPostDto.jwt, {
      secret: process.env.JWT_SECRET,
    });
    const userId = payload.id;

    const createdPost = new this.postModel({ ...createPostDto, userId });
    return await createdPost.save();
  }

  async findById(id: Types.ObjectId) {
    return await this.postModel.findById(id);
  }

  async deleteById(id: Types.ObjectId) {
    await this.postModel.findByIdAndDelete(id);
    return;
  }
}
