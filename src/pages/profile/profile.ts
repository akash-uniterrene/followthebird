import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Nav, NavParams, ActionSheetController, AlertController, ToastController, Platform, MenuController, LoadingController,ModalController } from 'ionic-angular';
import { FirstRunPage} from '../';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Post } from '../../providers/post/post';
import { User } from '../../providers';
import { StorageProvider } from '../../providers/storage/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Observable, Subject, ReplaySubject} from 'rxjs';
/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
	@ViewChild('profilePhoto') profilePhoto;
	@ViewChild('coverPhoto') coverPhoto;	
	profileName : string;
	profile : any = [];
	friendLists : any = [];
	photos : any = [];
	profilePhotoOptions: FormGroup;
	coverPhotoOptions: FormGroup;
	sub : any = '';
	public readyState = 'false';
	private imageURL = "https://followthebirds.com/content/uploads/";
	private myId :number = parseInt(localStorage.getItem('user_id'));
	headerActive = false;
	private pageCount = 2;
	private arrayPosition = 0;
	private profile_id;
	public postElement = [];
	postFeeds: any = [];
	height : number = 300;
	width : number = 300;
	post_type: any = {
		shared: 'shared',
		link: 'shared a link',
		poll: 'created a poll',
		product: 'added new product for sell',
		article: 'added new article',
		video : 'added a video',
		audio: 'added an audio',
		file: 'added a file',
		photos: 'added a photo',
		profile_picture_male: 'updated his profile picture',
		profile_picture_female: 'updated her profile picture',
		profile_cover_male: 'updated his cover photo',
		profile_cover_female: 'updated her cover photo',
		page_picture: 'updated page picture',
		page_cover: 'updated cover photo',
		group_picture: 'updated group picture',
		group_cover: 'updated group cover',
		event_cover: 'updated event cover'
	};
  
  
	constructor(
		public navCtrl: NavController, 
		public user: User,
		public post: Post,
		public storage: StorageProvider,
		public toastCtrl: ToastController,
		public navParams: NavParams, 
		formBuilder: FormBuilder,	
		private camera: Camera,
		public platform: Platform, 
		public menu: MenuController,
		public nav: Nav,
		public actionSheetCtrl: ActionSheetController,
		public loadingCtrl: LoadingController,
		public modalCtrl: ModalController,
		private transfer: FileTransfer,
		private file: File,
		private alertCtrl: AlertController			
    ) {
		platform.ready().then((readySource) => {
			this.width = platform.width();
			this.height = platform.height();
		});
		this.profileName = navParams.get('user_name') || localStorage.getItem('user_name');
		this.profile_id = navParams.get('user_id') || localStorage.getItem('user_id');
		if(navParams.get('user_name')){
			this.headerActive = true;
		}
		this.profilePhotoOptions = formBuilder.group({
			file: "assets/followthebirdImgs/no-profile-img.jpeg",
			type: "photos",
			handle: "picture-user",
			multiple: false,
			user_id : localStorage.getItem('user_id')
		});
	  
		this.coverPhotoOptions = formBuilder.group({
			file: "assets/followthebirdImgs/coverimage.png",
			type: "photos",
			handle: "cover-user",
			multiple: false,
			user_id : localStorage.getItem('user_id')
		});
		
		this.sub = Observable.interval(10000)
			.subscribe((val) => { this.getLiveLitePost() });
	}
	
	ionViewDidLoad(){
		this.user.getProfile(parseInt(localStorage.getItem('user_id')),{'user_name':this.profileName}).then(data => {
			if(data){
				this.profile = data;
				this.postElement['handle'] = "user";
				this.postElement['id'] = this.profile_id;
				this.readyState = 'true';
			} else {
				let toast = this.toastCtrl.create({
					message: "This user can not be visible",
					duration: 3000,
					position: 'top'
				});
				toast.present();
				this.nav.setRoot('HomePage');
			}
			
		});
		
		this.photos = [];
		this.friendLists = [];
		
		this.user.getphotos(parseInt(localStorage.getItem('user_id')),{'type':'user','id':this.profile_id})
		.then(data => {
			let item = data[0];
			for (var key in item) {
			  this.photos.push(item[key]);
			}
		});
		
		this.user.getfriends(parseInt(this.profile_id))
		.then(data => {
			let item = data[0];
			for (var key in item) {
			  this.friendLists.push(item[key]);
			}
		});
		this.post.getfeeds('posts_profile',this.profile_id,localStorage.getItem('user_id'),{'filter':'all'})
		.then(data => {
			let item = data[0];
			localStorage.setItem('last_post_live',item[0].post_id);
			for (var key in item) {
			  this.postFeeds.push(item[key]);
			}
		});
	}
	
	ionViewDidLeave() {
		this.sub.unsubscribe();
	}
	
	doRefresh(refresher) {
		this.ionViewDidLoad();
		setTimeout(() => {
		  refresher.complete();
		}, 2000);
	}
	
	viewPost(post) {
		if(post.photos_num == '1'){
			this.nav.push('ViewPhotoPage', {photo: post.photos[0]});
		} else {	
			this.nav.push('ViewPostPage', {post: post});
		}
	}
	  
	viewImage(photo){
		this.nav.push('ViewPhotoPage', {photo: photo});
	}
  
	viewProfile(user_name,user_id) {
		this.nav.push('ProfilePage', {user_name: user_name,user_id:user_id});
	}

	viewAbout(){
		this.nav.push('AboutPage', {profile: this.profile});
	}
	
	viewPhotos(user_id){
		this.nav.push('PhotosPage', {user_id: user_id});
	}
	
	editProfile(profile){
		this.nav.push('EditProfilePage', {'profile': profile});
	}
	
	editDetails(profile){
		this.nav.push('EditDetailsPage', {'profile': profile});
	}
	
	uploadProfilePicture(profile) {
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Upload Profile Picture',
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-camera' : null,	
			  text: 'View profile picture',
			  handler: () => {
				let photo: any = {
					photo_id: profile.user_picture_id,					
					source: profile.user_picture,
					privacy: "public"
				};
				this.viewImage(photo)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-camera' : null,	
			  text: 'Take a Picture',
			  handler: () => {
				this.takeCameraSnap('profile',1)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-images' : null,		
			  text: 'Upload from gallery',
			  handler: () => {
				this.takeCameraSnap('profile',0)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'trash' : null,
			  text: 'Remove profile photo',
			  handler: () => {
				  this.removePhoto({"my_id":localStorage.getItem('user_id'),"handle":"picture-user","id":this.profile_id})
			  }
			},{
			  icon: !this.platform.is('ios') ? 'close' : null,
			  text: 'Cancel',
			  role: 'cancel',
			  handler: () => {
			  }
			}
		  ]
		});
		actionSheet.present();
	}
	
	uploadCoverPicture(profile) {
		
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Upload Cover Picture',
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-image' : null,	
			  text: 'View cover photo',
			  handler: () => {
				  let photo: any = {
					photo_id: profile.user_cover_id,					
					source: profile.user_cover,
					privacy: "public"
				  };
				  this.viewImage(photo)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-camera' : null,	
			  text: 'Take a Picture',
			  handler: () => {
				this.takeCameraSnap('cover',1)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-images' : null,		
			  text: 'Upload from gallery',
			  handler: () => {
				this.takeCameraSnap('cover',0)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'trash' : null,
			  text: 'Remove cover photo',
			  handler: () => {
				  this.removePhoto({"my_id":localStorage.getItem('user_id'),"handle":"cover-user","id":this.profile_id})
			  }
			},{
			  icon: !this.platform.is('ios') ? 'close' : null,
			  text: 'Cancel',
			  role: 'cancel',
			  handler: () => {
			  }
			}
		  ]
		});
		actionSheet.present();
	}
  
	takeCameraSnap(type,sourceType:number){
		if(type == 'profile'){
			const options: CameraOptions = {
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
				if(type == 'profile'){			  
				this.profilePhotoOptions.patchValue({ 'file': "data:image/jpeg;base64,"+imageData }); 
				this.uploadProfilePhoto(this.profilePhotoOptions);
				} else {
				this.coverPhotoOptions.patchValue({ 'file': "data:image/jpeg;base64,"+imageData }); 
				this.uploadCoverPhoto(this.coverPhotoOptions); 
				}
			 }, (err) => {
				let toast = this.toastCtrl.create({
					message: "image capturing failed",
					duration: 3000,
					position: 'top'
				});
				toast.present();
			 });
		} else {
			const options: CameraOptions = {
				destinationType: this.camera.DestinationType.DATA_URL,
				sourceType: sourceType,
				encodingType: this.camera.EncodingType.JPEG,
				mediaType: this.camera.MediaType.PICTURE,
				allowEdit:true,
				//targetWidth: 700,
				//targetHeight: 400,
				saveToPhotoAlbum: true,
				correctOrientation: true //Corrects Android orientation quirks
			};	
			this.camera.getPicture(options).then((imageData) => {
				if(type == 'profile'){			  
					this.profilePhotoOptions.patchValue({ 'file': "data:image/jpeg;base64,"+imageData }); 
					this.uploadProfilePhoto(this.profilePhotoOptions);
				} else {
						this.coverPhotoOptions.patchValue({ 'file': "data:image/jpeg;base64,"+imageData }); 
						this.uploadCoverPhoto(this.coverPhotoOptions); 
				}
			}, (err) => {
				let toast = this.toastCtrl.create({
					message: "Image capturing failed",
					duration: 3000,
					position: 'top'
				});
				toast.present();
			});
		}
	}
	
	/* uploadFromGallery(type){
		if(type == 'profile'){ 
			this.profilePhoto.nativeElement.click(); 
		} else { 
			this.coverPhoto.nativeElement.click(); 
		}
	}
	
	processWebImage(event,type) {
		let reader = new FileReader();
		reader.onload = (readerEvent) => {
		let imageData = (readerEvent.target as any).result;
		 if(type == 'profile'){
			this.profilePhotoOptions.patchValue({ 'file': imageData }); 
			this.uploadProfilePhoto(this.profilePhotoOptions);
		 } else {
			this.coverPhotoOptions.patchValue({ 'file': imageData });  
			this.uploadCoverPhoto(this.coverPhotoOptions); 
			
		 }		  
		};
		reader.readAsDataURL(event.target.files[0]);
	} */
	  
	uploadProfilePhoto(params){

		let loading = this.loadingCtrl.create({
			content: 'Uploading...'
		});
		loading.present();

		 this.user.photoUploader(params).subscribe((resp) => {
			loading.dismiss();	
			this.profile.user_picture = resp;
			localStorage.setItem('user_picture',this.profile.user_picture);	
			let toast = this.toastCtrl.create({
				message: "Profile photo updated!",
				duration: 3000,
				position: 'top'
			});
			toast.present();

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
	
	
	uploadCoverPhoto(params){
		let loading = this.loadingCtrl.create({
			content: 'Uploading...'
		});
		loading.present();
		this.user.photoUploader(params).subscribe((resp) => {	
			loading.dismiss();
			this.profile.user_cover = resp;
			localStorage.setItem('user_cover',this.profile.user_cover);
			let toast = this.toastCtrl.create({
				message: "Cover photo updated!",
				duration: 3000,
				position: 'top'
			});
			toast.present();
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
	getProfileImageStyle() {
		return this.profilePhotoOptions.controls['file'].value;
	}
	
	getCoverImageStyle() {
		return this.coverPhotoOptions.controls['file'].value;
	}
	
	removePhoto(params) {
		let loading = this.loadingCtrl.create({
			content: 'Removing...'
		});
		loading.present();
		 this.user.photoRemover(params).subscribe((resp) => {
			loading.dismiss();	
			let toast = this.toastCtrl.create({
				message: "Profile photo removed!",
				duration: 3000,
				position: 'top'
			});
			toast.present();

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
	
	// Attempt to login in through our User service
	/* profileReload(user_id) {
		let loading = this.loadingCtrl.create({
			content: 'reloding details...'
		});
		
		loading.present();
		this.user.updateProfile(user_id).subscribe((resp) => {			
			loading.dismiss();			
			this.storage.setUser(resp);			
			this.nav.setRoot('HomePage',resp);
		}, (err) => {
			loading.dismiss();
		  let toast = this.toastCtrl.create({
			message: "unable to reload. please check your connection",
			duration: 3000,
			position: 'top'
		  });
		  toast.present();
		});
	} */

	activityAction(){
		this.nav.push('ActivityPage', {'profile': this.profile});
	}

	moreActivityAction(){
		const actionSheet = this.actionSheetCtrl.create({
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-person-add' : null,	
			  text: 'Disable Profile',
			  handler: () => {
					this.reportAction('user',this.profile.user_id)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-close' : null,		
			  text: 'Block',
			  handler: () => {
				this.blockAction()
			  }
			}
		  ]
		});
		actionSheet.present();
	}

	downloadAttachment(filePath){
	  let arr = filePath.split('/');
	  var filename = arr.pop();
	  let url = encodeURI(filePath);  
	  const fileTransfer: FileTransferObject = this.transfer.create();
	  fileTransfer.download(this.imageURL+filePath, this.file.dataDirectory + filename).then((entry) => {
		 let toast = this.toastCtrl.create({
			message: "Attachment bas been download",
			duration: 3000,
			position: 'top'
		});
	  }, (error) => {
		let toast = this.toastCtrl.create({
			message: "Attachment bas been download",
			duration: 3000,
			position: 'top'
		});
	 });
    }
	getBackgroundStyle(url) {
		if(!url){
			return 'url(assets/followthebirdImgs/no-profile-img.jpeg)'
		} else {
			return 'url(' + this.imageURL+url + ')'
		}
	}
	
	getCoverBackgroundStyle() {
		if(!this.profile.user_cover){
			return 'url(assets/followthebirdImgs/coover_dummy.png)'
		} else {
			return 'url(' + this.imageURL+this.profile.user_cover + ')'
		}
	}
	
	friendsAction() {
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Response to friend',
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-person-add' : null,	
			  text: 'Unfriend',
			  handler: () => {
				this.connectAction("friend-remove")
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-close' : null,		
			  text: 'Unfollow',
			  handler: () => {
				this.connectAction("unfollow");
				this.profile.i_follow = false;
			  }
			}
		  ]
		});
		actionSheet.present();
	}
	
	responseAction() {
		const actionSheet = this.actionSheetCtrl.create({
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-person-add' : null,	
			  text: 'Confirm',
			  handler: () => {
				this.connectAction('friend-accept');
				this.profile.we_friends = true;
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-close' : null,		
			  text: 'Delete Request',
			  handler: () => {
				this.connectAction("friend-decline")
			  }
			}
		  ]
		});
		actionSheet.present();
	}
	
	sentAction() {
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Response to friend',
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-person-add' : null,	
			  text: 'Cancel Request',
			  handler: () => {
				this.cancelRequestAction()
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-close' : null,		
			  text: 'Unfollow',
			  handler: () => {
				this.unfollowAction()
			  }
			}
		  ]
		});
		actionSheet.present();
	}
	
	addAction() {
		this.connectAction("friend-add");
		this.profile.i_request = true;
		this.profile.i_follow = true;
	}
	
	cancelRequestAction() {
		this.connectAction("friend-cancel");
		this.profile.i_request = false;
	}
	
	unfollowAction() {
		this.connectAction("unfollow");
		this.profile.i_follow = false;
	}
	
	followAction() {
		this.connectAction("follow");
		this.profile.i_follow = true;
	}
	
	messageAction(profile){
		let recipient = {
			name:profile.user_firstname+' '+profile.user_lastname,
			picture:profile.user_picture,
			id:profile.user_id
	    };
		this.navCtrl.push('ViewMessagePage', {conversation: recipient});
	}
	
	viewComments(index,comments,post_id){
		const commentsModal = this.modalCtrl.create('CommentsPage',{comments,'post_id':post_id,'handle':'post'});
		 commentsModal.onDidDismiss(data => {
			this.postFeeds[index].comments = data;
		});
		commentsModal.present();
	}
	
  postActivity(event,post): void
  {
	let  buttons : any = [
		{
		  icon: !this.platform.is('ios') ? 'ios-bookmark' : null,	
		  text: 'Save Post',
		  handler: () => {
			this.reactAction('save_post',post.post_id);
		  }
		},
		{
		  icon: !this.platform.is('ios') ? 'ios-eye-off' : null,		
		  text: 'Hide from timeline',
		  handler: () => {
			event.target.parentNode.parentNode.parentNode.parentNode.remove();
			this.reactAction("hide_post",post.post_id)
		  }
		}
	];	
	if(post.author_id == localStorage.getItem('user_id')){
		let btn : any = {
		  icon: !this.platform.is('ios') ? 'ios-trash' : null,		
		  text: 'Delete Post',
		  handler: () => {
			const confirm = this.alertCtrl.create({
			  title: 'Delete post?',
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
					event.target.parentNode.parentNode.parentNode.parentNode.remove();
					this.reactAction("delete_post",post.post_id)
				  }
				}
			  ]
			});
			confirm.present();  
		  }
		};
		buttons.push(btn);
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
	
	reactAction(type,post_id){
		let params :any = {
			'do': type,
			'id': post_id,
			'my_id' : localStorage.getItem('user_id')
		};
		this.post.reaction(params).subscribe((resp) => {						
			
		}, (err) => {
		
		});
	  }
  
	moreAction() {
		const actionSheet = this.actionSheetCtrl.create({
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-person-add' : null,	
			  text: 'Report',
			  handler: () => {
				this.reportAction('user',this.profile.user_id)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-close' : null,		
			  text: 'Block',
			  handler: () => {
				this.blockAction()
			  }
			}
		  ]
		});
		actionSheet.present();
	}
	
	listFriends(){
		this.nav.push('FriendsPage',{'user_id':this.profile.user_id});
	}

	blockAction(){
		const confirm = this.alertCtrl.create({
			title: 'Block '+this.profile.user_firstname+' '+this.profile.user_lastname+'?',
			message: 'If you block, '+this.profile.user_firstname+' will no longer to see your timeline and can not connect to you.',
			buttons: [
			{
				text: 'Cancel',
				handler: () => {
				
				}
			}
			,{
				text: 'Delete',
				handler: () => {
          this.connectAction('block');
					this.nav.setRoot('HomePage');
				}
			}
			]
		});
		confirm.present();  
		
  }
	
	connectAction(type){
		let params :any = {
			'do': type,
			'id': this.profile.user_id,
			'my_id' : localStorage.getItem('user_id')
		};
		this.user.connection(params).subscribe((resp) => {						
			
		}, (err) => {
		
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
	
	goBack(){
	  this.navCtrl.setRoot("HomePage");
	}
	
	openSearch(){
	  this.navCtrl.push("SearchPage");
	}
	
	getLiveLitePost(){
		let items :any = {
			type:'posts_profile',
			type_id:this.profile_id,
			user_id:localStorage.getItem('user_id'),
			last_post_live:localStorage.getItem('last_post_live')
		}
		this.user.getLiveLitePost(items).then((data) => {	
			let item : any = data;
			if(item.length > 0){
				localStorage.setItem('last_post_live',data[0].post_id);
				for (var key in item) {
				  this.postFeeds.unshift(item[key]);
				}
			}
		}, (err) => {
				
		});
	}
	
	doInfinite(infiniteScroll) {
		setTimeout(() => {
		  this.post.getfeeds('posts_profile',this.profile_id,localStorage.getItem('user_id'),{'page': this.pageCount})
			.then(data => {
				if(data[0].length > 0) {
					let item = data[0];
					for (var key in item) {
					  this.postFeeds.push(item[key]);
					}
				}
			});
		  this.pageCount = this.pageCount + 1;
		  this.arrayPosition = this.arrayPosition + 1;
		  infiniteScroll.complete();
		}, 500);
	}

}
