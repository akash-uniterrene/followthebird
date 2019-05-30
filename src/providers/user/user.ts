import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';

import { Api } from '../api/api';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }Ø
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class User {
  _user: any;
   private imageURL = "https://followthebirds.com/content/uploads/";
	constructor(
		public api: Api,
		private transfer: FileTransfer,
		private file: File
	)  { 
					
		}	
	fileTransfer: FileTransferObject = this.transfer.create();
  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
	

  login(accountInfo: any) {
    let seq = this.api.post('sign_in', accountInfo).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      } else {
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  updateProfile(id:number){
	  
	let seq = this.api.get('user/'+id, '').share();
	seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      } else {
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  getLiveLiteData(params?: any){  
	let seq = this.api.post('live-data', params).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  getLiveLitePost(params?: any){	
		let user :any;
		let seq = this.api.get('live-posts', params).share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				user = res;
				resolve(user);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
  getLiveLiteChat(params?: any){	
		let message :any;
		let seq = this.api.get('live-chat', params).share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				message = res;
				resolve(message);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
  signup(accountInfo: any) {
    let seq = this.api.post('register', accountInfo).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this._user = null;
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
  }
  
  
   /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getphotos(user_id:number,params?: any) {
    let photos = [];
		let seq = this.api.get('photos/'+user_id, params).share();

		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				photos.push(res);
				resolve(photos);
			}, err => {
				console.error('ERROR', err);
			});
		});
	}
	/**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getBlocked(params?: any) {
    let users = [];
		let seq = this.api.get('blocking', params).share();

		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				users.push(res);
				resolve(users);
			}, err => {
				console.error('ERROR', err);
			});
		});
	}
  
   /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getalbums(user_id:number,params?: any) {
		let albums = [];	
		let seq = this.api.get('albums/'+user_id, params).share();

		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				albums.push(res);
				resolve(albums);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getPhoto(user_id:number,params?: any) {	
		let photo :any;
		let seq = this.api.get('photo/'+user_id, params).share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				photo = res;
				resolve(photo);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getfriends(id:number) {
		let frindlist = [];	
		let seq = this.api.get('friends/'+id, '').share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				frindlist.push(res);
				resolve(frindlist);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
   /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getOnlineUsers(params?: any) {
		let onlineUsers = [];	
		let seq = this.api.get('get_online_users', params).share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				onlineUsers.push(res);
				resolve(onlineUsers);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getOfflineUsers(params?: any) {
		let onlineUsers = [];	
		let seq = this.api.get('get_offline_users', params).share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				onlineUsers.push(res);
				resolve(onlineUsers);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
  
  
  queryUsers(id:number,params?: any) {
    let frindlist = [];	
	let seq = this.api.get('search/'+id, params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			frindlist.push(res);
			resolve(frindlist);
		}, err => {
			console.error('ERROR', err);
		});
	});
  }
  
  getSuggestedUser(type:string,id:number) {
	let frindlist = [];	
	let seq = this.api.get('people/'+type+'/'+id, '').share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			frindlist.push(res);
			resolve(frindlist);
		}, err => {
			console.error('ERROR', err);
		});
	});
  }
  
  getPendingRequest(type:string,id:number) {
		let frindlist = [];	
		let seq = this.api.get('people/'+type+'/'+id, '').share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				frindlist.push(res);
				resolve(frindlist);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
	
	getPeopleYouMayKnow(type:string,id:number) {
		let user = [];	
		let seq = this.api.get('people/'+type+'/'+id, '').share();
		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				user.push(res);
				resolve(user);
			}, err => {
				console.error('ERROR', err);
			});
		});
  }
  
  getSentRequest(type:string,id:number) {
	let frindlist = [];	
	let seq = this.api.get('people/'+type+'/'+id, '').share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			frindlist.push(res);
			resolve(frindlist);
		}, err => {
			console.error('ERROR', err);
		});
	});
  }
  
  getProfile(id:number,params: any){
	let user :any;
	let seq = this.api.get('profile/'+id, params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			user = res;
			resolve(user);
		}, err => {
			console.error('ERROR', err);
		});
	});
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  getevents(params?: any) {
	let eventlist = [];	
	let seq = this.api.get('events/66', '').share();

	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			eventlist.push(res);
			resolve(eventlist);
		}, err => {
			console.error('ERROR', err);
		});
	});
  }

  getProfilePic(){
    if(localStorage.getItem('user_picture') != ''){
     /*  let userPic = localStorage.getItem('user_picture');
	  var arr = userPic.split("/");
	  var pic_name = arr[arr.length - 1];
	  let FullPath = this.file.externalRootDirectory+'FollowTheBirds/ProfilePic/' + pic_name; */
      let FullPath = this.imageURL+localStorage.getItem('user_picture');
      return FullPath;
    }
    
  }   
  
	getNotifications(params?: any){
		let notificationsList = [];	
		let seq = this.api.get('notifications/'+localStorage.getItem('user_id'), params).share();

		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				notificationsList.push(res);
				resolve(notificationsList);
			}, err => {
				console.error('ERROR', err);
			});
		});
	}
	
	getActivitylog(params?: any){
		let activitylogList = [];	
		let seq = this.api.get('activitylog/'+localStorage.getItem('user_id'), params).share();

		// don't have the data yet
		return new Promise(resolve => {
			seq.subscribe((res: any) => {
				activitylogList.push(res);
				resolve(activitylogList);
			}, err => {
				console.error('ERROR', err);
			});
		});
	}
  
  getVaultStorage(params?: any) {
	let vaults = [];	
	let seq = this.api.get('vault', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			vaults.push(res);
			resolve(vaults);
		}, err => {
			console.error('ERROR', err);
		});
	});
  }
  
  viewVault(params?: any){
	let items = [];	
	let seq = this.api.get('view_vault', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			items.push(res);
			resolve(items);
		}, err => {
			console.error('ERROR', err);
		});
	});
  }
  
  createNewVault(params){
    let seq = this.api.post('create-vault', params).share();
    seq.subscribe((res: any) => {  
    }, err => {
      console.error('ERROR', err);
    });
    return seq;
  }
	
	resetAlert(params?: any){
		let seq = this.api.post('reset', params).share();
		seq.subscribe((res: any) => {  
		}, err => {
			console.error('ERROR', err);
		});
		return seq;
	}
	
  activityDelete(params){
    let seq = this.api.post('activity-delete', params).share();

    seq.subscribe((res: any) => {
     
    }, err => {
      console.error('ERROR', err);
    });

      return seq;
  }
  
  photoUploader(params){
	console.log(params.value);
    let seq = this.api.post('upload', params.value).share();

    seq.subscribe((res: any) => {

    }, err => {
      console.error('ERROR', err);
    });

      return seq;
  }
  
  nativePhotoUploader(params){
	  console.log(params.value);
	  let seq = this.api.post('uploadNative', params.value).share();

    seq.subscribe((res: any) => {
        // If the API returned a successful response, mark the user as logged in
      /* if (res.status == 'success') {
        //this._loggedIn(res);
      } else {
      } */
    }, err => {
      console.error('ERROR', err);
    });

      return seq;
  }
  
  photoMultiUploader(data,params){
	var options = {
	};
	
	let body = new FormData();
	for (var i = 0; i<=data.length; i++) {
	  body.append('file[]',data[i]);
	}
	
	//body.append('file[]', data);
	console.log(data);
	
	for (var key in params) {
	  body.append(key,params[key]);
	}
	console.log(body);
	
	let seq = this.api.post('photo_multi_upload', body, options).share();

    seq.subscribe((res: any) => {
        
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
 }
  
  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  connection(params: any) {
    let seq = this.api.post('connect', params).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  photoRemover(params: any) {
	let seq = this.api.post('remove-photo', params).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  } 
 
 fileUploader(data,params){
	var options = {
	};
	let body = new FormData();
	body.append('file', data);
	for (var key in params) {
	  body.append(key,params[key]);
	}
	
	
	let seq = this.api.post('file_upload', body, options).share();

    seq.subscribe((res: any) => {
        // If the API returned a successful response, mark the user as logged in
      /* if (res.status == 'success') {
        //this._loggedIn(res);
      } else {
      } */
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
 }
 
 vaultUploader(data,params){
	var options = {
	};
	
	let body = new FormData();
	for (var i = 0; i<=data.length; i++) {
	  body.append('file[]',data[i]);
	}
		
	for (var key in params) {
	  body.append(key,params[key]);
	}
	
	let seq = this.api.post('vault_upload', body, options).share();

    seq.subscribe((res: any) => {
        
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
 }
 
 vaultImageUploader(params){	
	let seq = this.api.post('vault_image_upload', params.value).share();

    seq.subscribe((res: any) => {
        
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
 }
 
 
 removeVaultFiles(params: any) {
    let seq = this.api.post('remove_vault_files', params).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
 
  saveUserRecord(params: any){
	let seq = this.api.post('save_user_records', params).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  saveEmailAddress(params: any){
	let seq = this.api.post('save_email', params).share();
	// don't have the data yet
	seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  savePassword(params: any){
	let seq = this.api.post('save_password', params).share();
	// don't have the data yet
	seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  report(params: any) {
    let seq = this.api.post('report', params).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }
  
  getConversations(params: any){
	console.log(params);
	let messages = [];	
	let seq = this.api.get('get_conversations', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			messages.push(res);
			resolve(messages);
		}, err => {
			console.error('ERROR', err);
		});
	});  
  }
  
  getStories(params: any){
	let stories = [];
	let seq = this.api.get('get_stories', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			stories.push(res);
			resolve(stories);
		}, err => {
			console.error('ERROR', err);
		});
	});  
  }
  
  getMessages(params: any){
	let messages = [];
	let seq = this.api.get('get_messages', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			messages.push(res);
			resolve(messages);
		}, err => {
			console.error('ERROR', err);
		});
	});  
  }
  
  loadMessages(params: any){
	let messages = [];
	let seq = this.api.get('load', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			messages.push(res);
			resolve(messages);
		}, err => {
			console.error('ERROR', err);
		});
	});  
  }
  
  viewMessage(params: any){
	let messages = [];	
	let seq = this.api.get('view_conversation', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			messages = res;
			resolve(messages);
		}, err => {
			console.error('ERROR', err);
		});
	});  
  }
  
  postMessage(params: any){
	let seq = this.api.post('post_message', params).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
    }, err => {
      console.error('ERROR', err);
    });

    return seq; 
  }
  
  deleteConversation(params: any){
		let seq = this.api.post('delete_conversation', params).share();
	
		seq.subscribe((res: any) => {
			// If the API returned a successful response, mark the user as logged in
		}, err => {
			console.error('ERROR', err);
		});

		return seq; 
	}
  
  getStickers(params: any){
	let stickers = [];
	let seq = this.api.get('stickers', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			stickers.push(res);
			resolve(stickers);
		}, err => {
			console.error('ERROR', err);
		});
	});  
  }
  
  getEmojis(params: any){
	let emojis = [];
	let seq = this.api.get('emojis', params).share();
	// don't have the data yet
	return new Promise(resolve => {
		seq.subscribe((res: any) => {
			emojis.push(res);
			resolve(emojis);
		}, err => {
			console.error('ERROR', err);
		});
	});  
  }
  

}
