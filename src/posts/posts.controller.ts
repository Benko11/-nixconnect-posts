import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { Types } from 'mongoose';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async findAll() {
    return await this.postsService.getAll();
  }

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get(':id')
  async findById(@Param('id') id: Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException();
    }

    const filteredPost = await this.postsService.findById(id);
    if (filteredPost == null) {
      throw new NotFoundException();
    }

    return filteredPost;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException();
    }

    if (this.findById(id) == null) throw new NotFoundException();

    await this.postsService.deleteById(id);
  }
}
