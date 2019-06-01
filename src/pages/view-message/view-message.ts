import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ModalController } from 'ionic-angular';
import { User } from '../../providers';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Observable, Subject, ReplaySubject} from 'rxjs';
/**
 * Generated class for the ViewMessagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-view-message',
  templateUrl: 'view-message.html',
})
export class ViewMessagePage {
  @ViewChild('postPhoto') postPhoto;	
  postPhotoOptions: FormGroup;
  private conversation : any = [];
  private messages : any = [];
  private imageURL = "https://followthebirds.com/content/uploads/";
  private group = false;
  public publishPhotos : any = [];
  myId = localStorage.getItem('user_id');
  private pageCount = 1;
  public chatBox : any = {
	image: "",
	message: "",
	message_id: "34",
	time: "",
	user_firstname: localStorage.getItem('user_firstname'),
	user_gender: localStorage.getItem("male"),
	user_id: localStorage.getItem('user_id'),
	user_lastname: localStorage.getItem('user_lastname'),
	user_name: localStorage.getItem('user_name'),
	user_picture: localStorage.getItem('user_picture')
  };
  sub : any = '';
  private chatInfo : any = {
	message: '',
	user_id:localStorage.getItem('user_id')
  };
  
  private recipients = [];
  
  private stickers = [];
  private emojis = {
	  ":D":"😃",
	  ":kiss:":"💋",
	  ":heart:":"❤️",
	  ":green_heart:":"💚",
	  ":cupid:":"💘",
  };
  private stickerHeight;
  private stickerEmoji : string = "emoji";
  private sticker_active = 'false';
  private showEmojiTab;
  private allSticker = [];
  private allEmoji = [];
  constructor(public navCtrl: NavController, public user: User, formBuilder: FormBuilder, public modalCtrl: ModalController, private camera: Camera, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public navParams: NavParams) {
	  this.user.getStickers({}).then(data => {		  
		let item = data[0];
		for (var key in item) {
			this.stickers[":STK-"+item[key].sticker_id+":"] = item[key].image;
		}	
	  });
	  this.postPhotoOptions = formBuilder.group({
			file: [],
			type: "photos",
			handle: "chat",
			multiple: true,
			user_id : localStorage.getItem('user_id')
	  });
	  this.conversation = navParams.get('conversation') || [];
	  this.group = navParams.get('group') || false;
	  if(this.conversation.conversation_id) {
			this.chatInfo['conversation_id'] = this.conversation.conversation_id;
	  } else {
			this.recipients.push(this.conversation.id);
			this.chatInfo['recipients'] = this.recipients;
		}
		this.sub = Observable.interval(2000)
			.subscribe((val) => { this.getLiveLiteChat() });
	}

	ionViewDidLoad() {
	  if(this.conversation.conversation_id) {		
		this.user.viewMessage({user_id:localStorage.getItem('user_id'),conversation_id:this.conversation.conversation_id}).then(data => {
			this.messages = data['messages'];	
			localStorage.setItem('last_message_id',this.messages[this.messages.length-1].message_id)
			this.update_scroll();
		});
	  } else {
		this.user.getMessages({user_id:localStorage.getItem('user_id'),ids:this.conversation.id}).then(data => {
			if(data[0].messages){
				this.messages = data[0].messages;   
				localStorage.setItem('last_message_id',this.messages[this.messages.length-1].message_id)
			}	   
			if(data[0].conversation_id){
				this.conversation.conversation_id = data[0].conversation_id;
				this.chatInfo['conversation_id'] = data[0].conversation_id;	
			}
			this.update_scroll();
		});
		
	  }
	  
	  this.user.getStickers({}).then(data => {		  
		this.allSticker = data[0];	
	  });
	  
	  this.user.getEmojis({}).then(data => {		  
		this.allEmoji = data[0];	
	  });
	  
	  
	}

	ionViewDidLeave() {
		this.sub.unsubscribe();
	}
	
	takeCameraSnap(sourceType:number){
		const options: CameraOptions = {
		  quality: 100,
		  destinationType: this.camera.DestinationType.DATA_URL,
		  sourceType: sourceType,
		  encodingType: this.camera.EncodingType.JPEG,
		  mediaType: this.camera.MediaType.PICTURE,
		  allowEdit:true,
		  targetWidth: 500,
		  targetHeight: 500,
		  saveToPhotoAlbum: true,
		  correctOrientation: true //Corrects Android orientation quirks
		};	
		
		this.camera.getPicture(options).then((imageData) => {
		  // imageData is either a base64 encoded string or a file URI
		   this.postPhotoOptions.patchValue({ 'file': "data:image/jpeg;base64,"+imageData }); 
		   this.postPhotoOptions.patchValue({ 'multiple': false });
		   this.uploadPhoto(this.postPhotoOptions);
		 }, (err) => {
			alert('Unable to take photo');
		 });
	}
	
	uploadFromVault(){
		let profileModal = this.modalCtrl.create("VaultsPage", {'filter':"image",handle:'chat',conversation_id:this.conversation.conversation_id});
		profileModal.present();
    }
  
  sendMessage(){
	  this.user.postMessage(this.chatInfo).subscribe((resp) => {	
		this.conversation.conversation_id = resp['conversation_id'];
		localStorage.setItem('last_message_id',resp['last_message_id']);
		let message = new Array();
		message['image'] = resp['image'];
		message['message'] = resp['message'];
		message['time'] = resp['time'];
		message['user_firstname'] = localStorage.getItem("user_firstname");
		message['user_id'] = localStorage.getItem("user_id");
		message['user_gender'] = localStorage.getItem("user_gender");
		message['user_lastname'] = localStorage.getItem("user_lastname");
		message['user_name'] = localStorage.getItem("user_name");
		message['user_picture'] = localStorage.getItem("user_picture");
		this.messages.push(message);
		this.publishPhotos = [];
		this.chatInfo.message = '';
		this.chatInfo.photo = '';
	}, (err) => {
		
	});
  }

  isToday(data){
	 var date = data.split(' ');
	 var today = new Date();
	 var dd = today.getDate();
	 var mm = today.getMonth()+1; 
	 var yyyy = today.getFullYear();
	 
	 var pDate = date[0].split('-');
	 if(pDate[0] != yyyy ){
		 return false;
	 } else {
		 if(pDate[1] != mm){
			 return false;
		 }else{
			 if(pDate[2] != dd){
				 return false;
			 }else{
				 return true;
			 }
		 }
	 }
	 
  }
  
	messageAction(profile){
		let recipient = {
			name:profile.user_firstname+' '+profile.user_lastname,
			picture:profile.user_picture,
			id:profile.user_id
		};
		this.navCtrl.push('ViewMessagePage', {conversation: recipient});
	}
  
  getBackgroundStyle(url) {
	if(!url){
		return 'url(assets/followthebirdImgs/no-profile-img.jpeg)'
	} else {
		return 'url(' + this.imageURL+url + ')'
	}
  }
  
  removePhoto(){
	this.publishPhotos = [];
	this.chatInfo['photo'] = '';
  }
  
  uploadFromGallery(){
	this.postPhoto.nativeElement.click();
  }
  
  showSticker(){
	this.sticker_active = 'true';
	console.log("hi",this.sticker_active);
	let timer = 100;
	var interval;
	clearInterval(interval);
	var smooth = 10;
	var unit = (smooth*100)/timer;
    var width = unit;
	interval = setInterval(() => {
        width = width + unit;
		if(width <= 170){
			this.stickerHeight = width;			
		} else {
			clearInterval(interval);
		}
    }, smooth);
  }
  

  
  hideSticker() {
	this.sticker_active = 'false';
	let timer = 100;
	var interval;
	clearInterval(interval);
	var smooth = 10;
	var unit = (smooth*100);
    var width = unit;
	interval = setInterval(() => {
        width = width - unit;
		if(width >= 0){
			this.stickerHeight = width;			
		} else {
			clearInterval(interval);
		}
    }, smooth);
  }
  
  showEmoji(action,event){
	 /*  console.log(event);
	  event.target.style.backgroundColor = "#750bb5";
	  event.target.style.color = "#ffffff"; */
	  this.showEmojiTab = action;
  }

  sendEmoji(emoji){
	this.chatInfo.message = this.chatInfo.message + emoji + ' ';
  }
  
  
  sendStickerMsg(sticker){
	this.stickerHeight = 0;
	this.sticker_active = 'false';
	this.chatInfo.message = sticker;
	this.sendMessage();
  }
  
  processWebImage(event) {
	let reader = new FileReader();
	reader.onload = (readerEvent) => {
		let imageData = (readerEvent.target as any).result;
		this.postPhotoOptions.patchValue({ 'file': imageData });
		this.postPhotoOptions.patchValue({ 'multiple': false });
		this.uploadPhoto(this.postPhotoOptions);	  
	};
	reader.readAsDataURL(event.target.files[0]);
  }
  
  uploadPhoto(params){
	let loading = this.loadingCtrl.create({
		content: 'Uploading...'
	});
	loading.present();
	this.user.photoUploader(params).subscribe((resp) => {
		loading.dismiss();	
		this.publishPhotos.push(resp);
		this.chatInfo['photo'] = JSON.stringify(this.publishPhotos[0]);
	}, (err) => {
		loading.dismiss();		
		let toast = this.toastCtrl.create({
		message: "image uploading failed",
		duration: 3000,
		position: 'top'
		});
		toast.present();
	});
  }
  
	
	
	getLiveLiteChat(){
		if(this.conversation.conversation_id !== undefined){
			let items :any = {
				user_id:localStorage.getItem('user_id'),
				conversation_id:this.conversation.conversation_id,
				last_message_id:localStorage.getItem('last_message_id')
			}
			this.user.getLiveLiteChat(items).then((data) => {	
				let item : any = data;
				if(item.length > 0){
					localStorage.setItem('last_message_id',data[0].message_id);
					for (var key in item) {
					  this.messages.push(item[key]);
					}
					this.update_scroll();
				}
				
			}, (err) => {
					
			});
		}
	}
	
	doInfinite(infiniteScroll) {
		setTimeout(() => {
		  if(this.conversation.conversation_id) {		
			this.user.loadMessages({user_id:localStorage.getItem('user_id'),conversation_id:this.conversation.conversation_id,'page': this.pageCount}).then(data => {
				let item : any = data[0];
				if(data[0].length > 0){
					for (var key in item) {
					  this.messages.unshift(item[key]);
					}
				}
				this.pageCount = this.pageCount + 1;
			});
		  } else {
			this.user.loadMessages({user_id:localStorage.getItem('user_id'),ids:this.conversation.id,'page': this.pageCount}).then(data => {
				let item : any = data[0];
				if(data[0].length > 0){
					for (var key in item) {
					  this.messages.unshift(item[key]);
					}
				}
				this.pageCount = this.pageCount + 1;
			});
		  }
		  infiniteScroll.complete();
		}, 100);
	}
	
	update_scroll(){		
		setTimeout(function(){
			var aa = document.getElementsByClassName('scroll-content');
			if(aa.length > 0){
				aa[4].scrollTo(0,aa[4].scrollHeight)
			}
		},10)
	}
	
	goBack(){
		this.navCtrl.pop();
	}
	
	
}
