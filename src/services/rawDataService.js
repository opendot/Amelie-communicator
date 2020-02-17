import { sendRawData } from "../store/server";
import _ from 'lodash';

class RawDataService {

  /**
   * 
   */
  constructor (l,sendData) {
    this.data_array=[];
    this.limit = l;
    this.sendRawData = sendData;
  }


addData = (datum, session_id) => {
  this.data_array.push(datum);
  this.checkSize(session_id);
}

addBulkData = (data) => {
  sendRawData(data,session_id);
}

checkSize = (session_id) => {
 // console.log("checking size");
  if(this.data_array.length>=this.limit) {
    let sendData = _.cloneDeep(this.data_array);
    this.data_array=[];
    setTimeout(()=>{
      //console.log("sending data");
      this.sendRawData(sendData,session_id);  
    })
  }
}



}
  export default RawDataService