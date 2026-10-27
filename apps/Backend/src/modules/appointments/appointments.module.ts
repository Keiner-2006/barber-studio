import { Module } from '@nestjs/common';
import { AppointmentsController } from './adapters/http/appointments.controller';
import { TypeOrmAppointmentRepository } from './drivers/persistence/typeorm-appointment.repository';
import { TypeOrmAppointmentPaymentRepository } from './drivers/persistence/typeorm-appointment-payment.repository';
import { GetAppointmentsUseCase } from './domain/use-cases/get-appointments.use-case';

@Module({
  controllers: [AppointmentsController],
  providers: [
    TypeOrmAppointmentRepository,
    TypeOrmAppointmentPaymentRepository,
    GetAppointmentsUseCase,
    {
      provide: 'IAppointmentRepository',
      useExisting: TypeOrmAppointmentRepository,
    },
    {
      provide: 'IAppointmentPaymentRepository',
      useExisting: TypeOrmAppointmentPaymentRepository,
    },
  ],
  exports: [TypeOrmAppointmentRepository, TypeOrmAppointmentPaymentRepository, 'IAppointmentRepository', 'IAppointmentPaymentRepository', GetAppointmentsUseCase],
})
export class AppointmentsModule {}