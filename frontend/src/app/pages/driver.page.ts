import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  busOutline,
  cameraOutline,
  checkmarkCircle,
  colorPaletteOutline,
  informationCircleOutline,
  locationOutline,
  peopleOutline,
  playOutline,
  qrCodeOutline
} from 'ionicons/icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ApiService, BootstrapData, PickupRound } from '../core/api.service';
import { OfflineService } from '../core/offline.service';

@Component({
  standalone: true,
  imports: [IonContent, IonButton, IonIcon],
  template: `
    <ion-content class="driver-content">
      <main class="driver-page">
        <section class="hero">
          <div class="hero-copy">
            <div class="brand">
              <img src="assets/st jean logo.png" alt="Saint Jean Ingenieur logo">
              <strong>Saint Jean<br>Ingenieur</strong>
            </div>

            <div class="welcome">
              <span>Welcome</span>
              <h1>{{ driverName }}</h1>
              <p class="role">Driver</p>
              <i></i>
              <p class="intro">
                Scan student QR passes. Access is granted only when the student has paid
                and reserved a place on this bus.
              </p>
            </div>
          </div>
          <div class="hero-bus" aria-hidden="true"></div>
        </section>

        <section class="workspace">
          <article class="bus-card">
            <h2><span><ion-icon name="bus-outline"></ion-icon></span>Bus Details</h2>
            <div class="bus-details">
              <div class="detail">
                <span><ion-icon name="bus-outline"></ion-icon></span>
                <p><small>Plate number</small><strong>{{ plate }}</strong></p>
              </div>
              <div class="detail">
                <span><ion-icon name="color-palette-outline"></ion-icon></span>
                <p><small>Color</small><strong>{{ color }}</strong></p>
              </div>
              <div class="detail">
                <span><ion-icon name="people-outline"></ion-icon></span>
                <p><small>Capacity</small><strong>{{ capacity }}</strong></p>
              </div>
            </div>
            <div class="interior"></div>
          </article>

          <article class="scanner-card">
            <header>
              <h2><span><ion-icon name="qr-code-outline"></ion-icon></span>QR Scanner</h2>
              <ion-icon class="info-icon" name="information-circle-outline"></ion-icon>
            </header>

            <div class="scanner-shell">
              <div class="scanner-corner top-left"></div>
              <div class="scanner-corner top-right"></div>
              <div class="scanner-corner bottom-left"></div>
              <div class="scanner-corner bottom-right"></div>
              <div class="scan-line"></div>
              <div id="reader"></div>
            </div>
            <p class="camera-label">Camera based scan</p>

            <div class="round-actions">
              <ion-button class="round-button" expand="block" (click)="startRound()">
                <ion-icon name="play-outline" slot="start"></ion-icon>
                {{ round ? 'Pickup Round Active' : 'Start Pickup Round' }}
              </ion-button>
              <ion-button class="gps-button" expand="block" (click)="sendGps()">
                <ion-icon name="camera-outline" slot="start"></ion-icon>
                Send GPS Location
              </ion-button>
            </div>

            @if (message) {
              <div class="status-message"
                [class.granted]="lastScanValid === true"
                [class.denied]="lastScanValid === false">
                <ion-icon
                  [name]="lastScanValid === false ? 'information-circle-outline' : 'checkmark-circle'">
                </ion-icon>
                <span>{{ message }}</span>
              </div>
            } @else {
              <div class="status-message">
                <ion-icon name="location-outline"></ion-icon>
                <span>Ready to start a pickup round.</span>
              </div>
            }
          </article>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    :host { display:block; min-height:100%; }
    .driver-content { --background:#03183d; }
    .driver-page {
      width:min(1440px, 100%);
      min-height:100%;
      margin:0 auto;
      overflow:hidden;
      color:#fff;
      background:
        radial-gradient(circle at 90% 20%, rgba(22,91,224,.32), transparent 28%),
        linear-gradient(135deg, #041b47 0%, #020e2d 55%, #06194a 100%);
    }
    .hero { position:relative; min-height:530px; display:grid; grid-template-columns:44% 56%; overflow:hidden; }
    .hero::after {
      content:""; position:absolute; inset:0;
      background:linear-gradient(90deg, rgba(2,14,45,.18) 40%, transparent 67%);
      pointer-events:none;
    }
    .hero-copy { position:relative; z-index:2; padding:42px 0 48px 64px; }
    .brand { display:flex; align-items:center; gap:16px; font-size:25px; line-height:1.08; }
    .brand img { width:70px; height:78px; object-fit:contain; filter:drop-shadow(0 8px 20px rgba(0,0,0,.25)); }
    .welcome { max-width:455px; margin-top:78px; }
    .welcome span, .role { color:#2680ff; font-size:26px; }
    .welcome h1 { margin:14px 0 4px; font-size:54px; line-height:1.05; font-weight:850; letter-spacing:-1.5px; }
    .welcome .role { margin:0; }
    .welcome i { display:block; width:64px; height:5px; margin:22px 0 25px; border-radius:8px; background:#1674ff; }
    .intro { margin:0; font-size:20px; line-height:1.55; color:#eef4ff; }
    .hero-bus {
      position:absolute; z-index:1; top:0; right:0; width:61%; height:100%;
      background-image:
        linear-gradient(90deg, #031438 0%, rgba(3,20,56,.12) 24%, transparent 48%),
        url('/assets/student-dashboard-bus.png');
      background-size:cover;
      background-position:center;
      clip-path:ellipse(78% 100% at 78% 50%);
    }
    .workspace { position:relative; z-index:3; display:grid; grid-template-columns:39% 61%; gap:24px; padding:0 38px 38px; margin-top:-12px; }
    .bus-card {
      overflow:hidden; border:1px solid rgba(80,137,232,.44); border-radius:18px;
      background:linear-gradient(145deg, rgba(8,45,104,.96), rgba(2,20,59,.98));
      box-shadow:0 10px 30px rgba(0,0,0,.2);
    }
    h2 { display:flex; align-items:center; gap:18px; margin:0; font-size:28px; font-weight:820; }
    h2 span {
      width:60px; height:60px; display:grid; place-items:center; flex:0 0 auto;
      border-radius:17px; background:linear-gradient(145deg,#0c72ff,#124fd8); color:#fff;
    }
    h2 ion-icon { font-size:31px; }
    .bus-card > h2 { padding:30px 32px 22px; }
    .bus-details { margin:0 20px; padding:18px 30px 5px; border-radius:25px 25px 0 0; color:#071a4b; background:#f7f9ff; }
    .detail { display:flex; align-items:center; gap:24px; min-height:112px; border-bottom:1px solid #d9e2f4; }
    .detail:last-child { border-bottom:0; }
    .detail > span { width:67px; height:67px; display:grid; place-items:center; flex:0 0 auto; border-radius:50%; color:#fff; background:linear-gradient(145deg,#116fff,#073ac4); }
    .detail ion-icon { font-size:31px; }
    .detail p { display:flex; flex-direction:column; gap:5px; margin:0; }
    .detail small { color:#697594; font-size:18px; }
    .detail strong { font-size:27px; }
    .interior {
      height:430px; margin:0 20px 20px; border-radius:0 0 25px 25px;
      background:url('/assets/driver-bus-interior.png') center 38% / cover no-repeat;
    }
    .scanner-card {
      padding:28px 34px; border-radius:18px; color:#06194a; background:#f8faff;
      box-shadow:0 10px 30px rgba(0,0,0,.2);
    }
    .scanner-card header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
    .info-icon { padding:13px; border:1px solid #d8e2f4; border-radius:15px; font-size:34px; color:#17336e; }
    .scanner-shell {
      position:relative; height:410px; overflow:hidden; border-radius:25px;
      background:radial-gradient(circle at 50% 45%, #142847, #071426 68%);
    }
    #reader { position:absolute; inset:0; z-index:2; color:#fff; border:0!important; }
    #reader::part(video) { object-fit:cover; }
    .scanner-corner { position:absolute; z-index:4; width:52px; height:52px; border-color:#1674ff; border-style:solid; pointer-events:none; }
    .top-left { top:42px; left:42px; border-width:5px 0 0 5px; border-radius:17px 0 0; }
    .top-right { top:42px; right:42px; border-width:5px 5px 0 0; border-radius:0 17px 0 0; }
    .bottom-left { bottom:42px; left:42px; border-width:0 0 5px 5px; border-radius:0 0 0 17px; }
    .bottom-right { right:42px; bottom:42px; border-width:0 5px 5px 0; border-radius:0 0 17px; }
    .scan-line {
      position:absolute; z-index:4; top:50%; left:9%; width:82%; height:3px;
      background:#1674ff; box-shadow:0 0 13px #1674ff, 0 0 28px #1674ff;
      animation:scan 2.8s ease-in-out infinite;
    }
    @keyframes scan { 0%,100%{transform:translateY(-90px);opacity:.55} 50%{transform:translateY(90px);opacity:1} }
    .camera-label { margin:18px 0 22px; text-align:center; color:#6a7796; font-size:18px; }
    .round-actions { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .round-button, .gps-button { min-height:62px; font-weight:800; font-size:16px; }
    .round-button { --border-radius:15px; --background:linear-gradient(90deg,#0a68f5,#0649dd); --box-shadow:none; }
    .gps-button { --border-radius:15px; --background:#fff; --color:#0958df; --border-color:#0b60ef; --border-style:solid; --border-width:1px; --box-shadow:none; }
    .status-message {
      display:flex; align-items:center; gap:14px; min-height:72px; margin-top:18px; padding:0 22px;
      border-radius:16px; color:#149448; background:#e7f8ee; font-weight:750;
    }
    .status-message ion-icon { flex:0 0 auto; font-size:29px; }
    .status-message.granted { color:#078c3d; background:#ddf8e8; }
    .status-message.denied { color:#c52b3c; background:#ffe5e8; }
    :host ::ng-deep #reader video { width:100%!important; height:410px!important; object-fit:cover!important; }
    :host ::ng-deep #reader img { display:none!important; }
    :host ::ng-deep #reader__dashboard {
      position:absolute; z-index:5; left:50%; bottom:20px; width:88%; transform:translateX(-50%);
      padding:10px!important; border-radius:14px; background:rgba(3,18,43,.8); backdrop-filter:blur(8px);
    }
    :host ::ng-deep #reader__dashboard button {
      min-height:42px; padding:8px 14px; border:1px solid #2f79ef; border-radius:10px;
      color:#fff; background:#0a5ce1; font-weight:700; cursor:pointer;
    }
    :host ::ng-deep #reader__dashboard select { max-width:100%; min-height:38px; border-radius:8px; }
    :host ::ng-deep #reader__dashboard_section_csr span { color:#fff!important; }

    @media (max-width:900px) {
      .hero { min-height:520px; grid-template-columns:1fr; }
      .hero-copy { padding:30px 24px 50px; }
      .brand { font-size:20px; }
      .brand img { width:56px; height:62px; }
      .welcome { max-width:72%; margin-top:92px; }
      .welcome h1 { font-size:43px; }
      .welcome span, .role { font-size:22px; }
      .intro { font-size:17px; }
      .hero-bus { width:100%; opacity:.62; clip-path:none; background-position:58% center; }
      .hero::after { background:linear-gradient(90deg, rgba(2,14,45,.98), rgba(2,14,45,.72) 48%, rgba(2,14,45,.12)); }
      .workspace { grid-template-columns:1fr; padding:20px; margin-top:-35px; }
      .interior { height:360px; }
    }
    @media (max-width:560px) {
      .hero { min-height:570px; }
      .welcome { max-width:94%; margin-top:105px; }
      .welcome h1 { font-size:38px; }
      .hero-bus { opacity:.42; background-position:62% center; }
      .workspace { padding:14px; }
      .bus-card, .scanner-card { border-radius:24px; }
      .bus-card > h2, .scanner-card { padding:22px 18px; }
      h2 { font-size:22px; gap:12px; }
      h2 span { width:48px; height:48px; border-radius:14px; }
      .bus-details { margin:0 12px; padding:8px 18px 4px; }
      .detail { min-height:94px; gap:16px; }
      .detail > span { width:54px; height:54px; }
      .detail small { font-size:15px; }
      .detail strong { font-size:23px; }
      .interior { height:315px; margin:0 12px 12px; }
      .scanner-shell, :host ::ng-deep #reader video { height:350px!important; }
      .round-actions { grid-template-columns:1fr; }
      .scanner-corner { width:40px; height:40px; }
      .top-left { top:28px; left:28px; }.top-right { top:28px; right:28px; }
      .bottom-left { bottom:28px; left:28px; }.bottom-right { right:28px; bottom:28px; }
    }
  `]
})
export class DriverPage implements OnInit {
  data?: BootstrapData;
  round?: PickupRound;
  message = '';
  lastScanValid?: boolean;
  scanning = false;
  lastToken = '';
  lastScanAt = 0;
  driverName = 'Driver';
  plate = 'LT 4892 A';
  color = 'Blue';
  capacity = 30;

