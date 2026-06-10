import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertController, IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  busOutline,
  calendarOutline,
  cardOutline,
  chevronDownOutline,
  eyeOutline,
  gridOutline,
  locationOutline,
  logOutOutline,
  notificationsOutline,
  peopleOutline,
  personAddOutline,
  personCircleOutline,
  settingsOutline,
  trashOutline
} from 'ionicons/icons';
import { AdminDashboard, ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [FormsModule, IonContent, IonButton, IonIcon, RouterLink],
  template: `
    <ion-content class="drivers-content">
      <div class="admin-shell">
        <aside class="sidebar">
          <div class="school-brand">
            <img src="assets/st jean logo.png" alt="Saint Jean Ingenieur logo">
            <strong>Saint Jean<br>Ingenieur</strong>
          </div>
          <p class="admin-only">ADMIN ONLY</p>
          <nav>
            <a routerLink="/app/admin"><ion-icon name="grid-outline"></ion-icon><span>Overview</span></a>
            <a routerLink="/app/students"><ion-icon name="people-outline"></ion-icon><span>Students</span></a>
            <a routerLink="/app/admin"><ion-icon name="bus-outline"></ion-icon><span>Buses</span></a>
            <a class="active" routerLink="/app/drivers"><ion-icon name="person-circle-outline"></ion-icon><span>Drivers</span></a>
            <a routerLink="/app/admin"><ion-icon name="calendar-outline"></ion-icon><span>Reservations</span></a>
            <a routerLink="/app/payments"><ion-icon name="card-outline"></ion-icon><span>Payments</span></a>
            <a routerLink="/app/admin"><ion-icon name="location-outline"></ion-icon><span>Pickup Points</span></a>
            <a routerLink="/app/admin"><ion-icon name="analytics-outline"></ion-icon><span>Reports</span></a>
            <a routerLink="/app/admin-profile"><ion-icon name="settings-outline"></ion-icon><span>Settings</span></a>
            <a routerLink="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><span>Updates</span></a>
          </nav>
          <button class="logout" type="button" (click)="logout()"><ion-icon name="log-out-outline"></ion-icon><span>Logout</span></button>
        </aside>

        <main class="drivers-page">
          <header class="topbar">
            <h1>Drivers</h1>
            <a class="profile-link" routerLink="/app/admin-profile"><span>AD</span><ion-icon name="chevron-down-outline"></ion-icon></a>
          </header>

          <section class="hero">
            <div class="hero-copy">
              <span class="hero-icon"><ion-icon name="person-circle-outline"></ion-icon></span>
              <h2>Drivers</h2>
              <p>{{ data?.drivers?.length || 0 }} drivers</p>
            </div>
            <div class="hero-bus" aria-hidden="true"></div>
          </section>

          <section class="panel form-panel">
            <h3><span><ion-icon name="person-add-outline"></ion-icon></span>Add Driver</h3>
            <div class="form-box">
              <label>Full name<input type="text" placeholder="Enter full name" [(ngModel)]="fullName"></label>
              <label>Email<input type="email" placeholder="Enter email address" [(ngModel)]="email"></label>
              <label class="password-field">Temporary password
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password">
                <button type="button" (click)="showPassword = !showPassword" aria-label="Show password"><ion-icon name="eye-outline"></ion-icon></button>
              </label>
              <label>Pickup point
                <select [(ngModel)]="pickupPointId">
                  @for (point of data?.pickupPoints || []; track point.id) {
                    @if (point.name !== 'Eyang') { <option [value]="point.id">{{ point.name }}</option> }
                  }
                </select>
              </label>
              <div class="bus-fields">
                <label>Plate number<input type="text" placeholder="Enter plate number" [(ngModel)]="plateNumber"></label>
                <label>Color
                  <select [(ngModel)]="color">
                    <option value="" disabled>Select color</option>
                    <option>Blue</option><option>White</option><option>Yellow</option>
                    <option>Red</option><option>Black</option><option>Silver</option>
                  </select>
                </label>
                <label>Capacity<input type="number" min="1" [(ngModel)]="capacity"></label>
              </div>
              <div class="form-actions">
                <ion-button (click)="create()"><ion-icon name="person-add-outline" slot="start"></ion-icon>Add Driver</ion-button>
              </div>
              @if (message) {
                <p class="message" [class.success]="message === 'Driver created and bus assigned.' || message === 'Driver deleted.'">{{ message }}</p>
              }
            </div>
          </section>

          <section class="panel current-panel">
            <h3><span><ion-icon name="people-outline"></ion-icon></span>Current Drivers</h3>
            <div class="driver-list">
              @for (driver of data?.drivers || []; track driver.id) {
                <article class="driver-row">
                  <div class="initials">{{ initials(driver.full_name) }}</div>
                  <div><strong>{{ driver.full_name }}</strong><p>{{ driver.email }} · {{ driver.plate_number || 'No bus assigned' }}</p></div>
                  <ion-button fill="outline" color="danger" (click)="deleteDriver(driver.id)">
                    <ion-icon name="trash-outline" slot="start"></ion-icon>Delete
                  </ion-button>
                </article>
              } @empty {
                <p class="empty">No current drivers.</p>
              }
            </div>
          </section>

          <footer>© {{ currentYear }} Saint Jean Ingenieur. All rights reserved.</footer>
        </main>
      </div>
    </ion-content>
  `,
  styles: [`
    :host{display:block;min-height:100%}.drivers-content{--background:#031946}.admin-shell{width:min(1440px,100%);min-height:100%;margin:auto;display:grid;grid-template-columns:250px 1fr;background:#06245d;color:#06194c}
    .sidebar{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:38px 14px 28px;color:#fff;background:radial-gradient(circle at 15% 76%,rgba(15,93,222,.25),transparent 22%),linear-gradient(165deg,#031434,#021c4d 72%,#073378)}.school-brand{display:flex;align-items:center;justify-content:center;gap:13px;font-size:21px;line-height:1.2}.school-brand img{width:78px;height:88px;object-fit:contain}.admin-only{margin:70px 12px 26px;color:#1f78ff;font-size:14px;letter-spacing:.5px}
    nav{display:flex;flex-direction:column;gap:9px}nav a,.logout{display:flex;align-items:center;gap:20px;min-height:62px;padding:0 22px;border:0;border-radius:14px;color:#e4ecff;background:transparent;text-decoration:none;font:inherit;font-size:17px;cursor:pointer}nav a ion-icon,.logout ion-icon{font-size:27px;flex:0 0 auto}nav a.active{color:#fff;background:linear-gradient(90deg,#0a3a91,#0b48b4);font-weight:750}.logout{margin-top:auto}
    .drivers-page{min-width:0;padding:32px 28px 44px;background:linear-gradient(135deg,#061d51,#06317b 54%,#06245d)}.topbar{height:60px;display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;color:#fff}.topbar h1{margin:0;font-size:34px}.profile-link{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}.profile-link span{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;color:#0a4dcc;background:#fff;font-weight:850;font-size:19px}
    .hero{position:relative;height:305px;overflow:hidden;border-radius:16px;background:#0743a7}.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,48,137,.83),transparent 63%)}.hero-copy{position:relative;z-index:2;padding:58px 0 0 38px;color:#fff}.hero-icon{width:82px;height:82px;display:grid;place-items:center;border-radius:16px;background:#075cee}.hero-icon ion-icon{font-size:49px}.hero-copy h2{margin:20px 0 12px;font-size:48px}.hero-copy p{width:max-content;margin:0;padding:9px 18px;border-radius:24px;background:#075ceb;font-size:19px;font-weight:750}.hero-bus{position:absolute;inset:0;background:url('/assets/student-dashboard-bus.png') right center/cover no-repeat}
    .panel{margin-top:25px;padding:28px;border-radius:17px;background:#fbfcff;box-shadow:0 12px 28px rgba(0,13,48,.17)}.panel h3{display:flex;align-items:center;gap:18px;margin:0 0 25px;font-size:24px}.panel h3 span{width:52px;height:52px;display:grid;place-items:center;border-radius:10px;color:#fff;background:#0758df}.panel h3 ion-icon{font-size:28px}
    .form-box{display:grid;grid-template-columns:1fr 1fr;gap:25px 40px;padding:22px;border:1px solid #d9e2f2;border-radius:17px}.form-box label{position:relative;display:flex;flex-direction:column;gap:12px;font-size:16px;font-weight:750}.form-box input,.form-box select{width:100%;height:50px;padding:0 16px;border:1px solid #cbd7ed;border-radius:9px;outline:0;color:#06194c;background:#fff;font:inherit;font-weight:400;box-sizing:border-box}.form-box input:focus,.form-box select:focus{border-color:#1767e8;box-shadow:0 0 0 3px rgba(23,103,232,.1)}.password-field button{position:absolute;right:8px;bottom:7px;width:38px;height:38px;border:0;color:#5570aa;background:transparent;font-size:21px;cursor:pointer}
    .bus-fields{grid-column:1/-1;display:grid;grid-template-columns:1.1fr 1fr .9fr;gap:40px}.form-actions{grid-column:1/-1;display:flex;justify-content:flex-end}.form-actions ion-button{--border-radius:9px;--box-shadow:none;min-width:185px;min-height:51px;font-weight:750}.message{grid-column:1/-1;margin:0;padding:12px 15px;border-radius:10px;color:#c52b3c;background:#ffe5e8}.message.success{color:#078c3d;background:#ddf8e8}
    .current-panel{min-height:390px}.driver-list{border:1px solid #d8e1f1;border-radius:17px;overflow:hidden}.driver-row{min-height:100px;display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:18px;padding:10px 22px}.initials{width:58px;height:58px;display:grid;place-items:center;border-radius:50%;color:#fff;background:linear-gradient(145deg,#1267ef,#063ac4);font-size:23px;font-weight:750}.driver-row strong{font-size:19px}.driver-row p{margin:7px 0 0;color:#53638c}.driver-row ion-button{--border-radius:10px;--box-shadow:none;font-weight:700}.empty{padding:24px;color:#69779b}footer{padding:45px 6px 0;color:#c7d4f2;font-size:14px}
    @media(max-width:1050px){.admin-shell{grid-template-columns:94px 1fr}.school-brand strong,.admin-only,nav span,.logout span{display:none}.school-brand img{width:68px;height:76px}nav{margin-top:60px}nav a,.logout{justify-content:center;padding:0}}
    @media(max-width:720px){.admin-shell{display:block}.sidebar{display:none}.drivers-page{padding:20px 14px 100px}.topbar h1{font-size:27px}.hero{height:350px}.hero-copy{padding:45px 20px}.hero-copy h2{font-size:42px}.hero-bus{opacity:.55;background-position:64% center}.hero::after{background:linear-gradient(90deg,rgba(5,48,137,.95),rgba(5,48,137,.48))}.panel{padding:20px}.form-box{grid-template-columns:1fr;padding:16px;gap:20px}.bus-fields{grid-column:auto;grid-template-columns:1fr;gap:20px}.form-actions{grid-column:auto}.form-actions ion-button{width:100%}.message{grid-column:auto}.driver-row{grid-template-columns:52px 1fr;padding:16px}.initials{width:50px;height:50px}.driver-row ion-button{grid-column:2;justify-self:start}}
  `]
})
export class AdminDriversPage implements OnInit {
  data?: AdminDashboard;
  fullName = '';
  email = '';
  password = 'driver123';
  pickupPointId = '';
  plateNumber = '';
  color = '';
  capacity = 30;
  message = '';
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(private api: ApiService, private alerts: AlertController, private router: Router) {
    addIcons({
      analyticsOutline, busOutline, calendarOutline, cardOutline, chevronDownOutline,
      eyeOutline, gridOutline, locationOutline, logOutOutline, notificationsOutline,
      peopleOutline, personAddOutline, personCircleOutline, settingsOutline, trashOutline
    });
  }

