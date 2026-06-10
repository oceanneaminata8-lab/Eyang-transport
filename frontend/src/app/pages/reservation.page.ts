import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  busOutline,
  checkmarkCircleOutline,
  locationOutline,
  notificationsOutline,
  ticketOutline
} from 'ionicons/icons';
import { ApiService, BootstrapData } from '../core/api.service';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonButton,
    IonContent,
    IonIcon,
    IonSelect,
    IonSelectOption
  ],
  template: `
    <ion-content class="reservation-content">
      <main class="reservation-page">
        <section class="reservation-hero">
          <header class="reservation-header">
            <a class="school-brand" routerLink="/app/student">
              <span class="school-crest" aria-hidden="true">SJ</span>
              <strong>Saint Jean<br>Ingenieur</strong>
            </a>

            <div class="header-actions">
              <a class="header-avatar" routerLink="/app/profile" aria-label="Profile">{{ initials }}</a>
              <a class="notification-button" routerLink="/app/notifications" aria-label="Notifications">
                <ion-icon name="notifications-outline" />
              </a>
            </div>
          </header>

          <div class="hero-content">
            <div class="hero-copy">
              <a class="back-link" routerLink="/app/student">
                <span><ion-icon name="arrow-back-outline" /></span>
                Back
              </a>
              <h1>Reserve<br>Transport</h1>
              <i aria-hidden="true"></i>
              <p>Reserve one spot for {{ monthKey }}.<br>No seat number is assigned.</p>
            </div>
          </div>
        </section>

        <section class="booking-shell">
          <div class="booking-card">
            <div class="selection-row pickup-row">
              <span class="field-icon"><ion-icon name="location-outline" /></span>
              <div class="field-copy">
                <small>Pickup</small>
                <strong>{{ selectedPickup?.name || 'Choose a pickup point' }}</strong>
              </div>
              <ion-select
                class="row-select"
                aria-label="Pickup point"
                interface="popover"
                [(ngModel)]="pickupPointId"
                (ionChange)="selectBusForPickup()">
                @for (point of data?.pickupPoints || []; track point.id) {
                  @if (point.name !== 'Eyang') {
                    <ion-select-option [value]="point.id">{{ point.name }}</ion-select-option>
                  }
                }
              </ion-select>
            </div>

            <div class="selection-row bus-row">
              <span class="field-icon"><ion-icon name="bus-outline" /></span>
              <div class="field-copy">
                <small>Bus</small>
                <strong>
                  @if (selectedBus) {
                    {{ selectedBus.plate_number }} - {{ selectedBus.color }} - {{ selectedBus.capacity }} seats
                  } @else {
                    No bus assigned
                  }
                </strong>

                @if (selectedBus) {
                  <div class="bus-details">
                    <span><ion-icon name="bus-outline" /> {{ selectedBus.capacity }} Seats</span>
                    <span><b [style.background]="busColor"></b> {{ selectedBus.color }}</span>
                    <span><ion-icon name="bus-outline" /> {{ selectedBus.plate_number }}</span>
                  </div>
                }
              </div>

              <div class="bus-preview" aria-hidden="true">
                <div class="bus-image"></div>
              </div>

              <ion-select
                class="row-select"
                aria-label="Bus"
                interface="popover"
                [(ngModel)]="busId">
                @for (bus of busesForPickup; track bus.id) {
                  <ion-select-option [value]="bus.id">
                    {{ bus.plate_number }} - {{ bus.color }} - {{ bus.capacity }} seats
                  </ion-select-option>
                }
              </ion-select>
            </div>

            <ion-button
              expand="block"
              class="confirm-button"
              [disabled]="!busId || submitting"
              (click)="reserve()">
              <span class="ticket-circle"><ion-icon name="ticket-outline" /></span>
              <span>{{ submitting ? 'Confirming...' : 'Confirm Reservation' }}</span>
              <ion-icon class="button-arrow" name="arrow-forward-outline" />
            </ion-button>

            @if (message) {
              <div class="message" [class.success]="reservationConfirmed">
                <ion-icon [name]="reservationConfirmed ? 'checkmark-circle-outline' : 'notifications-outline'" />
                {{ message }}
              </div>
            }
          </div>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .reservation-content { --background: #063b91; }
    .reservation-page {
      min-height: 100%;
      padding-bottom: 112px;
      color: #071d4d;
      background:
        linear-gradient(160deg, #001b45 0%, #032d72 58%, #0759d8 100%);
    }
    a { color: inherit; text-decoration: none; }
    h1, p { margin: 0; }

    .reservation-hero {
      min-height: 690px;
      color: #fff;
      background:
        radial-gradient(circle at 70% 30%, rgba(48,111,218,.24), transparent 35%),
        linear-gradient(90deg, rgba(0,24,61,.99) 0%, rgba(1,32,77,.93) 35%, rgba(3,36,82,.14) 68%),
        url('/assets/student-dashboard-bus.png') center right / cover no-repeat;
    }
    .reservation-header {
      max-width: 1400px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 54px;
      margin: 0 auto;
    }
    .school-brand { display: inline-flex; align-items: center; gap: 16px; }
    .school-brand strong { color: #fff; font-size: 23px; line-height: 1.05; }
    .school-crest {
      width: 62px;
      height: 70px;
      display: grid;
      place-items: center;
      color: #fff;
      border: 3px solid #fff;
      border-radius: 13px 13px 26px 26px;
      box-shadow: inset 0 0 0 3px rgba(255,255,255,.16);
      font-size: 20px;
      font-weight: 900;
    }
    .header-actions { display: flex; align-items: center; gap: 24px; }
    .header-avatar {
      width: 72px;
      height: 72px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #fff;
      color: #1260c8;
      font-size: 24px;
      font-weight: 900;
    }
    .notification-button { display: grid; place-items: center; color: #fff; font-size: 32px; }
    .hero-content {
      max-width: 1400px;
      min-height: 530px;
      display: flex;
      align-items: flex-start;
      padding: 24px 54px 112px;
      margin: 0 auto;
    }
    .hero-copy { width: 44%; }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 38px;
      font-size: 20px;
      font-weight: 750;
    }
    .back-link span {
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: rgba(9,80,177,.6);
      color: #8bbdff;
      font-size: 28px;
    }
    .hero-copy h1 {
      font-size: clamp(52px, 5.4vw, 76px);
      line-height: .98;
      font-weight: 850;
      letter-spacing: -.035em;
    }
    .hero-copy i {
      display: block;
      width: 66px;
      height: 5px;
      margin: 38px 0 34px;
      border-radius: 5px;
      background: #1689ff;
    }
    .hero-copy p { color: rgba(255,255,255,.82); font-size: 25px; line-height: 1.65; }

    .booking-shell {
      max-width: 1320px;
      padding: 0 34px 38px;
      margin: -92px auto 0;
      position: relative;
      z-index: 2;
    }
    .booking-shell::before {
      content: "";
      position: absolute;
      inset: 0 0 0;
      border-radius: 16px;
      background: rgba(255,255,255,.97);
      box-shadow: 0 9px 28px rgba(0,20,59,.17);
    }
    .booking-card {
      position: relative;
      margin: 26px;
      padding: 30px;
      border-radius: 12px;
      background: #f8faff;
      box-shadow: inset 0 0 0 1px rgba(219,229,243,.9);
    }
    .selection-row {
      position: relative;
      display: grid;
      grid-template-columns: 112px 1fr;
      align-items: center;
      gap: 28px;
      min-height: 150px;
    }
    .pickup-row { border-bottom: 1px solid #dbe4f1; }
    .bus-row {
      grid-template-columns: 112px minmax(0, 1fr) 300px;
      min-height: 250px;
      padding: 28px 0;
    }
    .field-icon {
      width: 104px;
      height: 104px;
      display: grid;
      place-items: center;
      border-radius: 24px;
      color: #fff;
      background: linear-gradient(145deg, #0879ed, #073dc2);
      box-shadow: 0 14px 28px rgba(8,78,198,.18);
      font-size: 52px;
    }
    .field-copy { min-width: 0; }
    .field-copy small {
      display: block;
      margin-bottom: 10px;
      color: #47536e;
      font-size: 22px;
    }
    .field-copy strong {
      display: block;
      color: #061c51;
      font-size: clamp(25px, 3vw, 36px);
      line-height: 1.25;
    }
    .row-select {
      position: absolute;
      inset: 0;
      z-index: 3;
      width: 100%;
      max-width: none;
      opacity: 0;
      cursor: pointer;
    }
    .bus-details {
      width: fit-content;
      display: flex;
      align-items: center;
      gap: 26px;
      margin-top: 34px;
      padding: 14px 24px;
      border-radius: 16px;
      background: #eaf1fc;
      color: #2f3b58;
      font-size: 17px;
    }
    .bus-details span { display: inline-flex; align-items: center; gap: 9px; white-space: nowrap; }
    .bus-details ion-icon { color: #0b54c6; font-size: 24px; }
    .bus-details b { width: 20px; height: 20px; border-radius: 50%; background: #1562d1; }
    .bus-preview {
      height: 180px;
      overflow: hidden;
      border-radius: 18px;
      pointer-events: none;
    }
    .bus-image {
      width: 100%;
      height: 100%;
      background: url('/assets/student-dashboard-bus.png') 78% 54% / 255% auto no-repeat;
      filter: drop-shadow(0 12px 12px rgba(0,30,78,.15));
      transform: scale(.96);
    }

    .confirm-button {
      --background: linear-gradient(90deg, #0a63e9, #093bc4);
      --background-hover: linear-gradient(90deg, #0758d4, #0735af);
      --border-radius: 12px;
      --box-shadow: 0 6px 16px rgba(7,68,194,.18);
      height: 76px;
      margin: 18px 0 0;
      font-size: 20px;
      font-weight: 800;
      text-transform: none;
    }
    .confirm-button::part(native) { padding: 0 40px; }
    .ticket-circle {
      width: 68px;
      height: 68px;
      display: grid;
      place-items: center;
      margin-right: 18px;
      border-radius: 50%;
      background: #fff;
      color: #0b4dcc;
      font-size: 36px;
    }
    .button-arrow { margin-left: auto; font-size: 36px; }
    .message {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding: 15px 18px;
      border-radius: 15px;
      color: #9b4a00;
      background: #fff0d6;
      font-weight: 750;
    }
    .message.success { color: #087d43; background: #e1f8ea; }
    .message ion-icon { flex: 0 0 auto; font-size: 24px; }

    @media (max-width: 900px) {
      .reservation-hero { min-height: 610px; background-position: 62% center; }
      .reservation-header { height: 105px; padding: 0 24px; }
      .school-crest { width: 46px; height: 52px; border-width: 2px; border-radius: 10px 10px 19px 19px; font-size: 14px; }
      .school-brand { gap: 10px; }
      .school-brand strong { font-size: 16px; }
      .header-avatar { width: 48px; height: 48px; font-size: 16px; }
      .notification-button { font-size: 26px; }
      .hero-content { min-height: 505px; padding: 30px 24px 110px; }
      .hero-copy { width: 68%; }
      .back-link { margin-bottom: 30px; font-size: 17px; }
      .back-link span { width: 46px; height: 46px; }
      .hero-copy h1 { font-size: 48px; }
      .hero-copy i { margin: 28px 0 24px; }
      .hero-copy p { font-size: 19px; }
      .booking-shell { padding: 0 16px 26px; margin-top: -74px; }
      .booking-card { margin: 22px; padding: 26px; border-radius: 24px; }
      .selection-row, .bus-row { grid-template-columns: 76px 1fr; gap: 18px; }
      .selection-row { min-height: 126px; }
      .bus-row { min-height: 250px; padding: 22px 0; }
      .field-icon { width: 72px; height: 72px; border-radius: 19px; font-size: 36px; }
      .field-copy small { font-size: 17px; }
      .field-copy strong { font-size: 23px; }
      .bus-details { flex-wrap: wrap; gap: 12px 18px; margin-top: 20px; padding: 12px 16px; font-size: 14px; }
      .bus-preview { display: none; }
      .confirm-button { height: 86px; font-size: 21px; }
      .ticket-circle { width: 54px; height: 54px; font-size: 28px; }
    }

    @media (max-width: 520px) {
      .reservation-page { padding-bottom: 94px; }
      .reservation-hero { min-height: 570px; background-position: 68% center; }
      .hero-copy { width: 86%; }
      .hero-copy h1 { font-size: 42px; }
      .hero-copy p { max-width: 290px; font-size: 17px; }
      .booking-shell { padding: 0 10px 20px; }
      .booking-shell::before { border-radius: 26px; }
      .booking-card { margin: 14px; padding: 20px 16px; }
      .selection-row, .bus-row { grid-template-columns: 62px 1fr; gap: 14px; }
      .field-icon { width: 60px; height: 60px; border-radius: 16px; font-size: 30px; }
      .field-copy small { margin-bottom: 6px; font-size: 15px; }
      .field-copy strong { font-size: 19px; }
      .bus-details { gap: 9px 12px; margin-top: 15px; font-size: 12px; }
      .bus-details ion-icon { font-size: 18px; }
      .confirm-button { height: 74px; font-size: 17px; }
      .confirm-button::part(native) { padding: 0 16px; }
      .ticket-circle { width: 44px; height: 44px; margin-right: 10px; font-size: 23px; }
      .button-arrow { font-size: 26px; }
    }
  `]
})
export class ReservationPage implements OnInit {
  data?: BootstrapData;
  busId = '';
  pickupPointId = '';
  monthKey = new Date().toISOString().slice(0, 7);
  message = '';
  submitting = false;
  reservationConfirmed = false;

