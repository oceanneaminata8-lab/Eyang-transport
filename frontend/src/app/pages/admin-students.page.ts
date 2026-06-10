import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertController, IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  arrowForwardOutline,
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
    <ion-content class="students-content">
      <div class="admin-shell">
        <aside class="sidebar">
          <div class="school-brand">
            <img src="assets/st jean logo.png" alt="Saint Jean Ingenieur logo">
            <strong>Saint Jean<br>Ingenieur</strong>
          </div>
          <p class="admin-only">ADMIN ONLY</p>
          <nav>
            <a routerLink="/app/admin"><ion-icon name="grid-outline"></ion-icon><span>Overview</span></a>
            <a class="active" routerLink="/app/students"><ion-icon name="people-outline"></ion-icon><span>Students</span></a>
            <a href="#students"><ion-icon name="bus-outline"></ion-icon><span>Buses</span></a>
            <a routerLink="/app/drivers"><ion-icon name="person-circle-outline"></ion-icon><span>Drivers</span></a>
            <a routerLink="/app/admin"><ion-icon name="calendar-outline"></ion-icon><span>Reservations</span></a>
            <a routerLink="/app/payments"><ion-icon name="card-outline"></ion-icon><span>Payments</span></a>
            <a routerLink="/app/admin"><ion-icon name="location-outline"></ion-icon><span>Pickup Points</span></a>
            <a routerLink="/app/admin"><ion-icon name="analytics-outline"></ion-icon><span>Reports</span></a>
            <a routerLink="/app/admin-profile"><ion-icon name="settings-outline"></ion-icon><span>Settings</span></a>
            <a routerLink="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><span>Updates</span></a>
          </nav>
          <button class="logout" type="button" (click)="logout()"><ion-icon name="log-out-outline"></ion-icon><span>Logout</span></button>
        </aside>

        <main class="students-page">
          <header class="topbar">
            <h1>Students</h1>
            <a class="profile-link" routerLink="/app/admin-profile">
              @if (data?.profile?.photo_data_url) {
                <img [src]="data?.profile?.photo_data_url" alt="Admin profile">
              } @else {
                <span>AD</span>
              }
              <ion-icon name="chevron-down-outline"></ion-icon>
            </a>
          </header>

          <section class="hero">
            <div class="hero-copy">
              <span class="hero-icon"><ion-icon name="people-outline"></ion-icon></span>
              <h2>Students</h2>
              <p><ion-icon name="people-outline"></ion-icon>{{ data?.students || 0 }} total</p>
            </div>
            <div class="hero-bus" aria-hidden="true"></div>
          </section>

          <section class="panel form-panel">
            <h3><span><ion-icon name="person-add-outline"></ion-icon></span>Add Student</h3>
            <div class="form-box">
              <label>Full name<input type="text" placeholder="Enter full name" [(ngModel)]="fullName"></label>
              <label>Email<input type="email" placeholder="Enter email address" [(ngModel)]="email"></label>
              <label class="password-field">Temporary password
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password">
                <button type="button" (click)="showPassword = !showPassword" aria-label="Show password"><ion-icon name="eye-outline"></ion-icon></button>
              </label>
              <label>Matricule<input type="text" placeholder="Enter matricule" [(ngModel)]="matricule"></label>
              <label>Level
                <select [(ngModel)]="levelLabel">
                  <option value="" disabled>Select level</option>
                  <option>Licence 1</option><option>Licence 2</option><option>Licence 3</option>
                  <option>Master 1</option><option>Master 2</option>
                </select>
              </label>
              <label>Department
                <select [(ngModel)]="department">
                  <option value="" disabled>Select department</option>
                  <option>Genie Civil</option><option>Genie Informatique</option><option>Genie Electrique</option>
                  <option>Genie Mecanique</option><option>Architecture</option>
                </select>
              </label>
              <div class="form-actions">
                <ion-button (click)="create()"><ion-icon name="person-add-outline" slot="start"></ion-icon>Add Student</ion-button>
              </div>
              @if (message) {
                <p class="message" [class.success]="message === 'Student created.' || message === 'Student deleted.'">{{ message }}</p>
              }
            </div>
          </section>

          <section class="panel registered-panel" id="students">
            <h3><span><ion-icon name="people-outline"></ion-icon></span>Registered Students</h3>
            <div class="student-list">
              @for (student of data?.studentList || []; track student.id) {
                <article class="student-row">
                  <div class="initials">{{ initials(student.full_name) }}</div>
                  <div>
                    <strong>{{ student.full_name }}</strong>
                    <p>{{ student.matricule }} - {{ student.level_label }} - {{ student.department }}</p>
                  </div>
                  <ion-button class="delete-button" fill="outline" color="danger" (click)="deleteStudent(student.id)">
                    <ion-icon name="trash-outline" slot="start"></ion-icon>Delete
                  </ion-button>
                </article>
              } @empty {
                <p class="empty">No registered students yet.</p>
              }
            </div>
          </section>

          <footer>© {{ currentYear }} Saint Jean Ingenieur. All rights reserved.</footer>
        </main>
      </div>
    </ion-content>
  `,
  styles: [`
    :host{display:block;min-height:100%}.students-content{--background:#031946}
    .admin-shell{width:min(1440px,100%);min-height:100%;margin:auto;display:grid;grid-template-columns:250px 1fr;background:#06245d;color:#06194c}
    .sidebar{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:38px 14px 28px;color:#fff;background:radial-gradient(circle at 15% 76%,rgba(15,93,222,.25),transparent 22%),linear-gradient(165deg,#031434,#021c4d 72%,#073378)}
    .school-brand{display:flex;align-items:center;justify-content:center;gap:13px;font-size:21px;line-height:1.2}.school-brand img{width:78px;height:88px;object-fit:contain}.admin-only{margin:70px 12px 26px;color:#1f78ff;font-size:14px;letter-spacing:.5px}
    nav{display:flex;flex-direction:column;gap:9px}nav a,.logout{display:flex;align-items:center;gap:20px;min-height:62px;padding:0 22px;border:0;border-radius:14px;color:#e4ecff;background:transparent;text-decoration:none;font:inherit;font-size:17px;cursor:pointer}nav a ion-icon,.logout ion-icon{font-size:27px;flex:0 0 auto}nav a.active{color:#fff;background:linear-gradient(90deg,#0a3a91,#0b48b4);font-weight:750}.logout{margin-top:auto}
    .students-page{min-width:0;padding:32px 28px 44px;background:linear-gradient(135deg,#061d51,#06317b 54%,#06245d)}.topbar{height:60px;display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;color:#fff}.topbar h1{margin:0;font-size:34px}
    .profile-link{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}.profile-link span,.profile-link img{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;object-fit:cover;color:#0a4dcc;background:#fff;font-weight:850;font-size:19px}
    .hero{position:relative;height:320px;overflow:hidden;border-radius:30px;background:#0743a7}.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,48,137,.83),transparent 63%)}.hero-copy{position:relative;z-index:2;padding:70px 0 0 42px;color:#fff}.hero-icon{width:80px;height:80px;display:grid;place-items:center;border-radius:17px;background:#075cee}.hero-icon ion-icon{font-size:44px}.hero-copy h2{margin:20px 0 14px;font-size:52px}.hero-copy p{width:max-content;display:flex;align-items:center;gap:10px;margin:0;padding:10px 17px;border-radius:24px;background:#075ceb;font-size:19px;font-weight:750}.hero-bus{position:absolute;inset:0;background:url('/assets/student-dashboard-bus.png') right center/cover no-repeat}
    .panel{margin-top:26px;padding:30px;border-radius:27px;background:#fbfcff;box-shadow:0 12px 28px rgba(0,13,48,.17)}.panel h3{display:flex;align-items:center;gap:20px;margin:0 0 26px;font-size:25px}.panel h3 span{width:54px;height:54px;display:grid;place-items:center;border-radius:11px;color:#fff;background:#0755df}.panel h3 ion-icon{font-size:30px}
    .form-box{display:grid;grid-template-columns:1fr 1fr;gap:25px 34px;padding:20px;border:1px solid #d9e2f2;border-radius:19px}.form-box label{position:relative;display:flex;flex-direction:column;gap:12px;font-size:16px;font-weight:750}.form-box input,.form-box select{width:100%;height:50px;padding:0 16px;border:1px solid #cbd7ed;border-radius:9px;outline:0;color:#06194c;background:#fff;font:inherit;font-weight:400;box-sizing:border-box}.form-box input:focus,.form-box select:focus{border-color:#1767e8;box-shadow:0 0 0 3px rgba(23,103,232,.1)}.password-field button{position:absolute;right:8px;bottom:7px;width:38px;height:38px;border:0;color:#5570aa;background:transparent;font-size:21px;cursor:pointer}.form-actions{grid-column:1/-1;display:flex;justify-content:flex-end}.form-actions ion-button{--border-radius:9px;--box-shadow:none;min-width:190px;min-height:51px;font-weight:750}.message{grid-column:1/-1;margin:0;padding:12px 15px;border-radius:10px;color:#c52b3c;background:#ffe5e8}.message.success{color:#078c3d;background:#ddf8e8}
    .registered-panel{min-height:390px}.student-list{border:1px solid #d8e1f1;border-radius:18px;overflow:hidden}.student-row{min-height:100px;display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:20px;padding:10px 22px}.initials{width:58px;height:58px;display:grid;place-items:center;border-radius:50%;color:#fff;background:linear-gradient(145deg,#1267ef,#063ac4);font-size:23px;font-weight:750}.student-row strong{font-size:19px}.student-row p{margin:7px 0 0;color:#53638c}.delete-button{--border-radius:10px;--box-shadow:none;font-weight:700}.empty{padding:24px;color:#69779b}
    footer{padding:45px 6px 0;color:#c7d4f2;font-size:14px}
    @media(max-width:1050px){.admin-shell{grid-template-columns:94px 1fr}.school-brand strong,.admin-only,nav span,.logout span{display:none}.school-brand img{width:68px;height:76px}nav{margin-top:60px}nav a,.logout{justify-content:center;padding:0}}
    @media(max-width:720px){.admin-shell{display:block}.sidebar{display:none}.students-page{padding:20px 14px 100px}.topbar h1{font-size:27px}.hero{height:350px}.hero-copy{padding:45px 20px}.hero-copy h2{font-size:42px}.hero-bus{opacity:.55;background-position:64% center}.hero::after{background:linear-gradient(90deg,rgba(5,48,137,.95),rgba(5,48,137,.48))}.panel{padding:20px}.form-box{grid-template-columns:1fr;padding:16px;gap:20px}.form-actions{grid-column:auto}.form-actions ion-button{width:100%}.message{grid-column:auto}.student-row{grid-template-columns:52px 1fr;padding:16px}.initials{width:50px;height:50px}.delete-button{grid-column:2;justify-self:start}}
  `]
})
export class AdminStudentsPage implements OnInit {
  data?: AdminDashboard;
  fullName = '';
  email = '';
  password = 'student123';
  matricule = '';
  levelLabel = '';
  department = '';
  message = '';
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(private api: ApiService, private alerts: AlertController, private router: Router) {
    addIcons({
      analyticsOutline,
      arrowForwardOutline,
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
    });
  }

  ngOnInit() { this.load(); }
  load() { this.api.adminDashboard().subscribe(data => this.data = data); }

  create() {
    this.message = '';
    const missing = [
      [this.fullName.trim(), 'full name'], [this.email.trim(), 'email'],
      [this.password.trim(), 'temporary password'], [this.matricule.trim(), 'matricule'],
      [this.levelLabel.trim(), 'level'], [this.department.trim(), 'department']
    ].filter(([value]) => !value).map(([, label]) => label);
    if (missing.length) { this.message = `Please fill: ${missing.join(', ')}.`; return; }
    if (!this.email.includes('@')) { this.message = 'Please enter a valid email address.'; return; }
    this.api.createStudent({
      fullName: this.fullName, email: this.email, password: this.password,
      matricule: this.matricule, levelLabel: this.levelLabel, department: this.department
    }).subscribe({
      next: () => {
        this.message = 'Student created.';
        this.fullName = ''; this.email = ''; this.password = 'student123';
        this.matricule = ''; this.levelLabel = ''; this.department = '';
        this.load();
      },
      error: err => this.message = err.error?.message || 'Could not create student.'
    });
  }

  initials(name = '?') {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }

  async deleteStudent(studentId: string) {
    this.message = '';
    const alert = await this.alerts.create({
      header: 'Delete student?',
      message: 'This will disable the student account and remove it from active lists.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive',
          handler: () => {
            this.api.deleteStudent(studentId).subscribe({
              next: () => { this.message = 'Student deleted.'; this.load(); },
              error: err => this.message = err.error?.message || 'Could not delete student.'
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