  get currentUser() { return JSON.parse(localStorage.getItem('ests_user') || '{}'); }
  get assignedBus() { return this.data?.buses.find(bus => bus.driver_id === this.currentUser.id) || this.data?.buses[0]; }
  get busId() { return this.assignedBus?.id || ''; }

  constructor(private api: ApiService, private offline: OfflineService) {
    addIcons({
      busOutline,
      cameraOutline,
      checkmarkCircle,
      colorPaletteOutline,
      informationCircleOutline,
      locationOutline,
      peopleOutline,
      playOutline,
      qrCodeOutline
    });
  }

  ngOnInit() {
    this.api.bootstrap().subscribe(data => {
      this.data = data;
      this.driverName = data.profile?.full_name || this.currentUser.fullName || 'Driver';
      this.plate = this.assignedBus?.plate_number || this.plate;
      this.color = this.assignedBus?.color || this.color;
      this.capacity = this.assignedBus?.capacity || this.capacity;
    });
    setTimeout(() => this.initScanner(), 300);
    window.addEventListener('online', () => this.offline.syncQueuedScans());
  }

  startRound() {
    if (!this.busId) {
      this.lastScanValid = false;
      this.message = 'No bus is assigned to this driver.';
      return;
    }
    this.api.startRound(this.busId).subscribe(round => {
      this.round = round;
      localStorage.setItem('active_round', round.id);
      this.lastScanValid = true;
      this.message = `Pickup round started. ${round.notifiedStudents || 0} student${round.notifiedStudents === 1 ? '' : 's'} notified.`;
    });
  }

