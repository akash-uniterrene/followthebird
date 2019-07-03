import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Nav, NavParams, ActionSheetController, ModalController, AlertController, ToastController, Platform, MenuController, LoadingController, } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { User } from '../../providers';
import { Post } from '../../providers/post/post';
import { Groups } from '../../providers/groups/groups';
import { StorageProvider } from '../../providers/storage/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Observable, Subject, ReplaySubject} from 'rxjs';
/**
 * Generated class for the GroupProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-group-profile',
  templateUrl: 'group-profile.html',
})
export class GroupProfilePage {
  @ViewChild('coverPhoto') coverPhoto;
  coverPhotoOptions: FormGroup;
  private myId : number = parseInt(localStorage.getItem('user_id'));	
  public groupProfile : any = [];
  public postElement = [];
  postFeeds: any = [];
  public groupDetailszone : string = "timeline";
  sub : any = '';
  private imageURL = "https://followthebirds.com/content/uploads/";	
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
    profile_picture: 'updated his profile picture',
    profile_cover: 'updated his cover photo',
    page_picture: 'updated page picture',
    page_cover: 'updated cover photo',
    group_picture: 'updated group picture',
    group_cover: 'updated group cover',
    event_cover: 'updated event cover'
  };
  height : number = 300;
  width : number = 300;
  constructor(
    public groups: Groups,
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
		this.groupProfile = navParams.get('groupProfile');
		this.groups.getGroupProfile(parseInt(this.groupProfile.group_id),{'user_id':localStorage.getItem('user_id'),'filter':'all'}).then(data => {
		  this.groupProfile = data;
		  this.getPost();			  
		  localStorage.setItem('last_post_live',this.groupProfile.posts[0].post_id);
		  this.postElement['handle'] = "group";
		  this.postElement['id'] = this.groupProfile['group_id'];	
		});
		
		this.coverPhotoOptions = formBuilder.group({
		  file: "assets/followthebirdImgs/coverimage.png",
		  type: "photos",
		  handle: "cover-group",
		  multiple: false,
		  id: '',
		  user_id : localStorage.getItem('user_id')
		});
  }

	ionViewDidEnter(){
		if(this.postFeeds.length <= '0'){
			this.sub = Observable.interval(3000)
			.subscribe((val) => { this.getLiveLitePost() });
		}
	}
  
	ionViewDidLeave() {
		this.sub.unsubscribe();
	}
	
	getPost(){
		this.post.getfeeds('posts_group',this.groupProfile['group_id'],localStorage.getItem('user_id'))
			.then(data => {
				let item = data[0];
				localStorage.setItem('last_post_live',item[0].post_id);
				for (var key in item) {
				  this.postFeeds.push(item[key]);
				}
		});
	}
	
	viewProfile(user_name,user_id) {
		this.nav.setRoot('ProfilePage', {user_name: user_name,user_id:user_id});
	}
  
  getCoverBackgroundStyle() {
    if(!this.groupProfile.group_cover){
      return 'url(assets/followthebirdImgs/coover_dummy.png)'
    } else {
      return 'url(' + this.imageURL+this.groupProfile.group_cover + ')'
    }
  }

  getMembers(){
    this.groups.getGroupProfile(parseInt(this.groupProfile.group_id),{'user_id':localStorage.getItem('user_id'),'filter':'members'}).then(data => {
			this.groupProfile['members'] = data['members'];
		});
  }
  
  getAlbums(){
    this.groups.getGroupProfile(parseInt(this.groupProfile.group_id),{'user_id':localStorage.getItem('user_id'),'filter':'albums'}).then(data => {
			this.groupProfile['albums'] = data['albums'];
		});
  }

	settingAction(){
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Settings',
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-create' : null,	
			  text: 'Edit Group Details',
			  handler: () => {
					this.editGroup();
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-trash' : null,		
			  text: 'Delete Group',
			  handler: () => {
					const confirm = this.alertCtrl.create({
						title: 'Delete group?',
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
								this.deleteGroup()
							}
						}
						]
					});
					confirm.present();  
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

 
  getBackgroundStyle(url) {
		if(!url){
			return 'url(assets/followthebirdImgs/no-profile-img.jpeg)'
		} else {
			return 'url(' + this.imageURL+url + ')'
		}
  }
  
  uploadCoverPicture() {
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Upload Cover Picture',
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-camera' : null,	
			  text: 'Take a Picture',
			  handler: () => {
				this.takeCameraSnap(1)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'ios-images' : null,		
			  text: 'Upload from gallery',
			  handler: () => {
				this.takeCameraSnap(0)
			  }
			},{
			  icon: !this.platform.is('ios') ? 'trash' : null,
			  text: 'Remove cover photo',
			  handler: () => {
				  this.removePhoto({"my_id":localStorage.getItem('user_id'),"handle":"cover-group","id":this.groupProfile.group_id})
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
  
	takeCameraSnap(sourceType:number){
		const options: CameraOptions = {
		  quality: 100,
		  destinationType: this.camera.DestinationType.DATA_URL,
		  sourceType: sourceType,
		  encodingType: this.camera.EncodingType.JPEG,
		  mediaType: this.camera.MediaType.PICTURE,
		  allowEdit:true,
		  saveToPhotoAlbum: true,
		  correctOrientation: true //Corrects Android orientation quirks
		};	
		
		this.camera.getPicture(options).then((imageData) => {
		  // imageData is either a base64 encoded string or a file URI
		  this.coverPhotoOptions.patchValue({ 'file': "data:image/jpeg;base64,"+imageData }); 
		  this.uploadCoverPhoto(this.coverPhotoOptions); 
		 }, (err) => {
			alert('Unable to take photo');
		 });
  }
  
  uploadFromGallery(){
		this.coverPhoto.nativeElement.click(); 
	}
	
	processWebImage(event,type) {
		let reader = new FileReader();
		reader.onload = (readerEvent) => {
		let imageData = (readerEvent.target as any).result;
		 this.coverPhotoOptions.patchValue({ 'file': imageData }); 				
		 this.uploadCoverPhoto(this.coverPhotoOptions); 
		};
		reader.readAsDataURL(event.target.files[0]);
	}
	
	uploadCoverPhoto(params){
		this.coverPhotoOptions.patchValue({ 'id': this.groupProfile['group_id'] }); 
		let loading = this.loadingCtrl.create({
			content: 'Uploading...'
		});
		loading.present();
		this.user.photoUploader(params).subscribe((resp) => {	
			loading.dismiss();
			this.groupProfile.group_cover = resp;
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
  
  leaveGroup(){
    this.connectAction('group-leave');
    this.groupProfile.i_joined = false;
  }

  joinGroup(){
    this.connectAction('group-join');
    if(this.groupProfile.group_privacy == 'public'){
      this.groupProfile.i_joined = "approved";
    } else {
      this.groupProfile.i_joined = "pending";
    }
  }

  viewComments(index,comments,post_id){
	const commentsModal = this.modalCtrl.create('CommentsPage',{comments,'post_id':post_id,'handle':'post'});
	 commentsModal.onDidDismiss(data => {
		this.postFeeds[index].comments = data;
	});
	commentsModal.present();
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
			console.log("cancel clicked");
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

  getAlbum(album_id){
		this.navCtrl.push("AlbumPage",{'album_id':album_id});
	}

  connectAction(type,uid?: any){
		let params :any = {
			'do': type,
			'id': this.groupProfile.group_id,
			'uid': uid,
			'my_id' : localStorage.getItem('user_id')
		};
		this.user.connection(params).subscribe((resp) => {						
			
		}, (err) => {
		
		});
	}
	
	editGroup(){
		this.navCtrl.push("GroupEditPage",{'group':this.groupProfile});
	}
	deleteGroup(){
		let params = {
			id:this.groupProfile.group_id,
			my_id: localStorage.getItem('user_id'),
			handle:'group'
		}
		this.user.activityDelete(params).subscribe((resp) => {
			let toast = this.toastCtrl.create({
				message: "Group Deleted",
				duration: 3000,
				position: 'top'
			});
			toast.present();
			this.navCtrl.setRoot('HomePage');
		}, (err) => {
			let toast = this.toastCtrl.create({
				message: "Failed to Delete group! Try Again later",
				duration: 3000,
				position: 'top'
			});
			toast.present();
		});
	}
	
	getLiveLitePost(){
		this.user.getLiveLitePost({user_id: localStorage.getItem('user_id'),type:'posts_group',type_id:this.groupProfile.group_id,last_post_live: localStorage.getItem('last_post_live')}).then((data) => {	
			let item : any = data;
			if(item.length > 0){
				localStorage.setItem('last_post_live',data[0].post_id);
				for (var key in item) {
				  this.groupProfile.posts.unshift(item[key]);
				}
			}
		}, (err) => {
				
		});	
	}

}
