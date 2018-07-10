console.log('database loaded');
var spicedPg = require('../node_modules/spiced-pg');

var db;
if(process.env.DATABASE_URL){
    db = spicedPg(process.env.DATABASE_URL);
}else {
    db = spicedPg('postgres:funky:chicken@localhost:5432/imageboard');
}

exports.getImages = ()=>{
    return db.query('SELECT * FROM images ORDER BY id DESC LIMIT 6');
}
exports.getMoreImages = (id)=>{
    return db.query('SELECT * FROM images WHERE id<$1 ORDER BY id DESC LIMIT 6',[id]);
}
exports.addIngToDatabase=(title,desc,username,url)=>{
    return db.query(`INSERT into images (title, description, username, url)
                     VALUES ($1,$2,$3,$4)
                     RETURNING *
                        `,[title,desc,username,url]);
}

exports.getComments=(image_id)=>{
    return db.query('SELECT * FROM comments WHERE image_id=$1 ORDER BY id DESC',[image_id])
}

exports.clickedOn=(id)=>{
    return db.query(`SELECT * FROM images WHERE id=$1`,[id])
}
exports.getPrevious=(id)=>{
    return db.query(`SELECT * FROM images WHERE id = (select max(id) from images where id < $1)`,[id])
}
exports.postComment=(comment, username, image_id)=>{
    return db.query(`INSERT into comments (comment, username, image_id)
                     VALUES ($1,$2,$3)
                     RETURNING *
                        `,[comment, username, image_id]);
}
