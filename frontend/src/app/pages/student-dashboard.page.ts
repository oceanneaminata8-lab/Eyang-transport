import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  busOutline,
  calendarOutline,
  checkmarkOutline,
  locationOutline,
  notificationsOutline,
  ticketOutline,
  walletOutline
} from 'ionicons/icons';
import { ApiService, AppNotification, BootstrapData, Payment } from '../core/api.service';
import { OfflineService } from '../core/offline.service';

@Component({
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, RouterLink],
  template: `
    <ion-content class="dashboard-content">
      <main class="student-dashboard">
        <section class="hero-shell">
          <header class="desktop-header">
            <a class="school-brand" routerLink="/app/student">
              <span class="school-crest" aria-hidden="true">SJ</span>
              <strong>Saint Jean<br>Ingenieur</strong>
            </a>

            <nav aria-label="Student navigation">
              <a class="active" routerLink="/app/student">Dashboard</a>
              <a routerLink="/app/track">My Transport</a>
              <a routerLink="/app/reservation">Reservations</a>
            </nav>

            <div class="header-actions">
              <a class="header-avatar" routerLink="/app/profile" aria-label="Profile">
                @if (profilePhoto) {
                  <img [src]="profilePhoto" alt="Profile photo">
                } @else {
                  {{ initials(profileName) }}
                }
              </a>
              <a class="notification-button" routerLink="/app/notifications" aria-label="Notifications">
                <ion-icon name="notifications-outline" />
              </a>
            </div>
          </header>

          <div class="mobile-header">
            <a class="school-brand" routerLink="/app/student">
              <span class="school-crest" aria-hidden="true">SJ</span>
              <strong>Saint Jean<br>Ingenieur</strong>
            </a>
            <div class="header-actions">
              <a class="header-avatar" routerLink="/app/profile">{{ initials(profileName) }}</a>
              <a class="notification-button" routerLink="/app/notifications" aria-label="Notifications">
                <ion-icon name="notifications-outline" />
              </a>
            </div>
          </div>

          <div class="hero">
            <div class="hero-copy">
              <p class="welcome">Welcome back</p>
              <h1>{{ profileName }}</h1>
              <div class="transport-title">
                <span><ion-icon name="bus-outline" /></span>
                <h2>My Transport</h2>
              </div>
              <p class="student-meta">{{ profileLevel }} - {{ profileDepartment }} - {{ monthLabel }}</p>
            </div>
          </div>
        </section>

        <div class="dashboard-body">
          @if (activePickup) {
            <section class="pickup-alert">
              <div>
                <strong>{{ activePickup.title }}</strong>
                <p>{{ activePickup.body }}</p>
              </div>
              <div class="pickup-actions">
                <ion-button size="small" (click)="respond('yes')">I'll be there</ion-button>
                <ion-button size="small" fill="clear" (click)="respond('no')">Skip today</ion-button>
              </div>
            </section>
          }

          @if (responseMessage) {
            <p class="response-message">{{ responseMessage }}</p>
          }

          <section class="payment-panel" aria-label="Payment summary">
            <article class="summary-card active-payment">
              <span class="summary-icon success"><ion-icon name="checkmark-outline" /></span>
              <div><p>Payment</p><strong>{{ paymentActive ? 'Active' : 'Pending' }}</strong></div>
            </article>

            <article class="summary-card">
              <span class="summary-icon"><ion-icon name="calendar-outline" /></span>
              <div>
                <p>Payment {{ paymentActive ? 'Active' : 'Status' }}</p>
                <span>{{ paymentActive ? 'Valid until end of' : 'Awaiting validation' }}</span>
                <strong class="month">{{ monthLabel }}</strong>
              </div>
            </article>

            <article class="summary-card">
              <span class="summary-icon"><ion-icon name="wallet-outline" /></span>
              <div><p>Amount</p><strong class="amount">{{ formattedAmount }}</strong></div>
            </article>
          </section>

          <section class="reservation-panel">
            <div class="reservation-heading">
              <span class="reservation-icon"><ion-icon name="ticket-outline" /></span>
              <h2>My Reservation</h2>
            </div>

            <div class="reservation-overview">
              <div class="confirmation-box">
                <span class="summary-icon success"><ion-icon name="checkmark-outline" /></span>
                <div>
                  <strong>{{ reservation ? 'Confirmed' : 'Not Reserved' }}</strong>
                  <p>{{ monthLabel }}</p>
                </div>
              </div>

              <div class="bus-summary">
                <div class="mini-bus"><ion-icon name="bus-outline" /></div>
                <strong>Bus {{ bus?.plate_number || 'Not selected' }}</strong>
              </div>
            </div>

            <div class="route-card">
              <span class="route-pin"><ion-icon name="location-outline" /></span>
              <div class="route-place">
                <small>From</small>
                <strong>{{ pickup?.name || 'Pickup point' }}</strong>
              </div>
              <div class="route-line"><span></span><b><ion-icon name="arrow-forward-outline" /></b><span></span></div>
              <div class="route-place destination">
                <small>To</small>
                <strong>Eyang</strong>
              </div>
              <span class="route-pin"><ion-icon name="location-outline" /></span>
            </div>
          </section>
        </div>
      </main>
    </ion-content>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .dashboard-content { --background: #f4f7fc; }
    .student-dashboard { min-height: 100%; padding-bottom: 112px; color: #081f49; }
    a { color: inherit; text-decoration: none; }
    p, h1, h2 { margin: 0; }

    .hero-shell {
      overflow: hidden;
      color: #fff;
      background: #031c43;
      border-radius: 0 0 34px 34px;
    }
    .desktop-header {
      height: 176px;
      display: grid;
      grid-template-columns: 240px 1fr 160px;
      align-items: center;
      gap: 28px;
      max-width: 1440px;
      padding: 0 54px;
      margin: 0 auto;
      background: rgba(1, 21, 53, .9);
    }
    .school-brand { display: inline-flex; align-items: center; gap: 14px; width: fit-content; }
    .school-crest {
      width: 58px;
      height: 66px;
      display: grid;
      place-items: center;
      color: #fff;
      border: 3px solid #fff;
      border-radius: 12px 12px 24px 24px;
      box-shadow: inset 0 0 0 3px rgba(255,255,255,.16);
      font-size: 19px;
      font-weight: 900;
      letter-spacing: .04em;
    }
    .school-brand strong { font-size: 22px; line-height: 1.04; color: #fff; }
    .desktop-header nav { display: flex; align-items: center; justify-content: center; gap: 48px; height: 100%; }
    .desktop-header nav a {
      position: relative;
      display: grid;
      align-items: center;
      height: 100%;
      color: rgba(255,255,255,.72);
      font-size: 19px;
      font-weight: 600;
      white-space: nowrap;
    }
    .desktop-header nav a.active { color: #fff; }
    .desktop-header nav a.active::after {
      content: "";
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: 48px;
      height: 4px;
      border-radius: 4px;
      background: #38a9ff;
    }
    .header-actions { display: flex; align-items: center; justify-content: flex-end; gap: 20px; }
    .header-avatar {
      width: 70px;
      height: 70px;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: 50%;
      background: #fff;
      color: #1260c8;
      font-size: 25px;
      font-weight: 850;
    }
    .header-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .notification-button { display: grid; place-items: center; color: #fff; font-size: 30px; }
    .mobile-header { display: none; }

    .hero {
      min-height: 486px;
      display: flex;
      align-items: center;
      max-width: 1440px;
      padding: 48px 54px 88px;
      margin: 0 auto;
      background:
        linear-gradient(90deg, rgba(1,29,70,.98) 0%, rgba(2,34,79,.9) 33%, rgba(2,32,73,.18) 65%),
        url('/assets/student-dashboard-bus.png') center right / cover no-repeat;
    }
    .hero-copy { width: 48%; }
    .welcome { margin-bottom: 16px; color: #67ccff; font-size: 27px; }
    .hero h1 { max-width: 620px; font-size: clamp(38px, 4.4vw, 58px); line-height: 1.08; font-weight: 850; }
    .transport-title { display: flex; align-items: center; gap: 24px; margin-top: 44px; }
    .transport-title span {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 50%;
      background: #0877e8;
      font-size: 30px;
    }
    .transport-title h2 { font-size: 34px; }
    .student-meta { margin-top: 18px; color: rgba(255,255,255,.82); font-size: 24px; }

    .dashboard-body { max-width: 1380px; padding: 0 28px 32px; margin: -84px auto 0; position: relative; z-index: 2; }
    .payment-panel, .reservation-panel {
      border: 1px solid #e4eaf4;
      border-radius: 16px;
      background: rgba(255,255,255,.97);
      box-shadow: 0 7px 20px rgba(15,45,91,.08);
    }
    .payment-panel { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 22px; }
    .summary-card {
      min-height: 136px;
      display: flex;
      align-items: flex-start;
      gap: 22px;
      padding: 28px;
      border-radius: 24px;
      background: linear-gradient(135deg, #f5f9ff, #edf4ff);
    }
    .summary-card.active-payment { background: linear-gradient(135deg, #f0fbf5, #e5f8ec); }
    .summary-icon {
      width: 66px;
      height: 66px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 50%;
      background: linear-gradient(145deg, #117be8, #0754bf);
      color: #fff;
      font-size: 36px;
    }
    .summary-icon.success { background: linear-gradient(145deg, #0db466, #008947); }
    .summary-card p { margin: 12px 0 18px; color: #313b50; font-size: 21px; }
    .summary-card strong { display: block; color: #0a58c3; font-size: 31px; }
    .active-payment strong { color: #07964e; }
    .summary-card span:not(.summary-icon) { display: block; color: #39445a; font-size: 19px; }
    .summary-card strong.month { margin-top: 7px; font-size: 21px; }
    .summary-card strong.amount { margin-top: 38px; font-size: clamp(28px, 3.1vw, 42px); white-space: nowrap; }

    .reservation-panel { margin-top: 24px; padding: 26px 30px; }
    .reservation-heading { display: flex; align-items: center; gap: 18px; }
    .reservation-heading h2 { font-size: 29px; }
    .reservation-icon {
      width: 62px;
      height: 62px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #fff;
      background: linear-gradient(145deg, #0a3f92, #032758);
      font-size: 31px;
    }
    .reservation-overview { display: grid; grid-template-columns: 1fr 1fr; margin: 18px 0 28px; }
    .confirmation-box {
      display: flex;
      align-items: center;
      gap: 24px;
      min-height: 124px;
      padding: 24px 30px;
      border-radius: 18px;
      background: linear-gradient(90deg, #ebfaf1, #e1f7e9);
    }
    .confirmation-box strong { color: #089650; font-size: 30px; }
    .confirmation-box p { margin-top: 8px; color: #465167; font-size: 22px; }
    .bus-summary {
      display: grid;
      place-items: center;
      align-content: center;
      gap: 4px;
      border-left: 1px solid #d7e0ee;
      color: #082a65;
    }
    .mini-bus { color: #2d6dbd; font-size: 76px; line-height: 1; }
    .bus-summary strong { font-size: 30px; }
    .route-card {
      display: grid;
      grid-template-columns: 54px minmax(150px, auto) 1fr minmax(120px, auto) 54px;
      align-items: center;
      gap: 14px;
      padding: 28px;
      border: 1px solid #dce5f2;
      border-radius: 20px;
    }
    .route-pin {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #0873e0;
      background: #e9f2ff;
      font-size: 30px;
    }
    .route-place small { display: block; margin-bottom: 7px; color: #5f6c82; font-size: 16px; }
    .route-place strong { font-size: 23px; }
    .destination { text-align: right; }
    .route-line { display: grid; grid-template-columns: 1fr 54px 1fr; align-items: center; }
    .route-line span { border-top: 2px dashed #c5d6ed; }
    .route-line b {
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #fff;
      background: #0873e0;
      font-size: 28px;
    }

    .pickup-alert {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 20px;
      padding: 18px 24px;
      border: 1px solid #7fb9f4;
      border-radius: 20px;
      background: #eef7ff;
    }
    .pickup-alert p { margin-top: 5px; color: #51627b; }
    .pickup-actions { display: flex; align-items: center; }
    .response-message { margin: 0 0 18px; color: #087e45; font-weight: 800; }

    @media (max-width: 900px) {
      .desktop-header { display: none; }
      .mobile-header {
        height: 88px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 22px;
        background: rgba(1,21,53,.92);
      }
      .mobile-header .school-crest { width: 42px; height: 48px; border-width: 2px; border-radius: 9px 9px 18px 18px; font-size: 14px; }
      .mobile-header .school-brand strong { font-size: 16px; }
      .mobile-header .header-avatar { width: 44px; height: 44px; font-size: 16px; }
      .mobile-header .notification-button { font-size: 25px; }
      .hero { min-height: 430px; padding: 44px 24px 110px; background-position: 58% center; }
      .hero-copy { width: 70%; }
      .welcome { font-size: 20px; }
      .hero h1 { font-size: 38px; }
      .transport-title { margin-top: 32px; gap: 15px; }
      .transport-title span { width: 48px; height: 48px; font-size: 24px; }
      .transport-title h2 { font-size: 27px; }
      .student-meta { font-size: 18px; line-height: 1.5; }
      .dashboard-body { padding: 0 16px 24px; margin-top: -76px; }
      .payment-panel { grid-template-columns: 1fr; gap: 12px; padding: 18px; border-radius: 24px; }
      .summary-card { min-height: 112px; align-items: center; padding: 20px; }
      .summary-card p { margin: 0 0 7px; font-size: 17px; }
      .summary-card strong { font-size: 25px; }
      .summary-card strong.amount { margin-top: 6px; font-size: 29px; }
      .summary-card span:not(.summary-icon) { font-size: 16px; }
      .summary-icon { width: 54px; height: 54px; font-size: 29px; }
      .reservation-panel { padding: 24px 20px; border-radius: 24px; }
      .reservation-overview { grid-template-columns: 1fr; gap: 16px; }
      .bus-summary { min-height: 130px; border-left: 0; border-top: 1px solid #d7e0ee; padding-top: 16px; }
      .route-card { grid-template-columns: 44px 1fr 44px; padding: 20px 14px; }
      .route-line { grid-column: 2; grid-row: 2; margin: 12px 0; }
      .route-place.destination { grid-column: 2; text-align: left; }
      .route-card > .route-pin:last-child { grid-column: 3; grid-row: 3; }
      .pickup-alert { align-items: flex-start; flex-direction: column; }
    }

    @media (max-width: 520px) {
      .hero { min-height: 400px; background-position: 64% center; }
      .hero::before { content: ""; position: absolute; inset: 88px 0 auto; }
      .hero-copy { width: 88%; }
      .hero h1 { font-size: 31px; }
      .student-meta { max-width: 270px; font-size: 16px; }
      .reservation-heading h2 { font-size: 24px; }
      .confirmation-box { padding: 20px; }
      .confirmation-box strong { font-size: 24px; }
      .confirmation-box p { font-size: 18px; }
      .bus-summary strong { font-size: 24px; }
      .route-place strong { font-size: 18px; }
    }
  `]
})
export class StudentDashboardPage implements OnInit {
  data?: BootstrapData;
  profileName = 'Student';
  profileLevel = 'Student';
  profileDepartment = 'Transport';
  profilePhoto = '';
  activePickup?: AppNotification;
  responseMessage = '';
  monthLabel = new Date().toLocaleString('en', { month: 'long', year: 'numeric' });

