import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  busOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  mailOutline,
  notificationsOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { ApiService, AppNotification } from '../core/api.service';

type NotificationFilter = 'all' | 'unread' | 'read';

@Component({
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding
  ],
  template: `
    <ion-content class="updates-content">
      <main class="updates-page">
        <section class="updates-hero">
          <div class="hero-copy">
            <h1>Updates</h1>
            <b aria-hidden="true"></b>
            <div class="hero-subtitle">
              <span><ion-icon name="notifications-outline" /></span>
              <div>
                <strong>Notifications</strong>
                <p>Stay informed about your<br>transport and reservations.</p>
              </div>
            </div>
          </div>
          <div class="hero-picture" aria-hidden="true"></div>
        </section>

        <section class="notifications-panel">
          <div class="panel-heading">
            <div class="panel-title">
              <span><ion-icon name="notifications-outline" /></span>
              <h2>Notifications</h2>
            </div>

            <label class="filter-control">
              <select [(ngModel)]="filter">
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <ion-icon name="chevron-down-outline" />
            </label>
          </div>

          @if (message) {
            <div class="notice">{{ message }}</div>
          }

          <div class="notification-list">
            @for (note of filteredNotifications; track note.id) {
              <ion-item-sliding>
                <ion-item lines="none">
                  <article class="notification-card" [class.unread]="!note.read_at">
                    <span class="note-icon"><ion-icon [name]="iconFor(note)" /></span>
                    <div class="note-copy">
                      <div class="note-title">
                        <h3>{{ note.title }}</h3>
                        @if (!note.read_at) { <i>New</i> }
                      </div>
                      <p>{{ note.body }}</p>
                      <time>{{ note.created_at | date:'medium' }}</time>
                      @if (note.round_id && !note.read_at) {
                        <div class="actions">
                          <ion-button size="small" class="yes-button" (click)="respond(note.round_id, 'yes')">
                            Yes, I will be there
                          </ion-button>
                          <ion-button size="small" fill="outline" class="no-button" (click)="respond(note.round_id, 'no')">
                            No
                          </ion-button>
                        </div>
                      }
                    </div>
                  </article>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="danger" (click)="delete(note.id)">Delete</ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            } @empty {
              <div class="empty-state">
                <div class="empty-illustration">
                  <span><ion-icon name="notifications-outline" /></span>
                  <ion-icon class="mail-plane" name="mail-outline" />
                  <i class="spark one">+</i>
                  <i class="spark two">+</i>
                  <i class="spark three">+</i>
                </div>
                <h3>No notifications yet.</h3>
                <p>You'll see important updates about your transport,<br>reservations and payments here.</p>
                <div class="caught-up"><ion-icon name="notifications-outline" /> You're all caught up!</div>
              </div>
            }
          </div>

          <aside class="information-banner">
            <span><ion-icon name="shield-checkmark-outline" /></span>
            <div>
              <strong>We'll notify you here</strong>
              <p>Any updates regarding your bus, reservations, or account will appear here.</p>
            </div>
            <ion-icon class="banner-mail" name="mail-outline" />
          </aside>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .updates-content { --background: #032760; }
    .updates-page {
      min-height: 100%;
      padding-bottom: 112px;
      overflow: hidden;
      color: #fff;
      background:
        radial-gradient(circle at 12% 22%, rgba(25,104,225,.17), transparent 25%),
        linear-gradient(155deg, #001638 0%, #032963 60%, #0757d4 100%);
    }
    a { color: inherit; text-decoration: none; }
    h1, h2, h3, p { margin: 0; }
    select, button { font: inherit; }

    .updates-hero {
      max-width: 1440px;
      min-height: 520px;
      display: grid;
      grid-template-columns: 39% 61%;
      margin: 0 auto;
    }
    .hero-copy {
      position: relative;
      z-index: 2;
      padding: 78px 28px 55px 52px;
      background-image: radial-gradient(circle, rgba(23,125,255,.45) 2px, transparent 2px);
      background-position: 25px 18px;
      background-size: 28px 28px;
    }
    .hero-copy::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background: linear-gradient(90deg, rgba(0,22,56,.9), rgba(0,27,67,.75));
    }
    .hero-copy h1 { font-size: clamp(58px, 6vw, 78px); line-height: 1; letter-spacing: -.04em; font-weight: 850; }
    .hero-copy > b {
      display: block;
      width: 54px;
      height: 5px;
      margin: 30px 0 36px;
      border-radius: 5px;
      background: #1689ff;
    }
    .hero-subtitle { display: flex; align-items: flex-start; gap: 18px; }
    .hero-subtitle > span {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 14px;
      background: linear-gradient(145deg, #0b68df, #083ba1);
      font-size: 32px;
    }
    .hero-subtitle strong { display: block; margin: 7px 0 14px; font-size: 24px; }
    .hero-subtitle p { color: #cbd5e6; font-size: 18px; line-height: 1.55; }
    .hero-picture {
      position: relative;
      overflow: hidden;
      border-radius: 180px 0 0 180px;
      background:
        linear-gradient(90deg, rgba(6,49,119,.14), rgba(1,26,67,.08)),
        url('/assets/student-dashboard-bus.png') 68% 53% / cover no-repeat;
      box-shadow: -12px 0 0 #0759db;
    }

    .notifications-panel {
      position: relative;
      z-index: 3;
      max-width: 1380px;
      min-height: 0;
      margin: -14px auto 0;
      padding: 26px 30px 32px;
      border-radius: 18px;
      color: #071d4d;
      background: rgba(255,255,255,.98);
      box-shadow: 0 10px 30px rgba(0,16,53,.2);
    }
    .panel-heading {
      min-height: 82px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 25px;
      border-bottom: 1px solid #dfe7f2;
    }
    .panel-title { display: flex; align-items: center; gap: 20px; }
    .panel-title > span {
      width: 62px;
      height: 62px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      color: #fff;
      background: linear-gradient(145deg, #0b75ed, #073fc4);
      font-size: 34px;
    }
    .panel-title h2 { font-size: 27px; }
    .filter-control {
      position: relative;
      min-width: 112px;
      height: 58px;
      display: flex;
      align-items: center;
      border: 1px solid #d8e3f2;
      border-radius: 13px;
      background: #fff;
    }
    .filter-control select {
      width: 100%;
      height: 100%;
      padding: 0 42px 0 19px;
      border: 0;
      outline: 0;
      appearance: none;
      color: #112858;
      background: transparent;
      font-weight: 750;
      cursor: pointer;
    }
    .filter-control ion-icon { position: absolute; right: 14px; pointer-events: none; }
    .notice {
      margin: 20px 0 0;
      padding: 13px 16px;
      border: 1px solid #8cd9ab;
      border-radius: 13px;
      color: #087a41;
      background: #e2f8eb;
      font-weight: 750;
    }
    .notification-list { min-height: 260px; padding-top: 16px; }
    ion-item { --background: transparent; --padding-start: 0; --inner-padding-end: 0; }
    ion-item-sliding { margin-bottom: 12px; border-radius: 18px; }
    ion-item-option { font-weight: 800; }
    .notification-card {
      width: 100%;
      display: flex;
      gap: 18px;
      padding: 16px;
      border: 1px solid #e1e8f3;
      border-radius: 10px;
      background: #f8faff;
    }
    .notification-card.unread { border-color: #b9d5fb; background: #f1f7ff; }
    .note-icon {
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 14px;
      color: #0766df;
      background: #e3efff;
      font-size: 29px;
    }
    .note-copy { min-width: 0; flex: 1; }
    .note-title { display: flex; align-items: center; gap: 10px; }
    .note-title h3 { font-size: 20px; }
    .note-title i {
      padding: 3px 8px;
      border-radius: 999px;
      color: #fff;
      background: #0a70e8;
      font-size: 10px;
      font-style: normal;
      font-weight: 850;
    }
    .note-copy p { margin-top: 7px; color: #54637b; line-height: 1.5; }
    .note-copy time { display: block; margin-top: 8px; color: #8a96a9; font-size: 13px; }
    .actions { display: flex; gap: 9px; margin-top: 13px; }
    .yes-button, .no-button { height: 36px; margin: 0; text-transform: none; font-weight: 750; }
    .yes-button { --background: #0969e9; --border-radius: 10px; }
    .no-button { --color: #0969e9; --border-color: #9ac2f4; --border-radius: 10px; }

    .empty-state { padding: 32px 20px 38px; text-align: center; }
    .empty-illustration {
      position: relative;
      width: 230px;
      height: 180px;
      margin: 0 auto 12px;
    }
    .empty-illustration > span {
      position: absolute;
      left: 38px;
      top: 12px;
      width: 150px;
      height: 150px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #5075d4;
      background: linear-gradient(145deg, #eff4ff, #e4ecff);
      font-size: 78px;
    }
    .mail-plane { position: absolute; top: 46px; right: 3px; color: #4d73d1; font-size: 54px; transform: rotate(-20deg); }
    .spark { position: absolute; color: #5d92ff; font-size: 23px; font-style: normal; font-weight: 900; }
    .spark.one { left: 12px; top: 52px; }
    .spark.two { right: 18px; bottom: 20px; }
    .spark.three { left: 25px; bottom: 12px; }
    .empty-state h3 { font-size: 29px; }
    .empty-state > p { margin-top: 14px; color: #66728b; font-size: 19px; line-height: 1.55; }
    .caught-up {
      width: fit-content;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 30px auto 0;
      padding: 13px 24px;
      border: 2px solid #176df1;
      border-radius: 13px;
      color: #0b58cb;
      font-size: 17px;
      font-weight: 750;
    }
    .caught-up ion-icon { font-size: 24px; }
    .information-banner {
      min-height: 108px;
      display: grid;
      grid-template-columns: 62px 1fr 105px;
      align-items: center;
      gap: 20px;
      padding: 18px 28px;
      border-radius: 18px;
      background: linear-gradient(100deg, #edf4ff, #f3f6fc);
    }
    .information-banner > span {
      width: 60px;
      height: 60px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #fff;
      background: #0866e7;
      font-size: 32px;
    }
    .information-banner strong { font-size: 19px; }
    .information-banner p { margin-top: 8px; color: #5d6b83; font-size: 15px; }
    .banner-mail { color: #3478e5; font-size: 84px; }

    @media (max-width: 1050px) {
      .updates-hero { grid-template-columns: 42% 58%; }
    }

    @media (max-width: 820px) {
      .updates-hero { min-height: 600px; display: block; position: relative; }
      .hero-copy { position: absolute; inset: 0; z-index: 2; padding: 62px 24px 40px; background-size: 24px 24px; }
      .hero-copy::after { background: linear-gradient(180deg, rgba(0,22,56,.45), rgba(0,22,56,.97) 82%); }
      .hero-copy h1 { font-size: 58px; }
      .hero-subtitle { position: absolute; left: 24px; bottom: 48px; }
      .hero-picture { height: 100%; border-radius: 0; box-shadow: none; background-position: 64% center; }
      .notifications-panel { margin: -20px 14px 0; padding: 24px 20px 28px; }
    }

    @media (max-width: 520px) {
      .updates-page { padding-bottom: 94px; }
      .updates-hero { min-height: 520px; }
      .hero-copy { padding-top: 45px; }
      .hero-copy h1 { font-size: 48px; }
      .hero-copy > b { margin-top: 22px; }
      .hero-subtitle strong { font-size: 20px; }
      .hero-subtitle p { font-size: 15px; }
      .notifications-panel { margin-left: 9px; margin-right: 9px; padding: 20px 14px 22px; border-radius: 23px; }
      .panel-heading { min-height: 68px; }
      .panel-title { gap: 12px; }
      .panel-title > span { width: 50px; height: 50px; font-size: 28px; }
      .panel-title h2 { font-size: 21px; }
      .filter-control { min-width: 92px; height: 48px; }
      .filter-control select { padding-left: 14px; font-size: 14px; }
      .notification-card { gap: 12px; padding: 15px; }
      .note-icon { width: 46px; height: 46px; font-size: 24px; }
      .note-title h3 { font-size: 17px; }
      .note-copy p { font-size: 14px; }
      .actions { flex-wrap: wrap; }
      .empty-state { padding: 25px 5px 32px; }
      .empty-illustration { transform: scale(.82); margin-top: -10px; margin-bottom: -8px; }
      .empty-state h3 { font-size: 23px; }
      .empty-state > p { font-size: 15px; }
      .empty-state > p br { display: none; }
      .caught-up { padding: 11px 16px; font-size: 14px; }
      .information-banner { grid-template-columns: 52px 1fr; gap: 13px; padding: 16px; }
      .information-banner > span { width: 50px; height: 50px; font-size: 27px; }
      .information-banner strong { font-size: 16px; }
      .information-banner p { font-size: 13px; line-height: 1.4; }
      .banner-mail { display: none; }
    }
  `]
})
export class NotificationsPage implements OnInit {
  notifications: AppNotification[] = [];
  message = '';
  filter: NotificationFilter = 'all';

  get filteredNotifications() {
    if (this.filter === 'unread') return this.notifications.filter(note => !note.read_at);
    if (this.filter === 'read') return this.notifications.filter(note => Boolean(note.read_at));
    return this.notifications;
  }

  constructor(private api: ApiService) {
    addIcons({
      busOutline,
      checkmarkCircleOutline,
      chevronDownOutline,
      mailOutline,
      notificationsOutline,
      shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    this.api.notifications().subscribe(result => this.notifications = result.notifications);
  }

  iconFor(note: AppNotification) {
    return note.title.toLowerCase().includes('payment') ? 'checkmark-circle-outline' : 'bus-outline';
  }

  respond(roundId: string, response: 'yes' | 'no') {
    this.api.swipe(roundId, response).subscribe(() => {
      this.message = response === 'yes' ? 'Presence confirmed.' : 'Absence confirmed.';
      this.notifications = this.notifications.filter(note => note.round_id !== roundId);
      localStorage.removeItem('active_round');
    });
  }

  delete(notificationId: string) {
    this.api.deleteNotification(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(note => note.id !== notificationId);
      this.message = 'Notification deleted.';
    });
  }
}
