

(function(){

    Vue.component('image-modal', {
    /* data, methods, etc. go here */
        data: function(){
            return {
                title: '',
                url:'',
                username:'',
                description:'',
                created_at:'',
                commentToUpload:'',
                comment:'',
                comments:[],
                commentusername:''
            }
        },
        props:['id'], //things i receive from the tag
        methods:{
            submitComment:function(){
                var component=this;
                var newComment={
                    image_id:component.id,
                    comment:component.comment,
                    username:component.commentusername
                }
                console.log("newComment:",newComment);

                axios.post('/comment', newComment)
                .then(function(response){
                    console.log("lala response.data.comments",response.data.comments);
                    component.comments = response.data.comments
                    // component.comments.unshift(response.data.comment);
                    }
                ).catch(err=>{console.log('problem when submitting comment');})
            },
            getImageById: function(id){
                // console.log('getting img id:',id);
                // console.log(location.href)
                console.log("this.id",this.id);
                axios.get('/click/?id='+this.id)

                // axios.get('/image/#'+this.id)
            },
            close: function(){
                console.log('closing!');

                this.$emit("close");
            }
        },
        watch:{
            id: function(){    //this will run everytime id changes
                this.getImageById();
            }
        },
        mounted: function(){
            var component=this;
            window.addEventListener('keyup', function(e){
                if(e.keyCode == 27){
                    component.close();
                }
            })

            this.getImageById();

            axios.get('/click', {params:{id : this.id}})
            .then(function(response){
                component.title = response.data.selectedImage.title;
                component.url = response.data.selectedImage.url
                component.username = response.data.selectedImage.username
                component.description = response.data.selectedImage.description
                component.created_at = response.data.selectedImage.created_at

                component.comments = response.data.existingComments

            })
        },
        template: "#image-modal"
    });

    var mainVue = new Vue(
        {
            el:'#main',
            data:{
                images:[],
                fileToUpload:{},
                currentImageId:location.hash.slice(1)||''
            },
            mounted: function(){
                var app=this;

                window.addEventListener('hashchange',function(){
                    console.log("app.currentImageId:", app.currentImageId);
                    app.currentImageId = location.hash.slice(1);
                    console.log("app.currentImageId:", app.currentImageId);
                });

                axios.get('/images').then(function(response){
                    app.images=response.data.images;
                    if(response.data.success){
                        app.images=response.data.images;
                    }

                    // this.getImageById();
                });
            },
            methods:{
                getFile: function(e){
                    this.fileToUpload.file = e.target.files[0];
                    console.log("this.fileToUpload: ",this.fileToUpload);
                },
                upload: function(){
                    var formData = new FormData();
                    var app=this;
                    formData.append('file',this.fileToUpload.file);
                    formData.append('title',this.fileToUpload.title);
                    formData.append('desc',this.fileToUpload.desc);
                    formData.append('username',this.fileToUpload.username);
                    axios.post('/upload', formData)
                    .then(function(response){
                        console.log("response: ",response);
                        if(response.data.success){
                            app.images.unshift(response.data.images);
                        }
                    });
                },
                closeFunction: function(){
                    console.log("inside closeFunction");
                    this.currentImageId=null;
                    location.hash=''
                    console.log("location.hash",location.hash);

                },
                clicked: function(id){
                    this.currentImageId=id;
                    // console.log('clicked on picture with id:',this.currentImageId);
                    // console.log("now we want to get the comments for this pic!");
                },
                moreButton: function(id){
                    console.log("clicked on moreButton");
                    console.log("this.images",this.images);
                    console.log("images length",this.images[this.images.length-1].id);
                    var app = this;
                    // console.log("is this the last id??",this.images[length-1].id);
                    var lastId = this.images[this.images.length-1].id;
                    axios.get('/moreImages?lastId='+lastId).then(function(response){
                        console.log('the existing...', app.images);
                        console.log('got more imagesssss???',response.data.images);
                        response.data.images.forEach(function(image){
                            app.images.push(image);
                        })
                        console.log('looooooooggg <3',app.images);
                    })
                }
            }
        }
    )

})();
