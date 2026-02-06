import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, ReservationStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { ReservationsRepository } from './repositories/reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async create(eventId: string, userId: string) {
    const event = await this.reservationsRepository.findEventById(eventId);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Seuls les événements publiés peuvent être réservés',
      );
    }
    const confirmedCount =
      await this.reservationsRepository.countConfirmedByEventId(eventId);
    if (confirmedCount >= event.capacity) {
      throw new BadRequestException("L'événement est complet");
    }
    const existing = await this.reservationsRepository.findActiveByUserAndEvent(
      userId,
      eventId,
    );
    if (existing) {
      throw new BadRequestException(
        'Vous avez déjà une réservation active pour cet événement',
      );
    }
    return this.reservationsRepository.create(
      userId,
      eventId,
      ReservationStatus.PENDING,
    );
  }

  async getReservationsByEventId(eventId: string) {
    const event = await this.reservationsRepository.findEventById(eventId);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    return this.reservationsRepository.findManyByEventId(eventId);
  }

  async confirm(reservationId: string) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Seules les réservations en attente peuvent être confirmées',
      );
    }
    const confirmedCount =
      await this.reservationsRepository.countConfirmedByEventId(
        reservation.eventId,
      );
    if (confirmedCount >= reservation.event.capacity) {
      throw new BadRequestException("L'événement est complet");
    }
    return this.reservationsRepository.updateStatus(
      reservationId,
      ReservationStatus.CONFIRMED,
    );
  }

  async refuse(reservationId: string) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Seules les réservations en attente peuvent être refusées',
      );
    }
    return this.reservationsRepository.updateStatus(
      reservationId,
      ReservationStatus.REFUSED,
    );
  }

  async cancelByAdmin(reservationId: string) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }
    if (
      reservation.status === ReservationStatus.REFUSED ||
      reservation.status === ReservationStatus.CANCELED
    ) {
      throw new BadRequestException(
        'Cette réservation ne peut plus être annulée',
      );
    }
    return this.reservationsRepository.updateStatus(
      reservationId,
      ReservationStatus.CANCELED,
    );
  }

  async cancelByParticipant(reservationId: string, userId: string) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }
    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez annuler que vos propres réservations',
      );
    }
    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Seules les réservations en attente ou confirmées peuvent être annulées',
      );
    }
    return this.reservationsRepository.updateStatus(
      reservationId,
      ReservationStatus.CANCELED,
    );
  }

  async getTicket(
    reservationId: string,
    userId: string,
    role: string,
  ): Promise<Buffer> {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        "Le ticket n'est disponible que pour les réservations confirmées",
      );
    }
    const isAdmin = role === 'ADMIN';
    if (!isAdmin && reservation.userId !== userId) {
      throw new ForbiddenException(
        "Vous ne pouvez accéder qu'à vos propres tickets",
      );
    }
    return this.generateTicketPdf(reservation);
  }

  private generateTicketPdf(reservation: {
    id: string;
    status: ReservationStatus;
    user: { firstName: string; lastName: string; email: string };
    event: { title: string; date: Date; location: string };
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const participantName = `${reservation.user.firstName} ${reservation.user.lastName}`;
      const eventDate = new Date(reservation.event.date).toLocaleString(
        'fr-FR',
      );

      doc.fontSize(20).text('Ticket de réservation', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Participant : ${participantName}`);
      doc.text(`Email : ${reservation.user.email}`);
      doc.moveDown();
      doc.text(`Événement : ${reservation.event.title}`);
      doc.text(`Date : ${eventDate}`);
      doc.text(`Lieu : ${reservation.event.location}`);
      doc.moveDown();
      doc.text(`Statut : ${reservation.status}`);
      doc.text(`ID réservation : ${reservation.id}`);

      doc.end();
    });
  }
}
