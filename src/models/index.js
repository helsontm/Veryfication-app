const Users=require("./Users");
const EmailCode=require("./EmailCode")

EmailCode.belongsTo(Users);
Users.hasOne(EmailCode);