import { IsNotEmpty, IsNumber } from 'class-validator';

export class PointDto {
  @IsNumber()
  @IsNotEmpty()
  points: number;
}
