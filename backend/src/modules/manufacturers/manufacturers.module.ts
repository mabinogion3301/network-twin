import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { ManufacturersService } from './manufacturers.service';
import { ManufacturersController } from './manufacturers.controller';

@Module({
  imports: [CommonModule],
  controllers: [ManufacturersController],
  providers: [ManufacturersService],
  exports: [ManufacturersService],
})
export class ManufacturersModule {}
