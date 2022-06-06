// import path from 'path';
var CronJob = require('cron').CronJob;
var fs=require('fs');
var unlink=require('fs').unlink
var icmp = require('icmp')
var nodemailer = require("nodemailer");

async function sendEmail() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'coppercodes@gmail.com',
      pass: '(cztYm8tm8aq3;EZ',
    },
  });

    let info = await transporter.sendMail({
    from: 'akshay.shirwaikar@gmail.com', // sender address
    to: 'akshay.shirwaikar@gmail.com', // list of receivers
    subject: "Ideogram", // Subject line
    text: "Something is wrong. Please check", // plain text body
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

var job1 = new CronJob('0 0 */28 * *', function() {

  // ping to a host
  // icmp.send('139.59.80.152', "Hey, I'm sending a message!")
  //   .then(obj => {
  //       console.log(obj.open ? 'Done' : 'Failed')
  //   })
  //   .catch(err => console.log(err));



  const testFolder = '../coreservice/Logs/';
  const testFiles = testFolder+fs.readdirSync(testFolder);

  const logFiles = testFiles.split(',')

  for(var i=0; i<logFiles.length;i++){
    directoryLength=fs.readdirSync(testFolder).length
    console.log('currentFile',logFiles[i]);
    if(i==0){
      directoryLength>0?removeAFile(logFiles[i]):null
    }else{
      directoryLength>7?removeAFile(testFolder+logFiles[i]):null 
    }
  }
  
}, null, true, 'Asia/Kolkata');

var job2 = new CronJob('* * * * *',()=>{
  icmp.ping('139.59.80.1',2000)
  .then(obj => {console.log(obj.open ? 'Chalta' : sendEmail().catch(console.error))})
  .catch(err=>console.log(err))

}, null, true, 'Asia/Kolkata')

job1.start();
job2.start();


var removeAFile=(path)=>{
 
  unlink(path, (err) => {
    if (err) throw err;
    console.log(`${path} was removed`);
  });


}
