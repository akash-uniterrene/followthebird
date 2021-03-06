import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { User } from '../../providers';
/**
 * Generated class for the MessagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  public user_live_messages_counter = '';
  public onlineUsers = [];
  public offlineUsers = [];
  messagezone: string = "messages";
  public messages : any = [];
  public groups : any = [];
  private imageURL = "https://followthebirds.com/content/uploads/";
  private bulkMessage;
  private chatPhotos = [];
  private pageCount = 2;
  private stickers = [];
  private emojis = {
	  ":D":"ðŸ˜ƒ",
	  ":kiss:":"ðŸ’‹",
	  ":heart:":"â¤ï¸",
	  ":green_heart:":"ðŸ’š",
	  ":cupid:":"ðŸ’˜",
  };
  
  private chatInfo : any = {
	conversation_id:'',
	photo:'',
	message: '',
	user_id:localStorage.getItem('user_id'),
  };
  constructor(public navCtrl: NavController, public user: User, public navParams: NavParams,private alertCtrl: AlertController,public toastCtrl: ToastController) {
	  this.user.getStickers({}).then(data => {		  
		let item = data[0];
		for (var key in item) {
			this.stickers[":STK-"+item[key].sticker_id+":"] = item[key].image;
		}	
	  });
	  
	  this.getOnlineUsers();
	  this.getOfflineUsers();
	  this.getProfileData(localStorage.getItem('user_id'));
	  this.bulkMessage = navParams.get('bulkMessage') || 'false';
	  this.chatPhotos = navParams.get('files');
	  
  }

  ionViewDidLoad() {
	this.user.resetAlert({my_id:localStorage.getItem('user_id'),type:'messages'}).subscribe((resp) => {
		localStorage.setItem('user_live_messages_counter','0')
	}, (err) => {
		
	});	    
    this.user.getConversations({user_id:localStorage.getItem('user_id')}).then(data => {
		let item = data[0];
		for (var key in item) {
			if(item[key].multiple_recipients){
				this.groups.push(item[key]);
			} else {
				this.messages.push(item[key]);
			}		 
		}		
	});
  }
	
  getProfileData(id){
	this.user.updateProfile(id).subscribe((resp) => {	
		this.user_live_messages_counter = resp['user_live_messages_counter'];
		if(this.user_live_messages_counter == '0'){
			this.user_live_messages_counter = '';
		}
	}, (err) => {
		
	});	
  }
  
  getOnlineUsers(){
	 this.user.getOnlineUsers({user_id: parseInt(localStorage.getItem('user_id'))})
	.then(data => {
		this.onlineUsers = data[0];
	}); 
  }
  
  getOfflineUsers(){
		this.user.getOfflineUsers({user_id: parseInt(localStorage.getItem('user_id'))})
		.then(data => {
			this.offlineUsers = data[0];
		}); 
  }
  
  viewMessage(conversation){
	  this.navCtrl.push('ViewMessagePage', {conversation: conversation});
  }
  
  viewMessageGroup(conversation,group){
	  this.navCtrl.push('ViewMessagePage', {conversation: conversation,group:group});
  }
    
  createConversation(){
		this.navCtrl.push('CreateMessagePage');
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
	 }else{
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
  
  sentBulkMessage(event,message){		
	let item = this.chatPhotos;	
	for(var key in item){
		this.chatInfo.conversation_id = message.conversation_id;
		this.chatInfo.photo = JSON.stringify(item[key]);
		this.user.postMessage(this.chatInfo).subscribe((resp) => {	
			event.target.innerText = "SENT";
			event.target.offsetParent.disabled = true;
		}, (err) => {
			
		});
	}
  } 
  
  doInfinite(infiniteScroll) {
    setTimeout(() => {
	  this.user.getConversations({user_id:localStorage.getItem('user_id'),'page': this.pageCount})
		.then(data => {			
			if(data[0].length > 0) {
				let item = data[0];
				for (var key in item) {
					if(item[key].multiple_recipients){
						this.groups.push(item[key]);
					} else {
						this.messages.push(item[key]);
					}
				}
			}
		});
	  this.pageCount = this.pageCount + 1;
      infiniteScroll.complete();
    }, 500);
  }
   
  messageAction(profile){
	let recipient = {
		name:profile.user_firstname+' '+profile.user_lastname,
		picture:profile.user_picture,
		id:profile.user_id
	};
	this.navCtrl.push('ViewMessagePage', {conversation: recipient});
  }
  
  deleteConversationAction(conversation){
	const confirm = this.alertCtrl.create({
		title: 'Delete conversation?',
		message: 'Once you delete you can not undo this step.',
		buttons: [
		{
			text: 'Cancel',
			handler: () => {
			
			}
		}
		,{
			text: 'Delete',
			handler: () => {
			this.deleteConversation(conversation);
			}
		}
		]
	});
	confirm.present(); 
  }
  
  deleteConversation(conversation){
	let items :any = {
		user_id:localStorage.getItem('user_id'),
		conversation_id:conversation.conversation_id,
		last_message_id:localStorage.getItem('last_message_id')
	}
	this.user.deleteConversation(items).subscribe((resp) => {	
		let toast = this.toastCtrl.create({
			message: "Conversation has been deleted",
			duration: 3000,
			position: 'top',
			dismissOnPageChange: true
	  });
	  toast.present();		
	  this.navCtrl.setRoot('MessagesPage');
	}, (err) => {
		let toast = this.toastCtrl.create({
			message: "Failed to deleted conversation",
			duration: 3000,
			position: 'top',
			dismissOnPageChange: true
		});
		toast.present();	
	});
  }
	
  goBack(){
	this.navCtrl.setRoot('HomePage');
  }
}
