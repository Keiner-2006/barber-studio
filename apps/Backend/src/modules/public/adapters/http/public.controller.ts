import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Public } from '../../../../common/decorators/public.decorator';

@ApiTags('public')
@Controller('public')
@UseGuards(AuthGuard)
export class PublicController {
  @Get('businesses/:slug')
  @Public()
  @ApiOperation({ summary: 'Obtener negocio público por slug' })
  @ApiResponse({ status: 200, description: 'Información del negocio' })
  async getBusinessBySlug(@Param('slug') slug: string) {
    return { data: { message: 'Public business not implemented yet', slug } };
  }
}