  get currentMonthKey() { return new Date().toISOString().slice(0, 7); }
  get reservation() { return this.data?.reservations.find(item => item.month_key === this.currentMonthKey) || this.data?.reservations[0]; }
  get bus() { return this.data?.buses.find(item => item.id === this.reservation?.bus_id); }
  get pickup() { return this.data?.pickupPoints.find(item => item.id === this.reservation?.pickup_point_id); }
  get currentPayment(): Payment | undefined {
    return this.data?.payments.find(item => item.month_key === this.currentMonthKey) || this.data?.payments[0];
  }
  get paymentActive() { return this.currentPayment?.status === 'validated'; }
  get formattedAmount() {
    const amount = this.currentPayment?.amount_fcfa ?? 15000;
    return `${new Intl.NumberFormat('en-US').format(amount)} FCFA`;
  }

  constructor(private api: ApiService, private offline: OfflineService) {
    addIcons({
      arrowForwardOutline,
      busOutline,
      calendarOutline,
      checkmarkOutline,
      locationOutline,
      notificationsOutline,
      ticketOutline,
      walletOutline
    });
  }

  ngOnInit() {
    this.api.bootstrap().subscribe({
      next: async data => {
        this.applyData(data);
        this.loadPickupNotification();
        await this.offline.cacheBootstrap(data);
      },
      error: async () => {
        const cached = await this.offline.get<BootstrapData | undefined>('bootstrap', undefined);
        if (cached) this.applyData(cached);
      }
    });
  }

  applyData(data: BootstrapData) {
    const stored = JSON.parse(localStorage.getItem('ests_user') || '{}');
    this.data = data;
    this.profileName = data.profile?.full_name || stored.fullName || 'Student';
    this.profileLevel = data.profile?.level_label || 'Student';
    this.profileDepartment = data.profile?.department || 'Transport';
    this.profilePhoto = data.profile?.photo_data_url || stored.photoDataUrl || '';
  }

  loadPickupNotification() {
    this.api.notifications().subscribe(result => {
      this.activePickup = result.notifications.find(note =>
        !!note.round_id && !note.read_at && note.title.toLowerCase().includes('pickup round')
      );
      if (this.activePickup?.round_id) localStorage.setItem('active_round', this.activePickup.round_id);
    });
  }

  respond(response: 'yes' | 'no') {
    const roundId = this.activePickup?.round_id || localStorage.getItem('active_round');
    if (!roundId) return;
    this.api.swipe(roundId, response).subscribe(() => {
      this.responseMessage = response === 'yes' ? 'Presence confirmed.' : 'Absence confirmed.';
      this.activePickup = undefined;
      localStorage.removeItem('active_round');
    });
  }

  initials(name = '?') {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }
}