  get busesForPickup() {
    return (this.data?.buses || []).filter(bus => bus.pickup_point_id === this.pickupPointId);
  }

  get selectedPickup() {
    return this.data?.pickupPoints.find(point => point.id === this.pickupPointId);
  }

  get selectedBus() {
    return this.data?.buses.find(bus => bus.id === this.busId);
  }

  get busColor() {
    const colors: Record<string, string> = {
      blue: '#155dcc',
      white: '#dce4ef',
      yellow: '#f5bd19',
      red: '#d83b3b',
      black: '#1f2937'
    };
    return colors[(this.selectedBus?.color || '').toLowerCase()] || '#155dcc';
  }

  get initials() {
    const user = JSON.parse(localStorage.getItem('ests_user') || '{}');
    return String(user.fullName || 'Student')
      .split(' ')
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  constructor(private api: ApiService) {
    addIcons({
      arrowBackOutline,
      arrowForwardOutline,
      busOutline,
      checkmarkCircleOutline,
      locationOutline,
      notificationsOutline,
      ticketOutline
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.bootstrap().subscribe(data => {
      this.data = data;
      const existing = data.reservations.find(item => item.month_key === this.monthKey);
      this.pickupPointId = existing?.pickup_point_id
        || data.pickupPoints.find(point => point.name !== 'Eyang')?.id
        || '';
      this.busId = existing?.bus_id || '';
      this.reservationConfirmed = !!existing;
      if (!this.busId) this.selectBusForPickup();
    });
  }

  selectBusForPickup() {
    this.busId = this.busesForPickup[0]?.id || '';
    this.message = '';
    this.reservationConfirmed = false;
  }

  reserve() {
    this.message = '';
    this.reservationConfirmed = false;
    if (!this.busId) {
      this.message = 'No bus is assigned to this pickup point.';
      return;
    }

    const paid = (this.data?.payments || [])
      .some(payment => payment.month_key === this.monthKey && payment.status === 'validated');
    if (!paid) {
      this.message = 'You must pay for this month before reserving a bus.';
      return;
    }

    this.submitting = true;
    this.api.reserve({ busId: this.busId, pickupPointId: this.pickupPointId, monthKey: this.monthKey }).subscribe({
      next: () => {
        this.submitting = false;
        this.message = 'Reservation confirmed.';
        this.reservationConfirmed = true;
        this.load();
      },
      error: err => {
        this.submitting = false;
        this.message = err.error?.message || 'Reservation failed.';
      }
    });
  }
}
