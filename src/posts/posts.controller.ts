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
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { Types } from 'mongoose';
import { JwtDto } from 'src/dto/jwt-dto';
import { TogglePostDto } from 'src/dto/toggle-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async findAll(@Body() data: JwtDto) {
    return await this.postsService.getAll(data.jwt);
  }

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get(':id')
  async findById(@Param('id') id: Types.ObjectId, @Body('jwt') jwt?: JwtDto) {
    const { filteredPost, authUserId } = await this.postsService.findById(
      id,
      jwt,
    );
    if (filteredPost == null) {
      throw new NotFoundException();
    }

    if (filteredPost.isPrivate) {
      if (filteredPost.userId !== authUserId) throw new NotFoundException();
    }

    return filteredPost;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: Types.ObjectId) {
    await this.postsService.deleteById(id);
  }

  @Get(':id/pings')
  async findPostPings(
    @Param('id') id: Types.ObjectId,
    @Body('jwt') jwt?: JwtDto,
  ) {
    return await this.postsService.findPostPings(id);
  }

  @Patch(':id/pings')
  @HttpCode(HttpStatus.NO_CONTENT)
  async ping(
    @Param('id') id: Types.ObjectId,
    @Body() togglePostDto: TogglePostDto,
  ) {
    await this.postsService.pingPost(id, togglePostDto);
  }
}
