const catchError = require('../utils/catchError');
const Users = require('../models/Users');
const bcrypt = require('bcrypt');
const sendEmail=require("../utils/sendEmail")
const EmailCode=require("../models/EmailCode")
const jwt = require('jsonwebtoken');


const getAll = catchError(async(req, res) => {
    const results = await Users.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const {firstName, lastName, email, image, country ,password, frontBaseUrl}=req.body
    const hashedPassword = await bcrypt.hash(password, 10); // salt
    const result = await Users.create({
        firstName, 
        lastName,
         email, 
         image,
          country,
        password:hashedPassword});

        const code=require('crypto').randomBytes(32).toString('hex');
        const link=`${frontBaseUrl}/auth/verify_email/${code}`

       await EmailCode.create({
          code,
          userId: result.id
       });

        await sendEmail({
            to: email, // Email del receptor
            subject: "Este es el asunto del correo", // asunto
            html: ` 
                    <div>
                            <h1>Wohoo, ${firstName} ${lastName}</h1>
                            <b>Thanks for sign up in user app</b><br>
                            <a href="${link}">${link}</a>
                    </div>
            ` // con backtics ``
    });

    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Users.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await Users.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Users.update(
       delete  req.body.password,
       delete  req.body.email,
       delete  req.body.isVerified,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);

});

const verifyEmail= catchError(async(req, res) => {
    const {code}=req.params;
   const emailCode= await EmailCode.findOne({where:{code}})
   if(!emailCode) return res.status(401).json({message:"Invalid code"});
   const user= await Users.update(
    {isVerified:true},
    {where:{ id: emailCode.userId}, returning:true});
    await emailCode.destroy()
     return res.json(user)
   });

   const login = catchError(async(req, res) => {
    const { email, password } = req.body;
const user = await Users.findOne({ where: {email} });
if(!user) return res.status(401).json({ error: "invalid credentials" });
if(!user.isVerified) return res.status(401).json({ error: "is necesary the user must be veryfied" });

const isValid = await bcrypt.compare(password, user.password);
if(!isValid) return res.status(401).json({ message: "invalid credentials" });

    const token = jwt.sign(
            {user},
            process.env.TOKEN_SECRET,
             { expiresIn: "1d" },
    );

    return res.json({user, token});
});

const getLoggerUsers= catchError(async(req,res)=>{
    const user=req.user
    return res.json(user)
})

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyEmail,
    login,
    getLoggerUsers
}