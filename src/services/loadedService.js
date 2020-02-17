import { sendRawData } from "../store/server";
import _ from 'lodash';
import { setServerUrl } from "../store/server";
import store from "../store/createStore"

class LoadedService {

  /**
   * 
   */
  constructor (addr,signin) {
    this.loaded = this.signin == null;
    this.address = "http://"+addr;
    this.signin = signin;
    this.loop = this.signin != null ? setInterval(()=>{this.checkLoaded();},500) : null;
  }

checkLoaded = () =>{
  let me2 = this;

  fetch(this.address).then(function(){
      me2.loaded = true;
      store.dispatch(setServerUrl(me2.address))
      console.log("ok");
      console.log(me2.signin);
      if(me2.signin) me2.signin();
      clearInterval(me2.loop);
      console.log("clear interval");
  })
  .catch(function(e){
      console.log("error",e);

  })
}



}
  export default LoadedService
