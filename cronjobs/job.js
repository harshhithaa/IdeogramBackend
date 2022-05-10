// import path from 'path';
var CronJob = require('cron').CronJob;
var fs=require('fs');
var unlink=require('fs').unlink

var job = new CronJob('0 0 * * *', function() {

  const testFolder = '../coreservice/Logs/';
  const testFile = testFolder+fs.readdirSync(testFolder)[0];

  

  console.log('currentFile',testFile);

  directoryLength=fs.readdirSync(testFolder).length


directoryLength>7?removeAFile(testFile):null;

  
}, null, true, 'Asia/Kolkata');

job.start();


var removeAFile=(path)=>{
 
  unlink(path, (err) => {
    if (err) throw err;
    console.log(`${path} was removed`);
  });


}
