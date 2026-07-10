import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';

@Module({
  imports: [CommonModule],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
