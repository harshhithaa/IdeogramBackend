// import path from 'path';
var CronJob = require('cron').CronJob;
var fs=require('fs');
var unlink=require('fs').unlink
var icmp = require('icmp')
var nodemailer = require("nodemailer");

async function main() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'akshay.shirwaikar@gmail.com', // generated ethereal user
      pass: 'vxxtgamwhozzddqg', // generated ethereal password
    },
  });

    let info = await transporter.sendMail({
    from: 'akshay.shirwaikar@gmail.com', // sender address
    to: "coppercodes@gmail.com", // list of receivers
    subject: "Hello", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
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
  icmp.ping('134.209.154.152',500)
  .then(obj => {console.log(obj.open ? 'Chalta' : 'Failed')})
  .catch(err=>console.log(err))

})

job1.start();
job2.start();


var removeAFile=(path)=>{
 
  unlink(path, (err) => {
    if (err) throw err;
    console.log(`${path} was removed`);
  });


}
