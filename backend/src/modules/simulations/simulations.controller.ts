import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions, CurrentUser } from '../../common/decorators/auth.decorators';
import { SimulationsService } from './simulations.service';
import { RunSimulationDto } from './dto/simulation.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('simulations')
export class SimulationsController {
  constructor(private service: SimulationsService) {}

  @Post()
  @Permissions('simulations.run')
  run(@Body() dto: RunSimulationDto, @CurrentUser() user: JwtPayload) {
    return this.service.run(dto, user.sub);
  }

  @Get()
  @Permissions('simulations.read')
  findHistory() {
    return this.service.findHistory();
  }

  @Get('current')
  @Permissions('simulations.read')
  getCurrentState() {
    return this.service.getCurrentState();
  }

  @Get(':id')
  @Permissions('simulations.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/notes')
  @Permissions('simulations.run')
  updateNotes(@Param('id') id: string, @Body() body: { notes: string }) {
    return this.service.updateNotes(id, body.notes);
  }
}
