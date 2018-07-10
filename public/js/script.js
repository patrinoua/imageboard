

(function(){

    Vue.component('image-modal', {
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
        props:['id'],
        methods:{
            submitComment:function(){
                var component=this;
                var newComment={
                    image_id:component.id,
                    comment:component.comment,
                    username:component.commentusername
                }
                axios.post('/comment', newComment)
                .then(function(response){
                    component.comments = response.data.comments
                    }
                ).catch(err=>{console.log('problem when submitting comment');})
            },
            getImageById: function(id){
                axios.get('/click/?id='+this.id)
            },
            leftArrowFunction: function(id){
                console.log('you clicked on the left arrow',this.id);
                axios.get('/previous/?id='+this.id)
                .then(result=>{
                    console.log('lala',result.data.selectedImage);
                    this.$emit("id")
                })
            },
            close: function(){
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
                    app.currentImageId = location.hash.slice(1);
                    console.log("app.currentImageId:", app.currentImageId);
                });
                axios.get('/images').then(function(response){
                    app.images=response.data.images;
                    if(response.data.success){
                        app.images=response.data.images;
                    }
                });
            },
            methods:{
                getFile: function(e){
                    this.fileToUpload.file = e.target.files[0];
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
                        if(response.data.success){
                            app.images.unshift(response.data.images);
                        }
                    });
                },
                closeFunction: function(){
                    this.currentImageId=null;
                    location.hash=''
                },
                clicked: function(id){
                    this.currentImageId=id;
                },
                moreButton: function(id){
                    var app = this;
                    var lastId = this.images[this.images.length-1].id;
                    axios.get('/moreImages?lastId='+lastId).then(function(response){
                        response.data.images.forEach(function(image){
                            app.images.push(image);
                        })
                    })
                }
            }
        }
    )

})();
