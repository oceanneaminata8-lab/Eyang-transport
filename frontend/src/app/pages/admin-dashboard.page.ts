import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
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
  settingsOutline,
  speedometerOutline,
  timeOutline
} from 'ionicons/icons';
import { AdminDashboard, ApiService, Bus } from '../core/api.service';

@Component({
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, RouterLink],
  template: `
    <ion-content class="admin-content">
      <div class="admin-shell">
        <aside class="sidebar">
          <div class="school-brand">
            <img src="assets/st jean logo.png" alt="Saint Jean Ingenieur logo">
            <strong>Saint Jean<br>Ingenieur</strong>
          </div>

          <nav>
            <a class="active" routerLink="/app/admin"><ion-icon name="grid-outline"></ion-icon><span>Overview</span></a>
            <a routerLink="/app/students"><ion-icon name="people-outline"></ion-icon><span>Students</span></a>
            <a href="#buses"><ion-icon name="bus-outline"></ion-icon><span>Buses</span></a>
            <a routerLink="/app/drivers"><ion-icon name="person-circle-outline"></ion-icon><span>Drivers</span></a>
            <a href="#buses"><ion-icon name="calendar-outline"></ion-icon><span>Reservations</span></a>
            <a routerLink="/app/payments"><ion-icon name="card-outline"></ion-icon><span>Payments</span></a>
            <a href="#points"><ion-icon name="location-outline"></ion-icon><span>Pickup Points</span></a>
            <a href="#overview"><ion-icon name="analytics-outline"></ion-icon><span>Reports</span></a>
            <a routerLink="/app/admin-profile"><ion-icon name="settings-outline"></ion-icon><span>Settings</span></a>
            <a routerLink="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><span>Updates</span></a>
          </nav>

          <button class="logout" type="button" (click)="logout()">
            <ion-icon name="log-out-outline"></ion-icon><span>Logout</span>
          </button>
        </aside>

        <main class="dashboard">
          <header class="topbar">
            <h1>Admin Panel</h1>
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
              <p>Good morning,</p>
              <h2>{{ profileName || 'Admin User' }}</h2>
              <div class="period"><ion-icon name="calendar-outline"></ion-icon>{{ monthLabel }} - Active period<i></i></div>
            </div>
            <div class="hero-bus" aria-hidden="true"></div>
          </section>

          <section class="metrics" id="overview">
            <article>
              <span class="metric-icon blue"><ion-icon name="people-outline"></ion-icon></span>
              <strong>{{ data?.students || 0 }}</strong><b>Students</b><small>Registered</small>
            </article>
            <article>
              <span class="metric-icon green"><ion-icon name="checkmark-circle"></ion-icon></span>
              <strong>{{ data?.active || 0 }}</strong><b>Active</b><small>Paid this month</small>
            </article>
            <article>
              <span class="metric-icon orange"><ion-icon name="time-outline"></ion-icon></span>
              <strong>{{ data?.pending || 0 }}</strong><b>Pending Pay.</b><small>Needs validation</small>
            </article>
            <article>
              <span class="metric-icon purple"><ion-icon name="bus-outline"></ion-icon></span>
              <strong>{{ assignedBuses.length }}</strong><b>Buses</b><small>{{ unassignedBuses.length }} unassigned</small>
            </article>
          </section>

          <section class="dashboard-grid">
            <article class="panel bus-panel" id="buses">
              <h3><span><ion-icon name="speedometer-outline"></ion-icon></span>Quick Actions</h3>

              <div class="bus-group assigned">
                <h4>Assigned Buses</h4>
                @for (bus of assignedBuses; track bus.id) {
                  <div class="bus-row">
                    <img src="assets/student-dashboard-bus.png" alt="">
                    <div><strong>{{ bus.plate_number }}</strong><small>{{ bus.driver_name }} - {{ bus.pickup_point || 'No pickup assigned' }} - capacity {{ bus.capacity }}</small></div>
                    <ion-icon class="ok" name="checkmark-circle"></ion-icon>
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                  </div>
                } @empty {
                  <p class="empty">No buses are currently assigned.</p>
                }
              </div>

              <div class="bus-group unassigned">
                <h4>Unassigned Buses</h4>
                @for (bus of unassignedBuses; track bus.id) {
                  <div class="bus-row">
                    <div class="bus-thumb" [class.yellow]="isYellow(bus)"><ion-icon name="bus-outline"></ion-icon></div>
                    <div><strong>{{ bus.plate_number }}</strong><small>{{ bus.color }} - {{ bus.pickup_point || 'No pickup assigned' }} - capacity {{ bus.capacity }}</small></div>
                    <span class="no-driver">No driver</span>
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                  </div>
                } @empty {
                  <p class="empty">All buses have assigned drivers.</p>
                }
              </div>
            </article>

            <article class="panel points-panel" id="points">
              <h3><span><ion-icon name="location-outline"></ion-icon></span>Pickup Points</h3>
              <div class="point-list">
                @for (point of data?.pickupPoints || []; track point.id) {
                  <div class="point-row">
                    <span>P</span>
                    <div><strong>{{ point.name }}</strong><small>{{ point.latitude }}, {{ point.longitude }}</small></div>
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                  </div>
                }
              </div>
            </article>
          </section>

          <section class="system-panel">
            <div class="chart-art">
              <i></i><i></i><i></i><i></i>
              <span></span>
            </div>
            <div>
              <h3>System Overview</h3>
              <p>Monitor all key activities and ensure smooth transport operations.</p>
              <ion-button routerLink="/app/payments"><ion-icon name="analytics-outline" slot="start"></ion-icon>View Reports</ion-button>
            </div>
            <img src="assets/st jean logo.png" alt="" aria-hidden="true">
          </section>

          <footer>© {{ currentYear }} Saint Jean Ingenieur. All rights reserved.</footer>
        </main>
      </div>
    </ion-content>
  `,
  styles: [`
    :host { display:block; min-height:100%; }
    .admin-content { --background:#031946; }
    .admin-shell { width:min(1440px,100%); min-height:100%; margin:auto; display:grid; grid-template-columns:250px 1fr; background:#06245d; color:#06194c; }
    .sidebar {
      position:sticky; top:0; height:100vh; display:flex; flex-direction:column; padding:44px 14px 30px;
      color:#fff; background:
        radial-gradient(circle at 14% 70%, rgba(15,93,222,.24), transparent 24%),
        linear-gradient(165deg,#031434,#021c4d 72%,#073378);
    }
    .school-brand { display:flex; flex-direction:column; align-items:center; gap:14px; text-align:center; font-size:23px; line-height:1.25; }
    .school-brand img { width:104px; height:112px; object-fit:contain; filter:drop-shadow(0 10px 25px rgba(0,0,0,.25)); }
    nav { display:flex; flex-direction:column; gap:9px; margin-top:60px; }
    nav a, .logout {
      display:flex; align-items:center; gap:20px; min-height:62px; padding:0 22px; border:0; border-radius:14px;
      color:#e4ecff; background:transparent; text-decoration:none; font:inherit; font-size:17px; cursor:pointer;
    }
    nav a ion-icon, .logout ion-icon { flex:0 0 auto; font-size:27px; }
    nav a.active { color:#fff; background:linear-gradient(90deg,#0a3a91,#0b48b4); font-weight:750; }
    .logout { margin-top:auto; }
    .dashboard { min-width:0; padding:32px 28px 44px; background:linear-gradient(135deg,#061d51,#06317b 54%,#06245d); }
    .topbar { height:60px; display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; color:#fff; }
    .topbar h1 { margin:0; font-size:34px; letter-spacing:-1px; }
    .profile-link { display:flex; align-items:center; gap:12px; color:#fff; text-decoration:none; }
    .profile-link span, .profile-link img { width:54px; height:54px; display:grid; place-items:center; border-radius:50%; object-fit:cover; color:#0a4dcc; background:#fff; font-weight:850; font-size:19px; }
    .hero { position:relative; height:320px; overflow:hidden; border-radius:35px; background:linear-gradient(105deg,#073590,#0748b4); }
    .hero::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg,rgba(3,31,92,.72),transparent 58%); }
    .hero-copy { position:relative; z-index:2; padding:70px 0 0 45px; color:#fff; }
    .hero-copy p { margin:0; font-size:29px; }
    .hero-copy h2 { margin:10px 0 20px; font-size:48px; line-height:1; }
    .period { width:max-content; display:flex; align-items:center; gap:12px; padding:14px 20px; border-radius:22px; background:#0750ce; font-size:17px; font-weight:700; }
    .period ion-icon { font-size:24px; }.period i { width:12px; height:12px; border-radius:50%; background:#14d45a; }
    .hero-bus { position:absolute; z-index:1; inset:0; background:url('/assets/student-dashboard-bus.png') right center / cover no-repeat; }
    .metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:24px; }
    .metrics article { min-height:218px; display:flex; flex-direction:column; align-items:flex-start; padding:26px 24px; border-radius:25px; background:#fbfcff; box-shadow:0 12px 28px rgba(0,13,48,.16); }
    .metric-icon { width:60px; height:60px; display:grid; place-items:center; border-radius:50%; color:#fff; }
    .metric-icon ion-icon { font-size:31px; }.blue{background:#0a5cff}.green{background:#0bb35a}.orange{background:#f58213}.purple{background:#6d27df}
    .metrics strong { margin-top:18px; font-size:39px; line-height:1; }.metrics b{margin-top:7px;font-size:19px}.metrics small{margin-top:6px;color:#425185;font-size:16px}
    .dashboard-grid { display:grid; grid-template-columns:1.45fr 1fr; gap:16px; margin-top:24px; }
    .panel, .system-panel { border-radius:27px; background:#fbfcff; box-shadow:0 12px 28px rgba(0,13,48,.16); }
    .panel { padding:22px; }
    .panel h3, .system-panel h3 { display:flex; align-items:center; gap:16px; margin:0 0 18px; font-size:21px; }
    .panel h3 span { width:48px; height:48px; display:grid; place-items:center; border-radius:10px; color:#fff; background:#0754dc; }
    .panel h3 ion-icon { font-size:25px; }
    .bus-group { margin-top:16px; padding:14px 18px 4px; border:1px solid #d5def0; border-left:7px solid #12b85a; border-radius:17px; }
    .bus-group.unassigned { border-left-color:#f58213; }.bus-group h4{margin:0;padding-bottom:12px;border-bottom:1px solid #d5def0;color:#0a9c49;font-size:17px}.bus-group.unassigned h4{color:#ed6b00}
    .bus-row { min-height:99px; display:grid; grid-template-columns:68px 1fr auto 22px; align-items:center; gap:12px; border-bottom:1px solid #dbe2f0; }
    .bus-row:last-child { border-bottom:0; }.bus-row img{width:66px;height:60px;object-fit:cover;object-position:75% center;border-radius:9px}.bus-row strong{display:block;font-size:23px}.bus-row small{display:block;margin-top:7px;color:#3d4c7d}
    .bus-thumb { width:63px;height:56px;display:grid;place-items:center;border-radius:10px;color:#185bd6;background:#e7efff}.bus-thumb.yellow{color:#e09a00;background:#fff1c5}.bus-thumb ion-icon{font-size:42px}
    .ok { color:#0aaa50;font-size:25px }.no-driver{padding:7px 11px;border-radius:999px;color:#c62235;background:#ffe1e5;font-size:13px;white-space:nowrap}
    .point-list { border:1px solid #d5def0; border-radius:18px; padding:2px 16px; }
    .point-row { min-height:82px; display:grid; grid-template-columns:40px 1fr 22px; align-items:center; gap:12px; border-bottom:1px solid #dbe2f0; }
    .point-row:last-child{border-bottom:0}.point-row>span{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;color:#fff;background:#0b54d5;font-weight:800}.point-row strong{display:block;font-size:17px}.point-row small{display:block;margin-top:5px;color:#415386}
    .empty { color:#69779b; }
    .system-panel { min-height:208px; display:grid; grid-template-columns:320px 1fr 180px; align-items:center; gap:28px; margin-top:24px; padding:28px 36px; overflow:hidden; }
    .system-panel h3 { margin-bottom:10px; }.system-panel p{max-width:390px;color:#3e4e80;line-height:1.55}.system-panel ion-button{--border-radius:10px;--box-shadow:none;margin-top:8px;font-weight:750}
    .system-panel>img{width:155px;opacity:.1;justify-self:end}.chart-art{position:relative;height:140px;display:flex;align-items:flex-end;gap:12px;padding:30px;border:1px solid #d8e3f8;border-radius:18px;background:linear-gradient(135deg,#edf3ff,#fff)}
    .chart-art i{display:block;width:18px;border-radius:4px 4px 0 0;background:#155ee1}.chart-art i:nth-child(1){height:35px}.chart-art i:nth-child(2){height:58px}.chart-art i:nth-child(3){height:83px}.chart-art i:nth-child(4){height:108px}.chart-art span{position:absolute;right:28px;top:28px;width:72px;height:72px;border:17px solid #155ee1;border-right-color:#dce6f8;border-radius:50%}
    footer { padding:34px 4px 0; color:#c7d4f2; font-size:14px; }
    @media(max-width:1050px){.admin-shell{grid-template-columns:94px 1fr}.school-brand strong,nav span,.logout span{display:none}.school-brand img{width:68px;height:76px}nav a,.logout{justify-content:center;padding:0}.dashboard-grid{grid-template-columns:1fr}.system-panel{grid-template-columns:220px 1fr}.system-panel>img{display:none}}
    @media(max-width:720px){.admin-shell{display:block}.sidebar{display:none}.dashboard{padding:20px 14px 100px}.topbar h1{font-size:27px}.hero{height:360px}.hero-copy{padding:44px 20px}.hero-copy h2{font-size:39px}.hero-bus{opacity:.54;background-position:64% center}.hero::after{background:linear-gradient(90deg,rgba(3,31,92,.94),rgba(3,31,92,.5))}.metrics{grid-template-columns:repeat(2,1fr)}.metrics article{min-height:190px;padding:20px}.dashboard-grid{grid-template-columns:1fr}.system-panel{grid-template-columns:1fr;padding:28px}.chart-art{display:none}.bus-row{grid-template-columns:55px 1fr 22px}.bus-row .ok,.no-driver{display:none}.bus-row img{width:52px}.bus-row strong{font-size:19px}}
    @media(max-width:390px){.metrics{grid-template-columns:1fr 1fr;gap:10px}.metrics article{min-height:170px;padding:16px}.metrics strong{font-size:32px}.metrics b{font-size:16px}.metrics small{font-size:13px}.panel{padding:16px}.bus-group{padding-left:12px;padding-right:12px}}
  `]
})
export class AdminDashboardPage implements OnInit {
  data?: AdminDashboard;
  profileName = '';
  monthLabel = new Date().toLocaleString('en', { month: 'long', year: 'numeric' });
  currentYear = new Date().getFullYear();

  get assignedBuses() { return (this.data?.buses || []).filter(bus => !!bus.driver_id); }
  get unassignedBuses() { return (this.data?.buses || []).filter(bus => !bus.driver_id); }

  constructor(private api: ApiService, private router: Router) {
    addIcons({
      analyticsOutline,
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
      settingsOutline,
      speedometerOutline,
      timeOutline
    });
  }

  ngOnInit() {
    this.api.adminDashboard().subscribe(data => {
      this.data = data;
      this.profileName = data.profile?.full_name || 'Admin User';
    });
  }

  isYellow(bus: Bus) {
    return bus.color?.toLowerCase() === 'yellow';
  }

  logout() {
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    this.router.navigateByUrl('/login');
  }
}
