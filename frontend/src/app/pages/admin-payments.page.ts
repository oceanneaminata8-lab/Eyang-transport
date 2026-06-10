import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  arrowBackOutline,
  arrowForwardOutline,
  busOutline,
  calendarOutline,
  cardOutline,
  checkmarkCircle,
  chevronDownOutline,
  gridOutline,
  locationOutline,
  logOutOutline,
  notificationsOutline,
  peopleOutline,
  personCircleOutline,
  searchOutline,
  settingsOutline,
  timeOutline
} from 'ionicons/icons';
import { AdminPaymentStudent, AdminPaymentsLedger, ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [DecimalPipe, IonContent, IonButton, IonIcon, RouterLink],
  template: `
    <ion-content class="payments-content">
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
            <a class="active" routerLink="/app/payments"><ion-icon name="card-outline"></ion-icon><span>Payments</span></a>
            <a routerLink="/app/admin"><ion-icon name="location-outline"></ion-icon><span>Pickup Points</span></a>
            <a routerLink="/app/admin"><ion-icon name="analytics-outline"></ion-icon><span>Reports</span></a>
            <a routerLink="/app/admin-profile"><ion-icon name="settings-outline"></ion-icon><span>Settings</span></a>
            <a routerLink="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><span>Updates</span></a>
          </nav>
          <button class="logout" type="button" (click)="logout()"><ion-icon name="log-out-outline"></ion-icon><span>Logout</span></button>
        </aside>

        <main class="payments-page">
          <header class="topbar">
            <h1>Payments</h1>
            <a class="profile-link" routerLink="/app/admin-profile">
              <span>AD</span><ion-icon name="chevron-down-outline"></ion-icon>
            </a>
          </header>

          <section class="month-hero">
            <div class="month-title">
              <span><ion-icon name="calendar-outline"></ion-icon></span>
              <h2>{{ monthLabel }}</h2>
            </div>
            <div class="month-controls">
              <button type="button" (click)="shiftMonth(-1)"><ion-icon name="arrow-back-outline"></ion-icon>Previous</button>
              <button type="button" (click)="shiftMonth(1)">Next<ion-icon name="arrow-forward-outline"></ion-icon></button>
            </div>
            <label class="search">
              <ion-icon name="search-outline"></ion-icon>
              <input type="search" placeholder="Search by name, ID, class..." [value]="search" (input)="search = $any($event.target).value || ''">
            </label>
          </section>

          <section class="summary-panel">
            <p>Total Collected - {{ monthLabel }}</p>
            <strong>{{ ledger?.summary?.collected || 0 | number }} FCFA</strong>
            <div class="summary-stats">
              <div><span class="green"><ion-icon name="checkmark-circle"></ion-icon></span><b>{{ ledger?.summary?.validated || 0 }}</b><small>paid</small></div>
              <div><span class="orange"><ion-icon name="time-outline"></ion-icon></span><b>{{ ledger?.summary?.pending || 0 }}</b><small>pending</small></div>
              <div><span class="blue"><ion-icon name="people-outline"></ion-icon></span><b>{{ ledger?.summary?.reserved || 0 }}</b><small>reserved</small></div>
            </div>
          </section>

          <section class="ledger-panel">
            <div class="ledger-head">
              <h3><span><ion-icon name="people-outline"></ion-icon></span>Student Payment Status</h3>
              <div class="filters">
                <button [class.active]="filter==='all'" (click)="filter='all'">All {{ ledger?.summary?.total || 0 }}</button>
                <button [class.active]="filter==='unpaid'" (click)="filter='unpaid'">Unpaid {{ ledger?.summary?.unpaid || 0 }}</button>
                <button [class.active]="filter==='pending'" (click)="filter='pending'">Pending {{ ledger?.summary?.pending || 0 }}</button>
                <button [class.active]="filter==='validated'" (click)="filter='validated'">Paid {{ ledger?.summary?.validated || 0 }}</button>
              </div>
            </div>

            @if (message) { <p class="message">{{ message }}</p> }
            <div class="student-list">
              @if (!filteredStudents.length) {
                <p class="empty">No students match this filter for {{ monthLabel }}.</p>
              }
              @for (student of filteredStudents; track student.student_id) {
                <article class="payment-row">
                  <div class="initials">{{ initials(student.full_name) }}</div>
                  <div class="student-info">
                    <strong>{{ student.full_name }}</strong>
                    <p>{{ student.matricule }} - {{ student.level_label }} - {{ student.department }}</p>
                    <span class="reservation" [class.missing]="!student.has_reservation">
                      <ion-icon name="bus-outline"></ion-icon>
                      {{ student.has_reservation ? 'Reserved' : 'No reservation' }}
                      @if (student.has_reservation) { - {{ student.plate_number }} - {{ student.pickup_point }} }
                    </span>
                  </div>
                  <div class="payment-side">
                    <strong>{{ student.amount_fcfa | number }} FCFA</strong>
                    <span class="status" [class.pending]="student.payment_status==='pending'" [class.unpaid]="student.payment_status==='unpaid'">
                      <ion-icon [name]="student.payment_status==='validated' ? 'checkmark-circle' : 'time-outline'"></ion-icon>
                      {{ student.payment_status }}
                    </span>
                    @if (student.payment_status === 'unpaid') {
                      <ion-button size="small" fill="outline" [disabled]="updatingStudentId === student.student_id" (click)="mark(student, 'pending')">Mark pending</ion-button>
                    }
                    @if (student.payment_status !== 'validated') {
                      <ion-button size="small" [disabled]="updatingStudentId === student.student_id" (click)="mark(student, 'validated')">Validate</ion-button>
                    }
                  </div>
                </article>
              }
            </div>
          </section>

          <footer>© {{ currentYear }} Saint Jean Ingenieur. All rights reserved.</footer>
        </main>
      </div>
    </ion-content>
  `,
  styles: [`
    :host{display:block;min-height:100%}.payments-content{--background:#031946}
    .admin-shell{width:min(1440px,100%);min-height:100%;margin:auto;display:grid;grid-template-columns:250px 1fr;background:#06245d;color:#06194c}
    .sidebar{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:38px 14px 28px;color:#fff;background:radial-gradient(circle at 15% 76%,rgba(15,93,222,.25),transparent 22%),linear-gradient(165deg,#031434,#021c4d 72%,#073378)}
    .school-brand{display:flex;align-items:center;justify-content:center;gap:13px;font-size:21px;line-height:1.2}.school-brand img{width:78px;height:88px;object-fit:contain}.admin-only{margin:70px 12px 26px;color:#1f78ff;font-size:14px;letter-spacing:.5px}
    nav{display:flex;flex-direction:column;gap:9px}nav a,.logout{display:flex;align-items:center;gap:20px;min-height:62px;padding:0 22px;border:0;border-radius:14px;color:#e4ecff;background:transparent;text-decoration:none;font:inherit;font-size:17px;cursor:pointer}nav a ion-icon,.logout ion-icon{font-size:27px;flex:0 0 auto}nav a.active{color:#fff;background:linear-gradient(90deg,#0a3a91,#0b48b4);font-weight:750}.logout{margin-top:auto}
    .payments-page{min-width:0;padding:52px 28px 44px;background:linear-gradient(135deg,#061d51,#06317b 54%,#06245d)}.topbar{height:60px;display:flex;align-items:center;justify-content:space-between;margin-bottom:25px;color:#fff}.topbar h1{margin:0;font-size:36px}.profile-link{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}.profile-link span{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;color:#0a4dcc;background:#fff;font-weight:850;font-size:19px}
    .month-hero{position:relative;height:265px;padding:45px 36px;overflow:hidden;border-radius:14px;background:linear-gradient(105deg,rgba(4,39,113,.95),rgba(10,70,180,.75)),url('/assets/student-dashboard-bus.png') center 37%/cover no-repeat;box-sizing:border-box}.month-title{display:flex;align-items:center;gap:25px;color:#fff}.month-title>span{width:78px;height:78px;display:grid;place-items:center;border-radius:15px;background:#0960e8}.month-title ion-icon{font-size:43px}.month-title h2{margin:0;font-size:39px}.month-controls{position:absolute;right:30px;top:32px;display:flex;gap:8px}.month-controls button{display:flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid rgba(255,255,255,.28);border-radius:9px;color:#fff;background:rgba(4,31,90,.48);cursor:pointer}.search{position:absolute;left:36px;bottom:42px;width:min(420px,calc(100% - 72px));height:60px;display:flex;align-items:center;gap:15px;padding:0 18px;border-radius:13px;background:#fff;box-sizing:border-box}.search ion-icon{font-size:27px}.search input{width:100%;border:0;outline:0;color:#06194c;background:transparent;font:inherit;font-size:16px}
    .summary-panel{margin-top:25px;padding:40px 34px;border-radius:17px;background:#fbfcff;box-shadow:0 12px 28px rgba(0,13,48,.17)}.summary-panel>p{margin:0;font-size:22px;font-weight:750}.summary-panel>strong{display:block;margin:26px 0 35px;color:#0b55dd;font-size:48px}.summary-stats{display:grid;grid-template-columns:repeat(3,1fr);padding-top:27px;border-top:1px solid #ccd7eb}.summary-stats>div{display:grid;grid-template-columns:62px auto;grid-template-rows:auto auto;align-items:center;padding:0 28px;border-right:1px solid #ccd7eb}.summary-stats>div:last-child{border-right:0}.summary-stats span{grid-row:1/3;width:52px;height:52px;display:grid;place-items:center;border:2px solid;border-radius:50%;font-size:27px}.summary-stats .green{color:#099a48;background:#e2f8eb}.summary-stats .orange{color:#f07800;background:#fff2df}.summary-stats .blue{color:#0759df;background:#e8f0ff}.summary-stats b{font-size:30px}.summary-stats small{color:#455581;font-size:16px}
    .ledger-panel{min-height:610px;margin-top:25px;padding:30px;border-radius:17px;background:#fbfcff;box-shadow:0 12px 28px rgba(0,13,48,.17)}.ledger-head{display:flex;align-items:center;justify-content:space-between;gap:20px}.ledger-head h3{display:flex;align-items:center;gap:18px;margin:0;font-size:22px}.ledger-head h3 span{width:50px;height:50px;display:grid;place-items:center;border-radius:10px;color:#fff;background:#0758df;font-size:27px}.filters{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.filters button{padding:8px 11px;border:1px solid #d2dcf0;border-radius:999px;color:#516087;background:#fff;cursor:pointer}.filters button.active{color:#fff;border-color:#0758df;background:#0758df}.message{padding:11px 14px;border-radius:9px;color:#0758df;background:#e8f0ff;font-weight:750}
    .student-list{margin-top:22px;border:1px solid #d9e2f1;border-radius:16px;overflow:hidden}.payment-row{min-height:150px;display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:20px;padding:20px}.initials{width:58px;height:58px;display:grid;place-items:center;border-radius:50%;color:#fff;background:linear-gradient(145deg,#1267ef,#063ac4);font-size:23px;font-weight:750}.student-info>strong{font-size:19px}.student-info p{margin:6px 0 15px;color:#53638c}.reservation{display:inline-flex;align-items:center;gap:8px;padding:9px 13px;border-radius:10px;color:#185bd6;background:#edf3ff}.reservation.missing{color:#c52b3c;background:#ffe8eb}.payment-side{display:flex;flex-direction:column;align-items:flex-end;gap:10px}.payment-side>strong{color:#0755d9;font-size:20px}.status{display:flex;align-items:center;gap:7px;padding:9px 13px;border-radius:10px;color:#078c3d;background:#ddf8e8;font-weight:750}.status.pending{color:#d96d00;background:#fff0d9}.status.unpaid{color:#c52b3c;background:#ffe5e8}.payment-side ion-button{--border-radius:9px;margin:0}.empty{padding:28px;text-align:center;color:#69779b}
    footer{padding:45px 6px 0;color:#c7d4f2;font-size:14px}
    @media(max-width:1050px){.admin-shell{grid-template-columns:94px 1fr}.school-brand strong,.admin-only,nav span,.logout span{display:none}.school-brand img{width:68px;height:76px}nav{margin-top:60px}nav a,.logout{justify-content:center;padding:0}.ledger-head{align-items:flex-start;flex-direction:column}.summary-stats>div{padding:0 14px}}
    @media(max-width:720px){.admin-shell{display:block}.sidebar{display:none}.payments-page{padding:20px 14px 100px}.topbar h1{font-size:27px}.month-hero{height:300px;padding:30px 20px}.month-title h2{font-size:30px}.month-controls{top:auto;right:20px;bottom:105px}.search{left:20px;bottom:30px;width:calc(100% - 40px)}.summary-panel{padding:28px 20px}.summary-panel>strong{font-size:36px}.summary-stats{gap:18px}.summary-stats>div{display:flex;flex-direction:column;align-items:center;padding:0;border:0}.summary-stats span{width:45px;height:45px}.ledger-panel{padding:20px}.payment-row{grid-template-columns:52px 1fr;padding:16px}.initials{width:50px;height:50px}.payment-side{grid-column:2;align-items:flex-start}.filters{justify-content:flex-start}}
  `]
})
export class AdminPaymentsPage implements OnInit {
  ledger?: AdminPaymentsLedger;
  monthKey = new Date().toISOString().slice(0, 7);
  filter: 'all' | 'unpaid' | 'pending' | 'validated' = 'all';
  search = '';
  message = '';
  updatingStudentId = '';
  currentYear = new Date().getFullYear();

