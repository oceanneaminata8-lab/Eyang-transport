import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  busOutline,
  calendarOutline,
  cardOutline,
  chevronDownOutline,
  eyeOutline,
  gridOutline,
  informationCircleOutline,
  locationOutline,
  lockClosedOutline,
  logOutOutline,
  notificationsOutline,
  peopleOutline,
  personCircleOutline,
  saveOutline,
  settingsOutline
} from 'ionicons/icons';
import { AdminProfile, ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [FormsModule, IonContent, IonButton, IonIcon, RouterLink],
  template: `
    <ion-content class="account-content">
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
            <a routerLink="/app/drivers"><ion-icon name="person-circle-outline"></ion-icon><span>Drivers</span></a>
            <a routerLink="/app/admin"><ion-icon name="calendar-outline"></ion-icon><span>Reservations</span></a>
            <a routerLink="/app/payments"><ion-icon name="card-outline"></ion-icon><span>Payments</span></a>
            <a routerLink="/app/admin"><ion-icon name="location-outline"></ion-icon><span>Pickup Points</span></a>
            <a routerLink="/app/admin"><ion-icon name="analytics-outline"></ion-icon><span>Reports</span></a>
            <a routerLink="/app/admin-profile"><ion-icon name="settings-outline"></ion-icon><span>Settings</span></a>
            <a routerLink="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><span>Updates</span></a>
            <a class="active" routerLink="/app/admin-profile"><ion-icon name="person-circle-outline"></ion-icon><span>My Account</span></a>
          </nav>
          <button class="logout" type="button" (click)="logout()"><ion-icon name="log-out-outline"></ion-icon><span>Logout</span></button>
        </aside>

        <main class="account-page">
          <header class="topbar">
            <h1>My Account</h1>
            <div class="profile-link">
              @if (photoPreview || photoDataUrl) {
                <img [src]="photoPreview || photoDataUrl" alt="Admin profile">
              } @else {
                <span>AD</span>
              }
              <ion-icon name="chevron-down-outline"></ion-icon>
            </div>
          </header>

          <section class="account-card">
            <div class="profile-heading">
              @if (photoPreview || photoDataUrl) {
                <img [src]="photoPreview || photoDataUrl" alt="Admin profile preview">
              } @else {
                <div class="profile-avatar">AD</div>
              }
              <div><h2>Admin Profile</h2><p>Update your details, email, and security.</p></div>
            </div>

            <div class="divider"></div>

            <div class="account-form">
              <label class="upload-field">Upload photo
                <input type="file" accept="image/*" (change)="onPhotoSelected($event)">
              </label>

              <label>Full Name
                <input type="text" [(ngModel)]="fullName">
              </label>

              <label>Email Address
                <input type="email" [(ngModel)]="email">
              </label>

              <label class="password-field">New Password
                <input [type]="showPassword ? 'text' : 'password'" placeholder="Leave blank to keep current" [(ngModel)]="password">
                <button type="button" (click)="showPassword = !showPassword" aria-label="Show password"><ion-icon name="eye-outline"></ion-icon></button>
              </label>

              <div class="notice">
                <ion-icon name="information-circle-outline"></ion-icon>
                <p>Changes to your email will take effect immediately.<br>Ensure you have access to the new email address.</p>
              </div>

              @if (message) {
                <p class="message" [class.success]="message === 'Profile updated.'">{{ message }}</p>
              }

              <div class="actions">
                <ion-button (click)="save()"><ion-icon name="save-outline" slot="start"></ion-icon>Save Changes</ion-button>
              </div>
            </div>
          </section>

          <footer>© {{ currentYear }} Saint Jean Ingenieur. All rights reserved.</footer>
        </main>
      </div>
    </ion-content>
  `,
  styles: [`
    :host{display:block;min-height:100%}.account-content{--background:#031946}.admin-shell{width:min(1440px,100%);min-height:100%;margin:auto;display:grid;grid-template-columns:250px 1fr;background:#06245d;color:#06194c}
    .sidebar{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:38px 14px 28px;color:#fff;background:radial-gradient(circle at 15% 76%,rgba(15,93,222,.25),transparent 22%),linear-gradient(165deg,#031434,#021c4d 72%,#073378)}.school-brand{display:flex;align-items:center;justify-content:center;gap:13px;font-size:21px;line-height:1.2}.school-brand img{width:78px;height:88px;object-fit:contain}.admin-only{margin:70px 12px 26px;color:#1f78ff;font-size:14px;letter-spacing:.5px}
    nav{display:flex;flex-direction:column;gap:7px}nav a,.logout{display:flex;align-items:center;gap:20px;min-height:56px;padding:0 22px;border:0;border-radius:12px;color:#e4ecff;background:transparent;text-decoration:none;font:inherit;font-size:17px;cursor:pointer}nav a ion-icon,.logout ion-icon{font-size:27px;flex:0 0 auto}nav a.active{color:#fff;background:linear-gradient(90deg,#0a3a91,#0b48b4);font-weight:750}.logout{margin-top:auto}
    .account-page{min-width:0;padding:42px 28px 44px;background:linear-gradient(135deg,#061d51,#06317b 54%,#06245d)}.topbar{height:65px;display:flex;align-items:center;justify-content:space-between;margin-bottom:34px;color:#fff}.topbar h1{margin:0;font-size:36px}.profile-link{display:flex;align-items:center;gap:12px}.profile-link span,.profile-link img{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;object-fit:cover;color:#0a4dcc;background:#fff;font-weight:850;font-size:19px}
    .account-card{min-height:0;padding:32px 36px 40px;border-radius:18px;background:#fbfcff;box-shadow:0 8px 22px rgba(0,13,48,.13);box-sizing:border-box}.profile-heading{display:flex;align-items:center;gap:24px}.profile-heading img,.profile-avatar{width:82px;height:82px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;object-fit:cover;color:#fff;background:linear-gradient(145deg,#1267ef,#063ac4);font-size:34px}.profile-heading h2{margin:0;font-size:28px}.profile-heading p{margin:8px 0 0;color:#51608a;font-size:15px}.divider{height:1px;margin:25px 0 28px;background:#ccd7e9}
    .account-form{display:flex;flex-direction:column;gap:24px}.account-form label{position:relative;display:flex;flex-direction:column;gap:10px;font-size:16px;font-weight:750}.account-form input{width:100%;height:52px;padding:0 16px;border:1px solid #cbd7ed;border-radius:8px;outline:0;color:#06194c;background:#fff;font:inherit;font-weight:400;box-sizing:border-box}.account-form input:focus{border-color:#1767e8;box-shadow:0 0 0 3px rgba(23,103,232,.1)}.upload-field input{padding:8px 12px;color:#52669b}.password-field button{position:absolute;right:8px;bottom:5px;width:40px;height:40px;border:0;color:#5570aa;background:transparent;font-size:22px;cursor:pointer}
    .notice{display:flex;align-items:flex-start;gap:17px;padding:18px 22px;border:1px solid #bdd1f4;border-radius:11px;color:#0758df;background:#f1f6ff}.notice ion-icon{flex:0 0 auto;font-size:30px}.notice p{margin:0;line-height:1.55}.message{margin:0;padding:12px 15px;border-radius:10px;color:#c52b3c;background:#ffe5e8}.message.success{color:#078c3d;background:#ddf8e8}.actions{display:flex;justify-content:flex-end}.actions ion-button{--border-radius:10px;--box-shadow:none;min-width:230px;min-height:58px;font-size:18px;font-weight:750}
    footer{padding:38px 6px 0;color:#c7d4f2;font-size:14px}
    @media(max-width:1050px){.admin-shell{grid-template-columns:94px 1fr}.school-brand strong,.admin-only,nav span,.logout span{display:none}.school-brand img{width:68px;height:76px}nav{margin-top:55px}nav a,.logout{justify-content:center;padding:0}}
    @media(max-width:720px){.admin-shell{display:block}.sidebar{display:none}.account-page{padding:20px 14px 100px}.topbar h1{font-size:28px}.account-card{min-height:0;padding:26px 20px}.profile-heading{gap:17px}.profile-heading img,.profile-avatar{width:72px;height:72px;font-size:30px}.profile-heading h2{font-size:24px}.profile-heading p{font-size:14px}.account-form{gap:23px}.notice{padding:16px}.actions ion-button{width:100%;min-width:0}}
  `]
})
export class AdminProfilePage implements OnInit {
  fullName = '';
  email = '';
  password = '';
  photoDataUrl = '';
  photoPreview = '';
  message = '';
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(private api: ApiService, private router: Router) {
    addIcons({
      analyticsOutline, busOutline, calendarOutline, cardOutline, chevronDownOutline,
      eyeOutline, gridOutline, informationCircleOutline, locationOutline, lockClosedOutline,
      logOutOutline, notificationsOutline, peopleOutline, personCircleOutline,
      saveOutline, settingsOutline
    });
  }

  ngOnInit() { this.load(); }
  load() { this.api.adminDashboard().subscribe(data => this.setProfile(data.profile)); }

  setProfile(profile: AdminProfile) {
    this.fullName = profile.full_name || '';
    this.email = profile.email || '';
    this.photoDataUrl = profile.photo_data_url || '';
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  save() {
    this.message = '';
    if (!this.fullName.trim() || !this.email.trim()) {
      this.message = 'Name and email are required.';
      return;
    }
    this.api.updateAdminProfile({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      photoDataUrl: this.photoPreview
    }).subscribe({
      next: profile => {
        this.message = 'Profile updated.';
        this.password = '';
        this.photoDataUrl = profile.photo_data_url || this.photoDataUrl;
        const stored = JSON.parse(localStorage.getItem('ests_user') || '{}');
        stored.fullName = profile.full_name;
        stored.email = profile.email;
        stored.photoDataUrl = profile.photo_data_url;
        localStorage.setItem('ests_user', JSON.stringify(stored));
      },
      error: err => this.message = err.error?.message || 'Could not update profile.'
    });
  }

  logout() {
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    this.router.navigateByUrl('/login');
  }
}
