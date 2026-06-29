import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards/auth.guards';
import { Permissions } from '../../common/decorators/auth.decorators';
import { SearchService } from './search.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('search')
export class SearchController {
  constructor(private service: SearchService) {}

  @Get()
  @Permissions('stations.read')
  search(@Query('q') q: string) {
    return this.service.search(q);
  }
}
