import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticProductImage(name: string) {
    const path = join(__dirname, '../../static/products/', name);
    if (!existsSync(path))
      throw new BadRequestException('Product image not found');

    return path;
  }
}
