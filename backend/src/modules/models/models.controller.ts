import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { ModelsService } from './models.service';
import { CreateModelDto, UpdateModelDto } from './dto/model.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('models')
export class ModelsController {
  constructor(private service: ModelsService) {}

  @Get()
  @Permissions('equipments.read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('equipments.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('equipments.create')
  create(@Body() dto: CreateModelDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('equipments.update')
  update(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('equipments.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
