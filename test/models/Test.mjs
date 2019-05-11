export default function TestModel(app, Types){
	
	app.model('Test',{
		foo: String,
        bar: String
	},{timestamps:true},schema=>{
        schema.pre('save',function(next){
            if(this.isModified('foo')){
                this.bar = this.foo.split('').reverse().join('');
            }
            next();
        })
    });
	
};