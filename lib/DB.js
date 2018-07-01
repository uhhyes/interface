const MongoClient=require("Mongodb").MongoClient;
const url="mongodb://localhost:27017";

class DB{
	constructor(dbname){
		this.dbname=dbname;
	}
	collection(table){
		this.table=table;
		let obj={
			find:(where={},callback=function(){})=>{
				if(typeof callback != "function"){
					try{
						throw new Error("callback is not a fucntion");
					}catch(e){
						console.log(e)
					}
				}
				MongoClient.connect(url,(err,client)=>{
					if(err) throw err;
					let db=client.db(this.dbname);
					 db.collection(this.table).find(where).toArray(function(){
					 	callback(...arguments);
					 	client.close();
					 })
				})
			},
			
			update:(where={},data={},opt={},callback=function(){})=>{
				if(arguments.length==3){
					callback=opt;
					opt={};
				}
				if(typeof callback != "function"){
					try{
						throw new Error("callback is not a fucntion");
					}catch(e){
						console.log(e)
					}
				}
				MongoClient.connect(url,(err,client)=>{
					if(err) throw err;
					let db=client.db(this.dbname);
					db.collection(this.table).update(where,{$set:data},opt,function(){
						callback(...arguments);
						client.close();
					})
				})
			},
			
			insert:(data={},callback=function(){})=>{
				if(typeof callback != "function"){
					try{
						throw new Error("callback is not a fucntion");
					}catch(e){
						console.log(e)
					}
				} 
				if(Array.isArray(data)){
					MongoClient.connect(url,(err,client)=>{
						if(err) throw err;
						let db=client.db(this.dbname);
						db.collection(this.table).insertMany(data,function(){
							callback(...arguments);
							client.close();
						});
					})
					return ;
				}
				MongoClient.connect(url,(err,client)=>{
					if(err) throw err;
					let db=client.db(this.dbname);
					db.collection(this.table).insert(data,function(){
						callback(...arguments);
						client.close();
					});
				})
			},
			
			remove:(where={},callback=function(){})=>{
				if(typeof callback != "function"){
					try{
						throw new Error("callback is not a fucntion");
					}catch(e){
						console.log(e)
					}
				}
				MongoClient.connect(url,(err,client)=>{
					if(err) throw err;
					let db=client.db(this.dbname);
					db.collection(this.table).remove(where,function(){
						callback(...arguments);
					})
				})
			}
		}
		return obj;
	}
}
 module.exports=DB;                                          