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

app.listen(8080, ()=>{
    console.log("I'm listening...");
})

app.post('/upload', uploader.single('file'), s3.upload, function(req,res){
    if(req.file){
        const imageUrl = config.s3Url+req.file.filename;
        db.addIngToDatabase(req.body.title, req.body.desc, req.body.username, imageUrl)
        .then((result)=>{
            console.log("added to db: ", result.rows[0]);
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
    console.log('submitting comment... server side');
    console.log('req.body',req.body);
    db.postComment(req.body.comment,req.body.username,req.body.image_id)
    .then(comment=>{
        console.log('added a new comment :',comment.rows);
        db.getComments(req.body.image_id).then(allComments=>{
            // console.log('now getting the list of all the comments:',allComments.rows);
            res.json({
                comments:allComments.rows
            })
        })
        // res.json({
        //     comment:comment.rows[0]
        // })
    })
    .catch(err=>{
        console.log('err while posting the comment:',err);
    })
})

app.get('/comments',function(req,res){
    console.log('get comments... ^_^ ');
    console.log("req.body:",req.body);
    // console.log("*** req.body.image_id:",req.body.image_id);
    db.getComments(req.body.image_id).then(result=>{
        // console.log("comment result (index.js):", result.rows);
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
    // console.log("click on.. req.query.id", req.query);
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

    // console.log(req);
})