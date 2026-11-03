import {
  IsBoolean,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessTypeEnum } from '../../../auth/drivers/persistence/platform-tenant.entity';

const E164_REGEX = /^\+[1-9]\d{1,14}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class AccountDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del propietario es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido del propietario es requerido' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(10, { message: 'Tipo de documento inválido' })
  documentType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Número de documento inválido' })
  documentNumber?: string;

  @IsString()
  @IsNotEmpty({ message: 'El celular del propietario es requerido' })
  @Matches(E164_REGEX, {
    message: 'El celular debe estar en formato internacional E.164 (ej. +573001234567)',
  })
  phone: string;

  @IsString()
  @IsOptional()
  @Matches(E164_REGEX, {
    message: 'El WhatsApp personal debe estar en formato internacional E.164 (ej. +573001234567)',
  })
  whatsapp?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  city?: string;
}

export class BusinessDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre comercial es requerido' })
  @MinLength(2, { message: 'El nombre comercial debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre comercial no puede exceder 150 caracteres' })
  tradeName: string;

  @IsString()
  @IsNotEmpty({ message: 'La razón social es requerida' })
  @MinLength(2, { message: 'La razón social debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'La razón social no puede exceder 150 caracteres' })
  legalName: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  @Matches(SLUG_REGEX, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  @MaxLength(100, { message: 'El slug no puede exceder 100 caracteres' })
  slug: string;

  @IsIn(Object.values(BusinessTypeEnum), {
    message: 'Tipo de negocio inválido',
  })
  businessType: BusinessTypeEnum;

  @IsString()
  @IsOptional()
  @MaxLength(5, { message: 'Código de país inválido' })
  countryCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;
}

export class LocationDto {
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El barrio no puede exceder 100 caracteres' })
  neighborhood?: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección del negocio es requerida' })
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  address?: string;

  @IsString()
  @IsOptional()
  @Matches(E164_REGEX, {
    message:
      'El WhatsApp público del negocio debe estar en formato internacional E.164 (ej. +573001234567)',
  })
  whatsapp?: string;

  @IsEmail({}, { message: 'El correo de notificaciones no es válido' })
  @IsOptional()
  email?: string;
}

export class ScheduleDto {
  @IsArray()
  @IsOptional()
  schedules?: unknown[];

  @IsArray()
  @IsOptional()
  services?: unknown[];
}

export class BrandingDto {
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  colorPreset?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  tiktok?: string;
}

export class CreateOnboardingDto {
  @ValidateNested()
  @Type(() => AccountDto)
  account: AccountDto;

  @ValidateNested()
  @Type(() => BusinessDto)
  business: BusinessDto;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsBoolean({ message: 'consentAccepted es requerido' })
  consentAccepted: boolean;

  @ValidateNested()
  @Type(() => ScheduleDto)
  @IsOptional()
  schedule?: ScheduleDto;

  @ValidateNested()
  @Type(() => BrandingDto)
  @IsOptional()
  branding?: BrandingDto;
}
