import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cardOutline,
  cloudUploadOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  notificationsOutline,
  personAddOutline,
  personOutline,
  saveOutline
} from 'ionicons/icons';
import { ApiService, BootstrapData } from '../core/api.service';
import { OfflineService } from '../core/offline.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonIcon],
  template: `
    <ion-content class="profile-content">
      <main class="profile-page">
        <section class="profile-hero">
          <header class="profile-header">
            <a class="school-brand" routerLink="/app/student">
              <span class="school-crest" aria-hidden="true">SJ</span>
              <strong>Saint Jean<br>Ingenieur</strong>
            </a>

            <div class="header-actions">
              <a class="header-avatar" routerLink="/app/profile" aria-label="Profile">
                @if (photoPreview || photoDataUrl) {
                  <img [src]="photoPreview || photoDataUrl" alt="Profile photo">
                } @else {
                  {{ initials(fullName) }}
                }
              </a>
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

              <h1>Account</h1>
              <i aria-hidden="true"></i>

              <div class="profile-summary">
                <div class="summary-avatar">
                  @if (photoPreview || photoDataUrl) {
                    <img [src]="photoPreview || photoDataUrl" alt="Profile photo">
                  } @else {
                    {{ initials(fullName) }}
                  }
                </div>
                <div>
                  <strong>Profile</strong>
                  <span>{{ initials(fullName) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="details-shell">
          <div class="details-heading">
            <span><ion-icon name="person-outline" /></span>
            <div>
              <h2>Personal Details</h2>
              <p>Update your name, password, and photo.</p>
            </div>
          </div>

          <div class="form-rows">
            <div class="form-row upload-row">
              <span class="row-icon"><ion-icon name="person-add-outline" /></span>
              <label>Upload photo</label>
              <label class="file-control">
                <span><ion-icon name="cloud-upload-outline" /></span>
                <strong>{{ selectedFileName || 'Choose a photo' }}</strong>
                <input type="file" accept="image/*" (change)="onPhotoSelected($event)">
              </label>
            </div>

            <div class="form-row">
              <span class="row-icon"><ion-icon name="person-outline" /></span>
              <label for="profile-name">Name</label>
              <input id="profile-name" type="text" [(ngModel)]="fullName">
            </div>

            <div class="form-row">
              <span class="row-icon"><ion-icon name="mail-outline" /></span>
              <label for="profile-email">Email</label>
              <input id="profile-email" type="email" [value]="email" readonly>
            </div>

            <div class="form-row">
              <span class="row-icon"><ion-icon name="card-outline" /></span>
              <label for="profile-matricule">Matricule</label>
              <input id="profile-matricule" type="text" [value]="matricule" readonly>
            </div>

            <div class="form-row password-row">
              <span class="row-icon"><ion-icon name="lock-closed-outline" /></span>
              <label for="profile-password">New password</label>
              <div class="password-control">
                <input
                  id="profile-password"
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="Leave blank to keep current password"
                  [(ngModel)]="password">
                <button type="button" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'" (click)="showPassword = !showPassword">
                  <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'" />
                </button>
              </div>
            </div>
          </div>

          @if (message) {
            <div class="message" [class.error]="messageIsError">{{ message }}</div>
          }

          <div class="account-actions">
            <ion-button class="save-button" [disabled]="saving" (click)="save()">
              <ion-icon name="save-outline" />
              {{ saving ? 'Saving...' : 'Save changes' }}
            </ion-button>

            <button type="button" class="logout-button" (click)="logout()">
              <ion-icon name="log-out-outline" />
              Disconnect account
            </button>
          </div>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .profile-content { --background: #063d96; }
    .profile-page {
      min-height: 100%;
      padding-bottom: 112px;
      color: #071d4d;
      background: linear-gradient(160deg, #001b45 0%, #032d72 58%, #0759d8 100%);
    }
    a { color: inherit; text-decoration: none; }
    h1, h2, p { margin: 0; }
    button, input { font: inherit; }

    .profile-hero {
      min-height: 610px;
      color: #fff;
      background:
        radial-gradient(circle at 72% 27%, rgba(48,111,218,.24), transparent 35%),
        linear-gradient(90deg, rgba(0,24,61,.99) 0%, rgba(1,32,77,.93) 37%, rgba(3,36,82,.12) 69%),
        url('/assets/student-dashboard-bus.png') center right / cover no-repeat;
    }
    .profile-header {
      max-width: 1400px;
      height: 148px;
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
      width: 70px;
      height: 70px;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: 50%;
      background: #fff;
      color: #1260c8;
      font-size: 24px;
      font-weight: 900;
    }
    .header-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .notification-button { display: grid; place-items: center; color: #fff; font-size: 32px; }
    .hero-content {
      max-width: 1400px;
      min-height: 462px;
      padding: 16px 54px 76px;
      margin: 0 auto;
    }
    .hero-copy { width: 42%; }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 40px;
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
    .hero-copy h1 { font-size: clamp(56px, 5.6vw, 76px); line-height: 1; font-weight: 850; letter-spacing: -.035em; }
    .hero-copy > i {
      display: block;
      width: 64px;
      height: 5px;
      margin: 34px 0 38px;
      border-radius: 5px;
      background: #1689ff;
    }
    .profile-summary {
      max-width: 430px;
      min-height: 142px;
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 22px 26px;
      border: 1px solid rgba(151,190,242,.34);
      border-radius: 20px;
      background: rgba(13,48,100,.42);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.03);
      backdrop-filter: blur(8px);
    }
    .summary-avatar {
      width: 94px;
      height: 94px;
      display: grid;
      place-items: center;
      overflow: hidden;
      flex: 0 0 auto;
      border-radius: 50%;
      background: #fff;
      color: #1260c8;
      font-size: 32px;
      font-weight: 900;
    }
    .summary-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile-summary strong { display: block; font-size: 26px; }
    .profile-summary span { display: block; margin-top: 9px; color: #1689ff; font-size: 21px; font-weight: 800; }

    .details-shell {
      position: relative;
      z-index: 2;
      max-width: 1320px;
      margin: -36px auto 0;
      padding: 34px 46px 40px;
      border-radius: 16px;
      background: rgba(255,255,255,.98);
      box-shadow: 0 9px 28px rgba(0,20,59,.17);
    }
    .details-heading { display: flex; align-items: center; gap: 24px; margin-bottom: 26px; }
    .details-heading > span {
      width: 70px;
      height: 70px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 17px;
      color: #fff;
      background: linear-gradient(145deg, #0879ed, #073dc2);
      font-size: 38px;
    }
    .details-heading h2 { font-size: 28px; }
    .details-heading p { margin-top: 8px; color: #657188; font-size: 20px; }
    .form-rows { border-top: 1px solid transparent; }
    .form-row {
      min-height: 110px;
      display: grid;
      grid-template-columns: 66px 210px 1fr;
      align-items: center;
      gap: 22px;
      border-bottom: 1px solid #e3e9f2;
    }
    .row-icon {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      color: #0755c6;
      background: #e9f1fc;
      font-size: 30px;
    }
    .form-row > label { color: #0c2859; font-size: 18px; font-weight: 750; }
    .form-row > input, .password-control, .file-control {
      min-height: 64px;
      border: 1px solid #d8e3f2;
      border-radius: 14px;
      background: #fbfdff;
      color: #122b59;
      box-shadow: inset 0 1px 2px rgba(20,50,90,.02);
    }
    .form-row > input {
      width: 100%;
      padding: 0 24px;
      outline: 0;
    }
    .form-row > input:focus, .password-control:focus-within, .file-control:focus-within {
      border-color: #5595eb;
      box-shadow: 0 0 0 3px rgba(51,126,231,.12);
    }
    .form-row > input[readonly] { color: #243c65; background: #f8fafc; }
    .file-control {
      position: relative;
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 8px 18px;
      overflow: hidden;
      cursor: pointer;
    }
    .file-control > span {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 11px;
      color: #315e9e;
      background: #edf2f9;
      font-size: 25px;
    }
    .file-control strong { color: #52617b; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-control input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
    .password-control { display: flex; align-items: center; overflow: hidden; }
    .password-control input {
      width: 100%;
      height: 62px;
      min-width: 0;
      padding: 0 22px;
      border: 0;
      outline: 0;
      background: transparent;
      color: #122b59;
    }
    .password-control button {
      width: 60px;
      height: 60px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border: 0;
      background: transparent;
      color: #536d9a;
      font-size: 26px;
      cursor: pointer;
    }
    .message {
      margin-top: 20px;
      padding: 14px 17px;
      border-radius: 13px;
      color: #087d43;
      background: #e2f8eb;
      font-weight: 750;
    }
    .message.error { color: #a43b2b; background: #ffebe7; }
    .account-actions { display: grid; grid-template-columns: minmax(220px, .42fr) 1fr; gap: 18px; margin-top: 34px; }
    .save-button {
      --background: #0b64e8;
      --background-hover: #0958ca;
      --border-radius: 12px;
      --box-shadow: none;
      height: 64px;
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      text-transform: none;
    }
    .save-button ion-icon { margin-right: 10px; font-size: 25px; }
    .logout-button {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: 0;
      border-radius: 12px;
      color: #ff3b63;
      background: linear-gradient(90deg, #031f50, #042a63);
      font-size: 24px;
      font-weight: 800;
      cursor: pointer;
    }
    .logout-button ion-icon { font-size: 33px; }

    @media (max-width: 900px) {
      .profile-hero { min-height: 570px; background-position: 63% center; }
      .profile-header { height: 102px; padding: 0 24px; }
      .school-crest { width: 44px; height: 50px; border-width: 2px; border-radius: 9px 9px 18px 18px; font-size: 14px; }
      .school-brand { gap: 10px; }
      .school-brand strong { font-size: 16px; }
      .header-avatar { width: 48px; height: 48px; font-size: 16px; }
      .notification-button { font-size: 26px; }
      .hero-content { min-height: 468px; padding: 28px 24px 82px; }
      .hero-copy { width: 65%; }
      .back-link { margin-bottom: 30px; font-size: 17px; }
      .back-link span { width: 46px; height: 46px; }
      .hero-copy h1 { font-size: 48px; }
      .hero-copy > i { margin: 26px 0; }
      .profile-summary { min-height: 112px; padding: 16px 20px; }
      .summary-avatar { width: 74px; height: 74px; font-size: 25px; }
      .profile-summary strong { font-size: 22px; }
      .details-shell { margin: -32px 16px 0; padding: 28px 24px 32px; }
      .form-row { grid-template-columns: 58px 150px 1fr; gap: 15px; }
      .account-actions { grid-template-columns: 1fr; }
      .save-button, .logout-button { height: 76px; }
    }

    @media (max-width: 620px) {
      .profile-page { padding-bottom: 94px; }
      .profile-hero { min-height: 530px; background-position: 69% center; }
      .hero-copy { width: 86%; }
      .hero-copy h1 { font-size: 43px; }
      .profile-summary { max-width: 320px; }
      .details-shell { margin: -26px 10px 0; padding: 24px 16px 26px; border-radius: 24px; }
      .details-heading { gap: 15px; }
      .details-heading > span { width: 56px; height: 56px; font-size: 30px; }
      .details-heading h2 { font-size: 22px; }
      .details-heading p { font-size: 15px; }
      .form-row {
        min-height: 126px;
        grid-template-columns: 52px 1fr;
        grid-template-rows: auto auto;
        gap: 8px 14px;
        padding: 16px 0;
      }
      .row-icon { width: 50px; height: 50px; grid-row: 1 / 3; font-size: 25px; }
      .form-row > label { align-self: end; font-size: 15px; }
      .form-row > input, .password-control, .file-control { grid-column: 2; min-height: 56px; }
      .form-row > input { padding: 0 16px; }
      .password-control input { height: 54px; padding: 0 15px; }
      .password-control button { width: 50px; height: 54px; }
      .file-control { padding: 6px 10px; gap: 10px; }
      .file-control > span { width: 42px; height: 42px; }
      .file-control strong { font-size: 13px; }
      .save-button, .logout-button { height: 68px; font-size: 17px; }
      .logout-button ion-icon { font-size: 27px; }
    }
  `]
})
export class ProfilePage implements OnInit {
  fullName = '';
  email = '';
  matricule = '';
  password = '';
  photoDataUrl = '';
  photoPreview = '';
  selectedFileName = '';
  message = '';
  messageIsError = false;
  showPassword = false;
  saving = false;

