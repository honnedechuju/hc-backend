import { IsString, IsUrl } from 'class-validator';

export class CreateVideoDto {
  @IsUrl()
  url: string;
}
