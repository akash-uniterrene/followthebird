import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ModalController, ViewController } from 'ionic-angular';
import { User } from '../../providers';
import { Post } from '../../providers/post/post';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the CommentsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})
export class CommentsPage {
	@ViewChild('postPhoto') postPhoto;	
	postPhotoOptions: FormGroup;
	@ViewChild('comment_box') comment_box;
	public comments : any = [];
	public post_id : any;
	public post_comment : any = {
		handle:'',
		message:'',
		id:'',
		my_id:localStorage.getItem('user_id')
	};
	public title = "Comments";
	public publishPhotos : any = '';
	private imageURL = "https://followthebirds.com/content/uploads/";
	
	private stickers = [];
	private stickerHeight;
	private stickerEmoji : string = "emoji";
	private sticker_active = 'false';
	private showEmojiTab;
	private allSticker = [];
	private allEmoji = [];
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public user: User, formBuilder: FormBuilder, public viewCtrl:ViewController,public modalCtrl: ModalController, public loadingCtrl: LoadingController, private camera: Camera, public toastCtrl: ToastController, public post: Post) {
	this.comments = this.navParams.get('comments') || [];
	this.post_comment.id = this.navParams.get('post_id');
	this.post_comment.handle = this.navParams.get('handle');
	if(this.post_comment.handle == 'comment'){
		this.title = "Replies";
	}
	this.user.getStickers({}).then(data => {		  
		let item = data[0];
		for (var key in item) {
			this.stickers[":STK-"+item[key].sticker_id+":"] = item[key].image;
		}	
	});
	this.postPhotoOptions = formBuilder.group({
		file: [],
		type: "photos",
		handle: "comment",
		multiple: true,
		user_id : localStorage.getItem('user_id')
	});
  }

  ionViewDidLoad() {
	if(this.post_comment.handle == 'photo'){
		this.user.getPhoto(parseInt(localStorage.getItem('user_id')),{'photo_id':this.post_comment.id})
			.then(data => {
			this.comments = data['photo_comments'];
		});
	}
	
	this.user.getStickers({}).then(data => {		  
		this.allSticker = data[0];	
	});
	
	this.user.getEmojis({}).then(data => {		  
		this.allEmoji = data[0];	
	});
  }
	
  dismiss() {
   this.viewCtrl.dismiss(this.comments.length);
  }
  
  takeCameraSnap(){
	const options: CameraOptions = {
	  quality: 100,
	  destinationType: this.camera.DestinationType.DATA_URL,
	  sourceType: this.camera.PictureSourceType.CAMERA,
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
  
  getBackgroundStyle(url) {
	if(!url){
		return 'url(assets/followthebirdImgs/no-profile-img.jpeg)'
	} else {
		return 'url(' + this.imageURL+url + ')'
	}
  }
  
  removePhoto(){
	this.publishPhotos = '';
	this.post_comment['photo'] = '';
  }
  
  uploadFromGallery(){
	this.postPhoto.nativeElement.click();
  }
  
  showSticker(){
	this.sticker_active = 'true';  
	let timer = 100;
	var interval;
	clearInterval(interval);
	var smooth = 10;
	var unit = (smooth*100)/timer;
    var width = unit;
	interval = setInterval(() => {
        width = width + unit;
		if(width <= 250){
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
	  this.showEmojiTab = action;
  }

  sendEmoji(emoji){
	this.post_comment.message = this.post_comment.message + emoji + ' ';
  }
  
  sendStickerMsg(sticker){
	this.stickerHeight = 0;
	this.post_comment.message = sticker;
	this.postComment();
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
		this.publishPhotos = resp;
		this.post_comment['photo'] = resp;
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
  
    setReplyComment(comments,post_id){
	  const commentsReplyModal = this.modalCtrl.create('CommentsPage',{comments,'post_id':post_id,'handle':'comment'});
	  commentsReplyModal.present();
    }
  
  
	postComment(){
	  this.post.postComment(this.post_comment).subscribe((resp) => {	
		  this.comments.push(resp);
		  this.post_comment.message = '';
		  this.post_comment.photo = '';
		  this.publishPhotos = '';
	  }, (err) => {        
	  });
	}
  
}