  constructor(
    private api: ApiService,
    private offline: OfflineService,
    private router: Router
  ) {
    addIcons({
      arrowBackOutline,
      cardOutline,
      cloudUploadOutline,
      eyeOffOutline,
      eyeOutline,
      lockClosedOutline,
      logOutOutline,
      mailOutline,
      notificationsOutline,
      personAddOutline,
      personOutline,
      saveOutline
    });
  }

  ngOnInit() {
    this.api.bootstrap().subscribe({
      next: async data => {
        await this.offline.cacheBootstrap(data);
        this.setProfile(data);
      },
      error: async () => {
        const cached = await this.offline.get<BootstrapData | undefined>('bootstrap', undefined);
        if (cached) this.setProfile(cached);
      }
    });
  }

  setProfile(data: BootstrapData) {
    this.fullName = data.profile?.full_name || '';
    this.email = data.profile?.email || '';
    this.matricule = data.profile?.matricule || '';
    this.photoDataUrl = data.profile?.photo_data_url || '';
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  save() {
    this.message = '';
    this.messageIsError = false;
    if (!this.fullName.trim()) {
      this.message = 'Please enter your name.';
      this.messageIsError = true;
      return;
    }
    if (this.password && this.password.length < 8) {
      this.message = 'The new password must contain at least 8 characters.';
      this.messageIsError = true;
      return;
    }

    this.saving = true;
    this.api.updateProfile({
      fullName: this.fullName.trim(),
      password: this.password,
      photoDataUrl: this.photoPreview
    }).subscribe({
      next: profile => {
        this.saving = false;
        this.message = 'Profile updated.';
        this.password = '';
        this.photoDataUrl = profile.photo_data_url || this.photoDataUrl;
        this.photoPreview = '';
        this.selectedFileName = '';
        const stored = JSON.parse(localStorage.getItem('ests_user') || '{}');
        stored.fullName = profile.full_name;
        stored.photoDataUrl = profile.photo_data_url;
        localStorage.setItem('ests_user', JSON.stringify(stored));
      },
      error: err => {
        this.saving = false;
        this.message = err.error?.message || 'Could not update profile.';
        this.messageIsError = true;
      }
    });
  }

  logout() {
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  initials(name = '?') {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }
}