  async sendGps() {
    if (!this.busId) {
      this.lastScanValid = false;
      this.message = 'No bus is assigned to this driver.';
      return;
    }
    try {
      const pos = await Geolocation.getCurrentPosition();
      this.api.gps(this.busId, pos.coords.latitude, pos.coords.longitude).subscribe(() => {
        this.lastScanValid = true;
        this.message = 'GPS location sent.';
      });
    } catch {
      this.lastScanValid = false;
      this.message = 'Location permission is required to send GPS.';
    }
  }

  private initScanner() {
    const scanner = new Html5QrcodeScanner('reader', { fps: 8, qrbox: { width: 240, height: 240 } }, false);
    scanner.render(token => this.handleScan(token), () => undefined);
  }

  private async handleScan(token: string) {
    const roundId = this.round?.id || localStorage.getItem('active_round') || '';
    const now = Date.now();
    if (this.scanning || (token === this.lastToken && now - this.lastScanAt < 3500)) return;
    this.scanning = true;
    this.lastToken = token;
    this.lastScanAt = now;
    this.lastScanValid = undefined;
    this.message = 'Checking QR pass...';
    if (!roundId || !this.busId) {
      this.lastScanValid = false;
      this.message = 'Start a pickup round before scanning.';
      this.scanning = false;
      return;
    }
    if (!navigator.onLine) {
      await this.offline.queueScan({ token, roundId, busId: this.busId });
      this.lastScanValid = undefined;
      this.message = 'Offline scan saved. It will sync when internet returns.';
      this.scanning = false;
      return;
    }
    this.api.validateBoarding({ token, roundId, busId: this.busId }).subscribe(result => {
      this.lastScanValid = result.valid;
      this.message = result.valid
        ? `Access granted. ${result.studentName || 'Student'} matches bus ${result.busPlate || this.plate}.`
        : `Access denied. ${result.reason}`;
      setTimeout(() => this.scanning = false, 1200);
    }, err => {
      this.lastScanValid = false;
      this.message = err.error?.message || 'Scan failed. Try again.';
      this.scanning = false;
    });
  }
}
