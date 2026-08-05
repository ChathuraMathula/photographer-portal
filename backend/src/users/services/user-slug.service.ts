import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';

@Injectable()
export class UserSlugService {
  constructor(
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
  ) {}

  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  buildSlug(firstName: string, lastName: string): string {
    return this.slugify(`${firstName}-${lastName}`);
  }

  async resolveSlug(base: string): Promise<string> {
    let slug = base;
    let i = 1;
    while (await this.profileRepository.findOneBy({ bookingSlug: slug })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }
}