  get monthLabel() {
    const [year, month] = this.monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
  }

  get filteredStudents() {
    const term = this.search.trim().toLowerCase();
    return (this.ledger?.students || []).filter(student => {
      const matchesFilter = this.filter === 'all' || student.payment_status === this.filter;
      const haystack = `${student.full_name} ${student.matricule} ${student.level_label} ${student.department}`.toLowerCase();
      return matchesFilter && (!term || haystack.includes(term));
    });
  }

  constructor(private api: ApiService, private router: Router) {
    addIcons({
      analyticsOutline, arrowBackOutline, arrowForwardOutline, busOutline, calendarOutline,
      cardOutline, checkmarkCircle, chevronDownOutline, gridOutline, locationOutline,
      logOutOutline, notificationsOutline, peopleOutline, personCircleOutline,
      searchOutline, settingsOutline, timeOutline
    });
  }

  ngOnInit() { this.load(); }
  load() { this.api.adminPayments(this.monthKey).subscribe(data => this.ledger = data); }

  shiftMonth(delta: number) {
    const [year, month] = this.monthKey.split('-').map(Number);
    const next = new Date(year, month - 1 + delta, 1);
    this.monthKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    this.filter = 'all'; this.search = ''; this.message = ''; this.load();
  }

  initials(name = '?') {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }

  mark(student: AdminPaymentStudent, status: 'pending' | 'validated') {
    this.message = '';
    this.updatingStudentId = student.student_id;
    this.api.markPayment({
      studentId: student.student_id, monthKey: this.monthKey, status,
      amountFcfa: Number(student.amount_fcfa || 15000)
    }).subscribe({
      next: () => {
        this.message = status === 'validated' ? 'Payment validated.' : 'Payment marked pending.';
        this.updatingStudentId = ''; this.load();
      },
      error: err => {
        this.message = err.error?.message || 'Payment update failed.';
        this.updatingStudentId = '';
      }
    });
  }

  logout() {
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    this.router.navigateByUrl('/login');
  }
}
