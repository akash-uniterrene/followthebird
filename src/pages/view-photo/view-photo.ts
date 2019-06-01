import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Nav, NavParams, ActionSheetController, AlertController, ToastController, Platform, MenuController, ModalController, LoadingController } from 'ionic-angular';
import { User } from '../../providers';
import { Post } from '../../providers/post/post';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { SocialSharing } from '@ionic-native/social-sharing';
import { StorageProvider } from '../../providers/storage/storage';
/**
 * Generated class for the ViewPhotoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-view-photo',
  templateUrl: 'view-photo.html',
})
export class ViewPhotoPage {
  public photo : any = [];
  public screenBlur = 1;
  private imageURL = "https://followthebirds.com/content/uploads/";
  constructor(public navCtrl: NavController, 
    public user: User,
    public post: Post,  
    public toastCtrl: ToastController,
    public navParams: NavParams,  
	public actionSheetCtrl: ActionSheetController,
	public alertCtrl: AlertController,
    public menu: MenuController,
    public nav: Nav,
	private transfer: FileTransfer,
	private file: File, 
    private fileOpener: FileOpener, 
	private socialSharing: SocialSharing,
	public storage: StorageProvider,
	public modalCtrl: ModalController,
	private platform: Platform) {
	  this.photo = this.navParams.get('photo') || [];
  }
  
  fileTransfer: FileTransferObject = this.transfer.create();
  
  ionViewDidLoad() {
    this.user.getPhoto(parseInt(localStorage.getItem('user_id')),{'photo_id':this.photo.photo_id,'get_gallery':true})
		.then(data => {
		this.photo = data;
	});
  }
  
  getNextPhoto(nextData){	 
	this.screenBlur = 0.5;
	this.user.getPhoto(parseInt(localStorage.getItem('user_id')),{'photo_id':nextData.photo_id,'get_gallery':true})
		.then(data => {
		this.photo = data;
		this.screenBlur = 1;
	});  
  }
  
  getPrevPhoto(prevData){
	 this.screenBlur = 0.5;
	 this.user.getPhoto(parseInt(localStorage.getItem('user_id')),{'photo_id':prevData.photo_id,'get_gallery':true})
		.then(data => {
		this.photo = data;
		this.screenBlur = 1;
	}); 
  }
  
  viewComments(){
	if(this.photo.is_single){
		const commentsModal = this.modalCtrl.create('CommentsPage',{comments:this.photo.post.post_comments,'post_id':this.photo.post_id,'handle':'post'});
		commentsModal.present();
	} else {
		let comments = '';
		const commentsModal = this.modalCtrl.create('CommentsPage',{comments,'post_id':this.photo.photo_id,'handle':'photo'});
		commentsModal.present();
	}
  }
  
  getBackgroundStyle(url) {
	if(!url){
		return 'url(assets/followthebirdImgs/no-profile-img.jpeg)'
	} else {
		return 'url(' + this.imageURL+url + ')'
	}
  }
  
  openSearch(){
    this.navCtrl.setRoot("SearchPage");
  }
  
  goBack(){
	 this.navCtrl.pop(); 
  }
  
  photoActivity(photo){	
	let  buttons : any = [
		{
		  icon: !this.platform.is('ios') ? 'ios-download' : null,	
		  text: 'Save to phone',
		  handler: () => {
			this.download(photo.source,"ShareImage");
		  }
		},{
		  icon: !this.platform.is('ios') ? 'share-alt' : null,		
		  text: 'Share External',
		  handler: () => {
			this.shareImg(photo.source,"ShareImage");  
		  }
		}
	];
	if(localStorage.getItem('user_id') == photo.post.author_id){		
		let deleteBtn : any = {
		  icon: !this.platform.is('ios') ? 'ios-trash' : null,		
		  text: 'Delete Photo',
		  handler: () => {
			this.deletePhotoAction(photo.photo_id)
		  }
		};		
		buttons.push(deleteBtn);
	} else {
		let report : any = {
		  icon: !this.platform.is('ios') ? 'ios-alert' : null,		
		  text: 'Report Photo',
		  handler: () => {
			this.reportAction("post",photo.post.post_id)
		  }
		};		
		buttons.push(report);
	}
	
	const actionSheet = this.actionSheetCtrl.create({
	  buttons
	});
	
	actionSheet.present();
  }
  
  sharePostCtrl(post_id): void
	{
		let prompt = this.alertCtrl.create({
		title: 'Share this post',	
		inputs : [
		{
			type:'radio',
			label:'Share post now ',
			value:post_id
		},
		{
			type:'radio',
			label:'Write Post',
			value:post_id
		}],
		buttons : [
		{
			text: "Cancel",
			handler: data => {
			}
		},
		{
			text: "Share",
			handler: data => {
				this.sharePost('share',post_id);
			}
		}]});
		prompt.present();
	}
	
	sharePost(type,id){
		this.post.sharePost({'do':type,id:id,my_id:localStorage.getItem('user_id')}).subscribe((resp) => {
		  let toast = this.toastCtrl.create({
			message: "Post has been shared successfully",
			duration: 3000,
			position: 'top',
			dismissOnPageChange: true
		  });
        toast.present();	
		}, (err) => {
        let toast = this.toastCtrl.create({
          message: "Unable to post. Retry",
          duration: 3000,
          position: 'top',
          dismissOnPageChange: true
        });
        toast.present();
      });
	}
	
	//Save Image Function
	download(url,folder) {
		if(this.storage.imageDownload(url,folder)){
			let toast = this.toastCtrl.create({
				message: "Image has been saved!",
				duration: 3000,
				position: 'top',
				dismissOnPageChange: true
			});
			toast.present();
		} else {
			let toast = this.toastCtrl.create({
				message: "Image has been saved!",
				duration: 3000,
				position: 'top',
				dismissOnPageChange: true
			});
			toast.present();
		}
	}
	
	deletePhotoAction(photo_id){
		const confirm = this.alertCtrl.create({
		  title: 'Delete Photo',
		  message: 'Are you sure want to delete this photo?',
		  buttons: [
			{
			  text: 'Cancel',
			  handler: () => {
				
			  }
			},
			{
			  text: 'Delete',
			  handler: () => {
				this.reactAction('delete_photo',photo_id)				
			  }
			}
		  ]
		});
		confirm.present();
	}
	
	reactAction(type,post_id){
		let params :any = {
			'do': type,
			'id': post_id,
			'my_id' : localStorage.getItem('user_id')
		};
		this.post.reaction(params).subscribe((resp) => {						
			let toast = this.toastCtrl.create({
				message: "Image has been deleted",
				duration: 3000,
				position: 'top',
				dismissOnPageChange: true
			});
			toast.present();
			this.getNextPhoto(this.photo.next);
		}, (err) => {
			let toast = this.toastCtrl.create({
				message: "sorry! image is unable to delete.",
				duration: 3000,
				position: 'top',
				dismissOnPageChange: true
			});
			toast.present();
		});
	}
 
   reportAction(handle,id){
	let params :any = {
		'handle': handle,
		'id': id,
		'my_id' : localStorage.getItem('user_id')
	};
	this.user.report(params).subscribe((resp) => {						
	  let toast = this.toastCtrl.create({
		message: "Report has been submitted successfully",
		duration: 3000,
		position: 'top',
		dismissOnPageChange: true
	  });
	  toast.present();
	}, (err) => {
	  let toast = this.toastCtrl.create({
		message: "Failed to Submit Report. Please Try Again",
		duration: 3000,
		position: 'top',
		dismissOnPageChange: true
	  });
	  toast.present();
	});
  }
  
  shareImg(url,folder) {
	var arr = url.split("/");
	var imageName = arr[arr.length - 1];	
	const absurl = this.imageURL+url;
	this.fileTransfer.download(absurl, this.file.externalRootDirectory + 'FollowTheBirds/'+folder+'/'+imageName).then((entry) => {
		return new Promise(resolve => {
			console.log('success ' + resolve);
			this.socialSharing.share("","Subject", this.file.externalRootDirectory + 'FollowTheBirds/'+folder+ "/" + imageName, '')
				.then((entries) => {
					console.log('success ' + JSON.stringify(entries));
			}).catch((error) => {
					alert('error ' + JSON.stringify(error));
			});
		});  
	}, (error) => {
			return false;
	});
  }

}
