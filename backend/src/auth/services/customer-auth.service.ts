import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Customer } from '../../entities/customer.entity';
import { Reservation } from '../../entities/reservation.entity';
import { EmailService } from '../../email/email.service';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async requestMagicLink(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Please provide a valid email address');
    }

    const cleanEmail = email.toLowerCase().trim();

    let customer = await this.customerRepository.findOneBy({ email: cleanEmail });

    if (!customer) {
      customer = this.customerRepository.create({
        email: cleanEmail,
        isProfileCompleted: false,
      });
      await this.customerRepository.save(customer);
    } else if (customer.isProfileCompleted === undefined || customer.isProfileCompleted === null) {
      customer.isProfileCompleted = false;
      await this.customerRepository.save(customer);
    }

    // Generate a 1-hour magic link JWT token
    const magicToken = this.jwtService.sign(
      {
        sub: customer.id,
        email: customer.email,
        role: 'CUSTOMER',
        type: 'MAGIC_LINK',
      },
      { expiresIn: '1h' },
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    const magicLinkUrl = `${frontendUrl}/auth/customer-verify?token=${magicToken}`;

    try {
      await this.emailService.sendResetPasswordEmail(
        cleanEmail,
        customer.firstName || 'Customer',
        magicLinkUrl,
      );
    } catch (err) {
      console.log(`[Customer Magic Link Created]: ${magicLinkUrl}`);
    }

    return {
      message: 'Magic sign-in link sent successfully to your email!',
      magicToken,
      magicLinkUrl,
    };
  }

  async verifyMagicLink(token: string) {
    if (!token) {
      throw new BadRequestException('Magic link token is required');
    }

    try {
      const payload = this.jwtService.verify(token);

      if (payload.role !== 'CUSTOMER') {
        throw new UnauthorizedException('Invalid customer token');
      }

      const customer = await this.customerRepository.findOneBy({ id: payload.sub });
      if (!customer) {
        throw new NotFoundException('Customer record not found');
      }

      const isCompleted = Boolean(customer.isProfileCompleted);

      // Generate standard customer session JWT (valid for 7 days)
      const access_token = this.jwtService.sign({
        sub: customer.id,
        email: customer.email,
        role: 'CUSTOMER',
      });

      return {
        message: 'Customer verified and logged in successfully',
        access_token,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          phone: customer.phone || '',
          address: customer.address || '',
          isProfileCompleted: isCompleted,
        },
      };
    } catch (err: any) {
      throw new UnauthorizedException(
        err.message || 'Invalid or expired magic link',
      );
    }
  }

  async getProfile(customerId: string) {
    const customer = await this.customerRepository.findOneBy({ id: customerId });
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      address: customer.address || '',
      isProfileCompleted: Boolean(customer.isProfileCompleted),
    };
  }

  async completeProfile(
    customerId: string,
    dto: { firstName: string; lastName: string; phone: string; address?: string },
  ) {
    if (!dto.firstName || !dto.lastName || !dto.phone) {
      throw new BadRequestException(
        'First Name, Last Name, and Phone Number are required to complete your profile',
      );
    }

    const customer = await this.customerRepository.findOneBy({ id: customerId });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    customer.firstName = dto.firstName.trim();
    customer.lastName = dto.lastName.trim();
    customer.phone = dto.phone.trim();
    if (dto.address !== undefined) {
      customer.address = dto.address.trim();
    }
    customer.isProfileCompleted = true;

    await this.customerRepository.save(customer);

    return {
      message: 'Profile completed successfully!',
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        address: customer.address,
        isProfileCompleted: true,
      },
    };
  }

  async getCustomerReservations(customerId: string) {
    const reservations = await this.reservationRepository.find({
      where: { customerId },
      relations: {
        photographer: true,
      },
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    return reservations.map((res) => ({
      id: res.id,
      date: res.date,
      startTime: res.startTime,
      endTime: res.endTime,
      eventType: res.eventType,
      location: res.location,
      city: res.city,
      district: res.district,
      status: res.status,
      reservationToken: res.reservationToken,
      totalAmountInCents: res.totalAmountInCents,
      selectedPackages: res.selectedPackages,
      clientSelectedPackageId: res.clientSelectedPackageId,
      createdAt: res.createdAt,
      photographer: res.photographer
        ? {
            id: res.photographer.id,
            firstName: res.photographer.firstName,
            lastName: res.photographer.lastName,
            email: res.photographer.email,
          }
        : null,
    }));
  }
}
