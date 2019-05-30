import { Component , ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController,Platform, AlertController, ViewController, ToastController, LoadingController,ModalController } from 'ionic-angular';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { User } from '../../providers';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageProvider } from '../../providers/storage/storage';
/**
 * Generated class for the ViewVaultPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
// declare var $ = any;
@IonicPage()
@Component({
  selector: 'page-view-vault',
  templateUrl: 'view-vault.html',
})
export class ViewVaultPage {
  @ViewChild('vaultPhoto') vaultPhoto;
  @ViewChild('vaultVideo') vaultVideo;
  @ViewChild('vaultAudio') vaultAudio;
  @ViewChild('vaultFile') vaultFile;
   public vault :any = [];
   private imageURL = "https://followthebirds.com/content/uploads/";
   public files = [];
   public type = '';
   vaultFileOptions: FormGroup;
   vaultPhotoOptions: FormGroup;
   public press: number = 0;
   public delete_file : any = [];
   public activeAdd = false;
   public fileCount = '';
   private handle = 'me';
   private handle_id = '';
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public user: User,
	formBuilder: FormBuilder,	
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public nav: NavController,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform, 
	public storage: StorageProvider,
    private camera: Camera,
	public modalCtrl: ModalController,
    public modal: ViewController,
	private transfer: FileTransfer,
	private alertCtrl: AlertController,
	private file: File
    ) {
		this.vault = navParams.get('vault');
		if(navParams.get('handle')){
			this.handle = navParams.get('handle');
			this.handle_id = navParams.get('handle_id');
		}
		this.vaultFileOptions = formBuilder.group({
			type: this.vault.type,
			multiple: true,
			folder_name: this.vault.folder_name,
			my_id : localStorage.getItem('user_id')
		});
		this.vaultPhotoOptions = formBuilder.group({
			file: "assets/followthebirdImgs/no-profile-img.jpeg",
			type: this.vault.type,
			multiple: true,
			folder_name: this.vault.folder_name,
			my_id : localStorage.getItem('user_id')
		});
	}

	ionViewDidLoad() {
		this.user.viewVault({folder_name:this.vault.folder_name,my_id:localStorage.getItem('user_id')}).then(data => {
			this.type = data[0].type;
			this.files = data[0].files;
		});		
	}
  
	uploadPicture() {
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Upload Photos',
		  buttons: [
			/* {
			  icon: !this.platform.is('ios') ? 'ios-camera' : null,	
			  text: 'Take a Picture',
			  handler: () => {
				this.takeCameraSnap()
			  }
			}, */{
			  icon: !this.platform.is('ios') ? 'ios-images' : null,		
			  text: 'Upload Photos',
			  handler: () => {
				this.uploadFromGallery('image');
				//this.takeCameraSnap(0)
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
	
	uploadAudio() {
		const actionSheet = this.actionSheetCtrl.create({
		  title: 'Upload Music ',
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-volume-up' : null,		
			  text: 'Upload Audio',
			  handler: () => {
				this.uploadFromGallery('audio');
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
  
	uploadVideo() {
		const actionSheet = this.actionSheetCtrl.create({
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-videocam' : null,		
			  text: 'Upload videos',
			  handler: () => {
				this.uploadFromGallery('video');
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
  
	  uploadFile() {
		const actionSheet = this.actionSheetCtrl.create({
		  buttons: [
			{
			  icon: !this.platform.is('ios') ? 'ios-attach' : null,		
			  text: 'Upload Attachment',
			  handler: () => {
				this.uploadFromGallery('file');
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
		  correctOrientation: true
		}
		
		this.camera.getPicture(options).then((imageData) => {
		   this.vaultPhotoOptions.patchValue({ 'file': "data:image/jpeg;base64,"+imageData }); 
			this.uploadPhoto(this.vaultPhotoOptions);
		}, (err) => {
			let toast = this.toastCtrl.create({
				message: "image capturing failed",
				duration: 3000,
				position: 'top'
			});
			toast.present();
		});
	}
  
	uploadFromGallery(type){
		if(type == 'image'){
			this.vaultPhoto.nativeElement.click();
		} else if(type == 'video') {
			this.vaultVideo.nativeElement.click();
		}else if(type == 'audio') {
			this.vaultAudio.nativeElement.click();
		}else{
			this.vaultFile.nativeElement.click();
		}
	}
	
	pressEvent(e){
		//e.target.childNodes[0].classList.remove('hide')
		console.log(e);
		e.target.classList.add('added');
		this.activeAdd = true;
		//e.onclick();
		//e.target.childNodes[2].childNodes[1].attributes[5].value = true;
		//setTimeout(function(){ console.log(e.target.childNodes[2].attributes);  }, 200);
	}
	
	processWebFile(event) {
		this.uploadMedia(event.target.files);
	}
	
	uploadPhoto(params){
		let loading = this.loadingCtrl.create({
			content: 'Uploading...'
		});
		loading.present();
		 this.user.vaultImageUploader(params).subscribe((resp) => {
			loading.dismiss();	
			let toast = this.toastCtrl.create({
				message: "file has been successfully uploaded",
				duration: 3000,
				position: 'top'
			});
			toast.present();
			let item = resp;
			for(var key in item){
				this.files.push(item[key]);
			}
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
	
	uploadMedia(files){
		console.log(files);
		let loading = this.loadingCtrl.create({
			content: 'Uploading...'
		});
		let mediaOptions;
		mediaOptions = this.vaultFileOptions.value;
		loading.present();
		
		this.user.vaultUploader(files,mediaOptions).subscribe((resp) => {
			loading.dismiss();	
			let toast = this.toastCtrl.create({
				message: "file has been successfully uploaded",
				duration: 3000,
				position: 'top'
			});
			toast.present();
			let item = resp;
			for(var key in item){
				this.files.push(item[key]);
			}
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
	
    goBack(){
	  this.navCtrl.pop();
    }
  
  getBackgroundStyle(url) {
		if(!url){
			return 'url(assets/followthebirdImgs/no-profile-img.jpeg)'
		} else {
			return 'url(' + this.imageURL+url + ')'
		}
  }
  
  downloadAttachment(url) {
	this.storage.imageDownload(url,'Vault');
	
  }
  
  
  onChange(file, event, index){
	console.log(event.checked);  
	if(event.checked){
		this.delete_file[index] = file;
	} else {
		this.delete_file.splice(index, 1);
	}	
	this.fileCount = this.delete_file.filter(function (el) {
		  return el != null;
	});
	if(event.checked){
		event._elementRef.nativeElement.parentNode.classList.add('added');
	}else{
		event._elementRef.nativeElement.parentNode.classList.remove('added');
		
	}		
	//event.target.parentNode.classList.add('added')
	
	
  }
  
	shareVaultCtrl(): void
	{
		let prompt = this.alertCtrl.create({
		title: 'Share Files',	
		inputs : [
		{
			type:'radio',
			label:'Share on status ',
			value:'status'
		},
		{
			type:'radio',
			label:'Share with Message',
			value:'message'
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
				this.shareFromVault(data);
			}
		}]});
		prompt.present();
	}
	
	shareFromVault(type){
		var filtered = this.delete_file.filter(function (el) {
		  return el != null;
		});
		
		if(type == 'status'){
			this.navCtrl.push("WhatsOnMindPage",{'files':filtered,handle:this.handle,id:this.handle_id,vault_type:this.type});
		}
		
		if(type == 'message'){
			this.navCtrl.push("MessagesPage",{'files':filtered,bulkMessage:'true',handle:this.handle,id:this.handle_id,vault_type:this.type});
		}
		
	}
  
	deleteConfirm() {
	  let alert = this.alertCtrl.create({
		title: 'Confirm Remove',
		message: 'Do you sure you want to delete selected items?',
		buttons: [
		  {
			text: 'Cancel',
			role: 'cancel',
			handler: () => {
			  
			}
		  },
		  {
			text: 'Delete',
			handler: () => {
			  this.deleteFile();
			}
		  }
		]
	  });
	  alert.present();
	}

  deleteFile(){
	var filtered = this.delete_file.filter(function (el) {
		  return el != null;
	});
	
	let loading = this.loadingCtrl.create({
		content: 'Deleting...'
	});
	
	let mediaOptions;
	mediaOptions = this.vaultFileOptions.value;
	loading.present();
	
	this.user.removeVaultFiles(filtered).subscribe((resp) => {
		loading.dismiss();	
		let toast = this.toastCtrl.create({
			message: "files has been successfully deleted",
			duration: 3000,
			position: 'top'
		});
		toast.present();
		let item = this.delete_file;
		for(var key in item){
			var index = this.files.indexOf(item[key]);			
			this.files.splice(index, 1);
		}
		this.selectCancel();
	}, (err) => {
	 loading.dismiss();		
	 let toast = this.toastCtrl.create({
		message: "files deletion failed",
		duration: 3000,
		position: 'top'
	  });
	  toast.present();
	});
  }
  
  selectCancel(){
	if(this.type == 'image'){
	  var list = document.getElementsByClassName("ImgWrapBig");
	} else {
	  var list = document.getElementsByClassName("selected_files");
	}
	 this.activeAdd = false;
	 this.delete_file = [];
	 for(var key in list){
		 if(list[key].classList){
			list[key].classList.remove('added');
		 }	
	 }	
  }
  

}
