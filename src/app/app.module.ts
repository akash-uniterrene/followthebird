import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { Items } from '../mocks/providers/items';
import { Settings, User, Api } from '../providers';
import { MyApp } from './app.component';
import { StorageProvider } from '../providers/storage/storage';
import { Post } from '../providers/post/post';
import { EventsProvider } from '../providers/events/events';
import { Groups } from '../providers/groups/groups';
import { ForgetPasswordProvider } from '../providers/forget-password/forget-password';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { SQLite } from '@ionic-native/sqlite';
import { SocialSharing } from '@ionic-native/social-sharing';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { AlbumProvider } from '../providers/album/album';
import { PageProvider } from '../providers/page/page';
import { Badge } from '@ionic-native/badge';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ImagePicker } from '@ionic-native/image-picker';
// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient] 
      }
    }),
    IonicModule.forRoot(MyApp,{
      platforms: {
        android: {
          tabsPlacement: 'top',
        },
        ios: {
          tabsPlacement: 'bottom',
        }
      }
    }),
	HttpModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    Api,
	AndroidPermissions,
    Items,
    User,
    Camera,
	Badge,
    SplashScreen,
    StatusBar,
	ImagePicker,
	LocalNotifications,
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    StorageProvider,
	Post,
	EventsProvider,
	Groups,
	SocialSharing,
	FileOpener,
    ForgetPasswordProvider,
	FileTransfer,
	FileTransferObject,
	File,
	SQLitePorter,
    SQLite,
    AlbumProvider,
    PageProvider	
  ]
})
export class AppModule { }
