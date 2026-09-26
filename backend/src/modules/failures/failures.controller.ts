import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guards';
import { FailuresService } from './failures.service';
import { CreateFailureDto, UpdateNoteDto } from './dto/failure.dto';

@UseGuards(JwtAuthGuard)
@Controller('failures')
export class FailuresController {
  constructor(private readonly service: FailuresService) {}

  @Post()
  create(@Body() dto: CreateFailureDto, @Request() req: any) {
    return this.service.create(dto, req.user.sub);
  }

  @Get()
  findActive() {
    return this.service.findActive();
  }

  @Get('history')
  findHistory() {
    return this.service.findHistory();
  }

  @Get('impact')
  getCurrentImpactState() {
    return this.service.getCurrentImpactState();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/acknowledge')
  acknowledge(@Param('id') id: string, @Request() req: any) {
    return this.service.acknowledge(id, req.user.sub);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string, @Request() req: any) {
    return this.service.restore(id, req.user.sub);
  }

  @Patch(':id/note')
  updateNote(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.service.updateNote(id, dto.note);
  }
}
