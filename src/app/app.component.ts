import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';
import { Observable, Subject, ReplaySubject} from 'rxjs';
import { FirstRunPage } from '../pages';
import { Settings } from '../providers';
import { AlertController } from 'ionic-angular';
import { Badge } from '@ionic-native/badge';
import { User } from '../providers';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { File } from '@ionic-native/file';
@Component({
  template: `
  <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage = FirstRunPage;
  public alertShown:boolean = false;
  @ViewChild(Nav) nav: Nav;
  
  public notificationCount : any = 1;
  sub : any = '';
  constructor(private translate: TranslateService, private file: File, public plt: Platform, private localNotifications: LocalNotifications, private androidPermissions: AndroidPermissions, public badge: Badge,public user: User, private alertCtrl: AlertController, platform: Platform, settings: Settings, private config: Config, private statusBar: StatusBar, private splashScreen: SplashScreen) {
    platform.ready().then(() => {
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#750bb5');
      this.splashScreen.hide();
	  if(localStorage.getItem('user_id')){
		this.sub = Observable.interval(3000)
			.subscribe((val) => { this.getNotifictionData() });
	    this.localNotifications.on('click').subscribe((notification) => {
			let json = JSON.parse(notification.data);
			let alert = this.alertCtrl.create({
				title : notification.data,
				subTitle : json.myData
			});	
			alert.present();
	    });
      }	  
    });
    this.initTranslate();
  }

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();

    if (browserLang) {
      if (browserLang === 'zh') {
        const browserCultureLang = this.translate.getBrowserCultureLang();

        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translate.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translate.use('zh-cmn-Hant');
        }
      } else {
        this.translate.use(this.translate.getBrowserLang());
      }
    } else {
      this.translate.use('en'); // Set your language here
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }
  
  openPage(page) {
    this.nav.setRoot(page.component);
  }

  getNotifictionData(){
	this.user.getLiveLiteData({id: localStorage.getItem('user_id')}).subscribe((resp) => {	
        if(resp['user_live_notifications_counter'] >= this.notificationCount){
          this.notificationCount = this.notificationCount + 1;
          this.badge.set(resp['user_live_notifications_counter']);
          this.seduleNotification("John doe comments on your photo");
        }
        
    }, (err) => {
        
    });	      
  }

  seduleNotification(msg){
	this.localNotifications.schedule({
	  id: 1,
	  title: 'Followthebirds',
	  text: msg,
	  //sound: !this.plt.is('ios')? this.file.externalRootDirectory +'call-beep.wav': this.file.externalRootDirectory +'call-beep.wav',
	  sound: this.file.externalRootDirectory +'call-beep.wav',
	  data: { myData: "my hidden notification" }
	});
  }
}