  ngOnInit() { this.load(); }
  load() {
    this.api.adminDashboard().subscribe(data => {
      this.data = data;
      this.pickupPointId ||= data.pickupPoints.find(point => point.name !== 'Eyang')?.id || '';
    });
  }

  create() {
    this.message = '';
    const missing = [
      [this.fullName.trim(), 'full name'], [this.email.trim(), 'email'],
      [this.password.trim(), 'temporary password'], [this.pickupPointId, 'pickup point'],
      [this.plateNumber.trim(), 'plate number'], [this.color.trim(), 'bus color']
    ].filter(([value]) => !value).map(([, label]) => label);
    if (missing.length) { this.message = `Please fill: ${missing.join(', ')}.`; return; }
    if (!this.email.includes('@')) { this.message = 'Please enter a valid email address.'; return; }
    this.api.createDriver({
      fullName: this.fullName, email: this.email, password: this.password,
      pickupPointId: this.pickupPointId, plateNumber: this.plateNumber,
      color: this.color, capacity: Number(this.capacity)
    }).subscribe({
      next: () => {
        this.message = 'Driver created and bus assigned.';
        this.fullName = ''; this.email = ''; this.password = 'driver123';
        this.pickupPointId = this.data?.pickupPoints.find(point => point.name !== 'Eyang')?.id || '';
        this.plateNumber = ''; this.color = ''; this.capacity = 30; this.load();
      },
      error: err => this.message = err.error?.message || 'Could not create driver.'
    });
  }

  initials(name = '?') {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }

  async deleteDriver(driverId: string) {
    this.message = '';
    const alert = await this.alerts.create({
      header: 'Delete driver?',
      message: 'This will disable the driver account and unassign the driver from their bus.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive',
          handler: () => {
            this.api.deleteDriver(driverId).subscribe({
              next: () => { this.message = 'Driver deleted.'; this.load(); },
              error: err => this.message = err.error?.message || 'Could not delete driver.'
            });
          }
        }
      ]
    });
    await alert.present();
  }

  logout() {
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    this.router.navigateByUrl('/login');
  }
}
