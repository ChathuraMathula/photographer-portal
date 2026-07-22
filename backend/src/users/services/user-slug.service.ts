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

  buildSlug(firstName: string, lastName: string): string {
    return `${firstName}-${lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
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
