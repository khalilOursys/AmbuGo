import {
  Controller,
  Put,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-setting.dto';
import { companyLogoMulter } from '../config/multer.config';

@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly service: CompanySettingsService) {}

  // GET /company-settings?id=xxx   OR   /company-settings
  @Get()
  getCompany(@Query('id') id?: string) {
    return this.service.get(id);
  }

  // PUT /company-settings  (id comes in body)
  @Put()
  updateProfile(@Body() body: UpdateCompanySettingsDto) {
    return this.service.updateProfile(body);
  }

  // POST /company-settings/logo?id=xxx
  @Post('logo')
  @UseInterceptors(FileInterceptor('logo', companyLogoMulter))
  uploadLogo(
    @Query('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.service.uploadLogo(id, file.filename);
  }

  // DELETE /company-settings/logo?id=xxx
  @Delete('logo')
  deleteLogo(@Query('id') id: string) {
    return this.service.deleteLogo(id);
  }
}
