const DB=require("./DB");

module.exports=(opt)=>{
	return (req,res,next)=>{
		req.db=new DB(opt);
		next();
	}
}
