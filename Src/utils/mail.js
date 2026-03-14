import {text} from "express";
import Mailgen from "mailgen";//mailgen is used to create beautiful templates
import nodemailer from "nodemailer";//Nodemailer is used to connect to SMTP server and send mail with code.

const sendEmail=async(option)=>{
    const mailGenerator=new Mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagelink.com"
        }
    })


const emailTextual=mailGenerator.generatePlaintext(option.mailgenContent)
const emailHtml=mailGenerator.generate(option.mailgenContent)

const trasporter=nodemailer.createTransport({
    host:process.env.MAILTRAP_SMTP_HOST,
    port:process.env.MAILTRAP_SMTP_PORT,
    auth:{
        user:process.env.MAILTRAP_SMTP_USER,
        pass:process.env.MAILTRAP_SMTP_PASS
    }
})

const mail={
    from:"mail.taskmanager@example.com",
    to:option.email,
    subject:option.subject,
    text:emailTextual,
    html:emailHtml
}

try{
    await trasporter.sendMail(mail)
}catch(error)
{
    console.error("email service failed siliently make sure you have provided proper credentials")
    console.error("Error",error)
}
}

const emailVerficationMailgenContent=(username,verificationurl)=>{
    return{
        body:{
            name:username,
            intro:"Welcome to our App! we are excited to have you",
            action:{
                intro:"welcome to our App! we are excited to have you",
                action:{
                    instruction:"To verify your email please click",
                }
            }
        }
    }
}