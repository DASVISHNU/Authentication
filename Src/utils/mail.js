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

const emailVerificationMailgenContent=(username,verificationUrl)=>{
    return{
        body:{
            name:username,
            intro:"Welcome to our App! we are excited to have you on board.",
            action:{
                instructions:
                "To verify your email please click on the following button",
                button:{
                    color:"#22BC66",
                    text:"verify your email",
                    link:verificationUrl,
                },
            },
            outro:
            "Need help,or have questions? just reply to this email,we'd love to help"
        }
    };
};


const forgotPasswordMailgenContent=(username,passwordResetUrl)=>{
    return{
        body:{
            name:username,
            intro:"we got a request to rest the password of your account",
            action:{
                instructions:
                "TO reset your password click on the following button or link",
                button:{
                    color:"#22BC66",
                    text:"Reset password",
                    link:passwordResetUrl,
                },
            },
            outro:
            "Need help,or have questions?just reply to this email,we'd love to help"
        }
    }
};

export{
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}