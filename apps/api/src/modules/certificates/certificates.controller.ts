import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/auth.decorators';
import { CertificateQueryDto } from './dto/certificate.dto';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Certificate list retrieved' })
  @ApiOperation({ summary: 'List certificates for the current student' })
  async listMyCertificates(
    @CurrentUser() user: { sub: number; role: string },
    @Query() query: CertificateQueryDto,
  ) {
    const offset = (query.page - 1) * query.limit;
    const result = await this.certificatesService.listStudentCertificates(user.sub, {
      offset,
      limit: query.limit,
    });

    return {
      success: true,
      data: result.data,
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  @Get('verify/:uid')
  @Public()
  @ApiResponse({ status: 200, description: 'Certificate verified' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @ApiParam({ name: 'uid', description: 'Certificate unique ID' })
  @ApiOperation({ summary: 'Verify a certificate by its unique ID (public)' })
  async verifyCertificate(@Param('uid') uid: string) {
    const result = await this.certificatesService.verifyCertificate(uid);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Certificate details' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiOperation({ summary: 'Get certificate details by ID' })
  async getCertificate(
    @CurrentUser() user: { sub: number; role: string },
    @Param('id') id: string,
  ) {
    const certId = parseInt(id, 10);
    const certificate = await this.certificatesService.getCertificateWithDetails(certId);

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return {
      success: true,
      data: certificate,
    };
  }
}
