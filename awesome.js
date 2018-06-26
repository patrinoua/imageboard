class Rectangle{
    constructor(w,h){
        this.width = w;
        this.height = h;
    }
    getArea(){
        console.log('here is the area...');
        return this.width * this.height;
    }
}


var r = new Rectangle(4,5);

// console.log(type of Rectangle);

class Square extends Rectangle{
    constructor(n, name){
        super(n,n); //whatever you pass in super goes into the constructor of the super constructor!
        this.name=name;
        // console.log(this.width, this.height);
    }
    getArea(){
        console.log("I'm about to give you my area!");
        return super.getArea();
    }
    isSquare(){
        return true;
    }
}

var s = new Square(4,4);

var q = new Square(4, 'Bob');

// console.log(s.getArea());

// console.log(s.constructor);

console.log(q.getArea());
