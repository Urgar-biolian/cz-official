import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth, Admin } from '../auth/decorators/auth.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  findAll(@Query('include_deleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.commentService.findAll(include);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Auth()
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization.split(' ')[1];
    const payload = this.jwtService.decode(token) as any;
    const userId = payload.sub;
    
    return this.commentService.create(createCommentDto, userId);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}