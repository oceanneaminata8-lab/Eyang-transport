import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  busOutline,
  calendarOutline,
  cardOutline,
  closeOutline,
  gridOutline,
  homeOutline,
  locationOutline,
  logOutOutline,
  menuOutline,
  notificationsOutline,
  peopleOutline,
  personOutline,
  scanOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="top" class="system-header">
        <button class="menu-button" type="button" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen" aria-label="Open navigation">
          <ion-icon [name]="menuOpen ? 'close-outline' : 'menu-outline'"></ion-icon>
        </button>

        <div class="header-brand">
          <img src="assets/st jean logo.png" alt="Saint Jean Ingenieur logo">
          <span>Saint Jean<br>Ingenieur</span>
        </div>

        <div class="header-links desktop-links">
          @if (role === 'student') {
            <ion-tab-button tab="student" href="/app/student"><ion-icon name="home-outline"></ion-icon><ion-label>Dashboard</ion-label></ion-tab-button>
            <ion-tab-button tab="track" href="/app/track"><ion-icon name="bus-outline"></ion-icon><ion-label>Transport</ion-label></ion-tab-button>
            <ion-tab-button tab="reservation" href="/app/reservation"><ion-icon name="calendar-outline"></ion-icon><ion-label>Reservations</ion-label></ion-tab-button>
            <ion-tab-button tab="notifications" href="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><ion-label>Updates</ion-label></ion-tab-button>
            <ion-tab-button tab="profile" href="/app/profile"><ion-icon name="person-outline"></ion-icon><ion-label>Profile</ion-label></ion-tab-button>
          }

          @if (role === 'driver') {
            <ion-tab-button tab="driver" href="/app/driver"><ion-icon name="scan-outline"></ion-icon><ion-label>Scanner</ion-label></ion-tab-button>
            <ion-tab-button tab="track" href="/app/track"><ion-icon name="location-outline"></ion-icon><ion-label>Map</ion-label></ion-tab-button>
            <ion-tab-button tab="notifications" href="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><ion-label>Updates</ion-label></ion-tab-button>
            <ion-tab-button tab="profile" href="/app/profile"><ion-icon name="person-outline"></ion-icon><ion-label>Profile</ion-label></ion-tab-button>
          }

          @if (role === 'admin') {
            <ion-tab-button tab="admin" href="/app/admin"><ion-icon name="grid-outline"></ion-icon><ion-label>Dashboard</ion-label></ion-tab-button>
            <ion-tab-button tab="track" href="/app/track"><ion-icon name="location-outline"></ion-icon><ion-label>Track Bus</ion-label></ion-tab-button>
            <ion-tab-button tab="reservation" href="/app/reservation"><ion-icon name="calendar-outline"></ion-icon><ion-label>Reservations</ion-label></ion-tab-button>
            <ion-tab-button tab="students" href="/app/students"><ion-icon name="people-outline"></ion-icon><ion-label>Students</ion-label></ion-tab-button>
            <ion-tab-button tab="drivers" href="/app/drivers"><ion-icon name="bus-outline"></ion-icon><ion-label>Drivers</ion-label></ion-tab-button>
            <ion-tab-button tab="payments" href="/app/payments"><ion-icon name="card-outline"></ion-icon><ion-label>Payments</ion-label></ion-tab-button>
            <ion-tab-button tab="notifications" href="/app/notifications"><ion-icon name="notifications-outline"></ion-icon><ion-label>Updates</ion-label></ion-tab-button>
            <ion-tab-button tab="admin-profile" href="/app/admin-profile"><ion-icon name="person-outline"></ion-icon><ion-label>Account</ion-label></ion-tab-button>
          }
        </div>

        <button class="logout-button" type="button" (click)="logout()" aria-label="Log out">
          <ion-icon name="log-out-outline"></ion-icon><span>Logout</span>
        </button>

      </ion-tab-bar>

      @if (menuOpen) {
        <button class="menu-backdrop" type="button" (click)="closeMenu()" aria-label="Close navigation"></button>
        <nav class="mobile-menu" aria-label="Mobile navigation">
          <div class="mobile-menu-head">
            <img src="assets/st jean logo.png" alt="">
            <strong>Navigation</strong>
            <button type="button" (click)="closeMenu()" aria-label="Close navigation"><ion-icon name="close-outline"></ion-icon></button>
          </div>

          @if (role === 'student') {
            <a href="/app/student" (click)="closeMenu()"><ion-icon name="home-outline"></ion-icon>Dashboard</a>
            <a href="/app/track" (click)="closeMenu()"><ion-icon name="bus-outline"></ion-icon>Transport</a>
            <a href="/app/reservation" (click)="closeMenu()"><ion-icon name="calendar-outline"></ion-icon>Reservations</a>
            <a href="/app/notifications" (click)="closeMenu()"><ion-icon name="notifications-outline"></ion-icon>Updates</a>
            <a href="/app/profile" (click)="closeMenu()"><ion-icon name="person-outline"></ion-icon>Profile</a>
          }

          @if (role === 'driver') {
            <a href="/app/driver" (click)="closeMenu()"><ion-icon name="scan-outline"></ion-icon>Scanner</a>
            <a href="/app/track" (click)="closeMenu()"><ion-icon name="location-outline"></ion-icon>Map</a>
            <a href="/app/notifications" (click)="closeMenu()"><ion-icon name="notifications-outline"></ion-icon>Updates</a>
            <a href="/app/profile" (click)="closeMenu()"><ion-icon name="person-outline"></ion-icon>Profile</a>
          }

          @if (role === 'admin') {
            <a href="/app/admin" (click)="closeMenu()"><ion-icon name="grid-outline"></ion-icon>Dashboard</a>
            <a href="/app/track" (click)="closeMenu()"><ion-icon name="location-outline"></ion-icon>Track Bus</a>
            <a href="/app/reservation" (click)="closeMenu()"><ion-icon name="calendar-outline"></ion-icon>Reservations</a>
            <a href="/app/students" (click)="closeMenu()"><ion-icon name="people-outline"></ion-icon>Students</a>
            <a href="/app/drivers" (click)="closeMenu()"><ion-icon name="bus-outline"></ion-icon>Drivers</a>
            <a href="/app/payments" (click)="closeMenu()"><ion-icon name="card-outline"></ion-icon>Payments</a>
            <a href="/app/notifications" (click)="closeMenu()"><ion-icon name="notifications-outline"></ion-icon>Updates</a>
            <a href="/app/admin-profile" (click)="closeMenu()"><ion-icon name="person-outline"></ion-icon>Account</a>
          }

          <button class="mobile-logout" type="button" (click)="logout()">
            <ion-icon name="log-out-outline"></ion-icon>Logout
          </button>
        </nav>
      }
    </ion-tabs>
  `,
  styles: [`
    .system-header {
      --background: linear-gradient(90deg, #031435, #07347d);
      --border: 0;
      width: 100%;
      height: 86px;
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 9px max(18px, calc((100vw - 1400px) / 2));
      box-shadow: 0 8px 28px rgba(1, 15, 48, .28);
      color: #fff;
      z-index: 1000;
    }
    .header-brand {
      min-width: 190px;
      display: flex;
      align-items: center;
      gap: 11px;
      color: #fff;
      font-size: 16px;
      font-weight: 780;
      line-height: 1.12;
    }
    .header-brand img { width: 54px; height: 60px; object-fit: contain; }
    .header-links {
      flex: 1;
      min-width: 0;
      height: 64px;
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: 5px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .header-links::-webkit-scrollbar { display: none; }
    .header-links ion-tab-button {
      --background: transparent;
      --color: #b9c8e5;
      --color-selected: #fff;
      --padding-start: 16px;
      --padding-end: 16px;
      min-width: 94px;
      max-width: 150px;
      border-radius: 14px;
      font-weight: 700;
    }
    .header-links ion-tab-button.tab-selected { --background: #0a4db8; }
    .header-links ion-icon { font-size: 23px; }
    .header-links ion-label { margin-top: 4px; font-size: 12px; }
    .logout-button {
      min-width: 96px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 13px;
      color: #fff;
      background: rgba(255,255,255,.08);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .logout-button ion-icon { font-size: 21px; }
    .menu-button {
      display: none;
      width: 46px;
      height: 46px;
      flex: 0 0 auto;
      place-items: center;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 12px;
      color: #fff;
      background: rgba(255,255,255,.08);
      font-size: 28px;
      cursor: pointer;
    }
    .menu-backdrop {
      position: fixed;
      inset: 74px 0 0;
      z-index: 1998;
      border: 0;
      background: rgba(0, 10, 34, .58);
      backdrop-filter: blur(3px);
    }
    .mobile-menu {
      position: fixed;
      z-index: 1999;
      top: 74px;
      left: 0;
      bottom: 0;
      width: min(340px, 88vw);
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 18px 14px 24px;
      overflow-y: auto;
      color: #fff;
      background: linear-gradient(165deg, #031435, #07347d);
      box-shadow: 18px 0 45px rgba(0, 10, 35, .32);
      animation: slide-in .2s ease-out;
    }
    @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    .mobile-menu-head {
      display: grid;
      grid-template-columns: 45px 1fr 42px;
      align-items: center;
      gap: 12px;
      padding: 2px 5px 16px;
      border-bottom: 1px solid rgba(255,255,255,.15);
      margin-bottom: 7px;
    }
    .mobile-menu-head img { width: 43px; height: 48px; object-fit: contain; }
    .mobile-menu-head strong { font-size: 16px; }
    .mobile-menu-head button {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 10px;
      color: #fff;
      background: rgba(255,255,255,.1);
      font-size: 24px;
    }
    .mobile-menu a, .mobile-logout {
      min-height: 52px;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 17px;
      border: 0;
      border-radius: 12px;
      color: #e6efff;
      background: transparent;
      text-decoration: none;
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .mobile-menu a:hover { background: rgba(14, 91, 210, .7); }
    .mobile-menu a ion-icon, .mobile-logout ion-icon { font-size: 24px; }
    .mobile-logout {
      margin-top: auto;
      color: #fff;
      background: rgba(255,255,255,.09);
    }
    @media (max-width: 780px) {
      .system-header { height: 74px; gap: 8px; padding: 6px 9px; }
      .header-brand { min-width: 0; width: auto; flex: 1; justify-content: flex-start; }
      .header-brand img { width: 47px; height: 52px; }
      .header-brand span { display: block; font-size: 12px; }
      .desktop-links, .logout-button { display: none; }
      .menu-button { display: grid; }
    }
  `]
})
export class TabsPage {
  role = JSON.parse(localStorage.getItem('ests_user') || '{}').role || 'student';
  menuOpen = false;

  constructor(private router: Router) {
    addIcons({
      busOutline,
      calendarOutline,
      cardOutline,
      closeOutline,
      gridOutline,
      homeOutline,
      locationOutline,
      logOutOutline,
      menuOutline,
      notificationsOutline,
      peopleOutline,
      personOutline,
      scanOutline
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() {
    this.menuOpen = false;
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    this.router.navigateByUrl('/login');
  }
}
