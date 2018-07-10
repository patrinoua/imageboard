const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./sql/database');

const multer = require('multer'); //it's like bodyParser but for many(multi)
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require('./s3'); //check
const config = require('./config.json')


const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
      uidSafe(24).then(function(uid) {
          callback(null, uid + path.extname(file.originalname));
      });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(bodyParser.json());

app.use(express.static('./public'));

app.listen(process.env.PORT || 8080, ()=>{
    console.log("I'm listening...");
})

app.post('/upload', uploader.single('file'), s3.upload, function(req,res){
    if(req.file){
        const imageUrl = config.s3Url+req.file.filename;
        db.addIngToDatabase(req.body.title, req.body.desc, req.body.username, imageUrl)
        .then((result)=>{
            res.json({
                images:result.rows[0],
                success:true
            })
        })
        .catch(err=>{
            console.log("problem with adding to db: ", err);
        });
    }else{
        console.log("boo...");
    }
})

app.post('/comment', function(req,res){
    db.postComment(req.body.comment,req.body.username,req.body.image_id)
    .then(comment=>{
        console.log('added a new comment :',comment.rows);
        db.getComments(req.body.image_id).then(allComments=>{
            res.json({
                comments:allComments.rows
            })
        })
    })
    .catch(err=>{
        console.log('err while posting the comment:',err);
    })
})

app.get('/comments',function(req,res){
    db.getComments(req.body.image_id).then(result=>{
        res.json({
            comments:result.rows
        })
    })
})

app.get('/images',function(req,res){
    db.getImages().then(result=>{
        res.json({
            images:result.rows
        })
    });
})

app.get('/moreImages', function(req,res){
    db.getMoreImages(req.query.lastId).then(result=>{
        res.json({
            images:result.rows
        })
    })
})

app.get('/click/',function(req,res){
    db.clickedOn(req.query.id)
    .then(clickedOn=>{
        db.getComments(req.query.id)
        .then(comments=>{
            var selectedImage={
                id: clickedOn.rows[0].id,
                title: clickedOn.rows[0].title,
                url: clickedOn.rows[0].url,
                username: clickedOn.rows[0].username,
                description: clickedOn.rows[0].description,
                created_at: clickedOn.rows[0].created_at
            }
            res.json({
                selectedImage, existingComments:comments.rows
            })
        })
        .catch(err=>console.log('err on getting comments:',err))
    })
    .catch(err=>console.log('err on clicked on:',err))
})

app.get('/previous/',function(req,res){
    db.getPrevious(req.query.id)
    .then(previous=>{
        db.getComments(req.query.id)
        .then(comments=>{
            var selectedImage={
                id: previous.rows[0].id,
                title: previous.rows[0].title,
                url: previous.rows[0].url,
                username: previous.rows[0].username,
                description: previous.rows[0].description,
                created_at: previous.rows[0].created_at
            }
            res.json({
                selectedImage, existingComments:comments.rows
            })
        })
        .catch(err=>console.log('err on getting comments:',err))
    })
    .catch(err=>console.log('err on clicked on:',err))
})
