var express = require('express');
var router  = express.Router();
var orm     = require('orm');
'use strict';
const nodemailer = require('nodemailer');

router.use(orm.express("mysql://root:@localhost:/dbsubscribers", {

  define: function (db, models, next) {

    models.subscribers = db.define("subscribers", {

    id         : Number,

    first_name : String,

    last_name  : String,

    email      : String,

  });
  next();
  }

}));

  router.get('/', function(req, res, next) {
   
   var result = req.models.subscribers.find({

   }, function(error, subscribers){

            if(error) throw error;

            res.render('index', { subscribers:subscribers, title: 'NodeJS Send Email Tutorial' });

        });
    }).post('/send_email', function(req, res, next) {
        var email     = req.body.email;
        var subject   = req.body.subject;
        var emailbody = req.body.body;
        if(!email || !subject || !emailbody){

            res.json({code: 2});

        }else{
            req.models.subscribers.find({ email: email }, function (err, subscriber) {
               
                if(err) throw err;

                if(subscriber.length){
                    //send email here
                    console.log("First person: %s, age %s", subscriber[0].first_name, subscriber[0].last_name);
                    nodemailer.createTestAccount((err, account) => {

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.ethereal.email',
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: account.user, // generated ethereal user
                            pass: account.pass  // generated ethereal password
                        }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: '"Info" <info@example.com>', // sender address
                        to: email, // list of receivers
                        subject: subject, // Subject line
                        text: emailbody, // plain text body
                        html: emailbody // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        res.json({code:1, messageId: info.messageId, messageURL: nodemailer.getTestMessageUrl(info)});
                    });
                }); 
                
                }else{
                 
                 res.json({code: 3});
                }
            });
        }
    });

module.exports = router;