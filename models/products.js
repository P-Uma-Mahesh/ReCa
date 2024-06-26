const { required } = require('joi');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type:String,
        required:true,
    },
   description: String,
   image:{
    type:String,
    set:(v)=>v===""?"https://unsplash.com/photos/a-couple-of-people-standing-on-top-of-a-beach-near-the-ocean-wdL3uLZMd5U":v,
   },
   price:{
    type:Number,
    required:true,
    minValue:0,
  },
  category:String,
  branch:String,
    available: {
    type: Boolean,
    default: true,
  },
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;

{/* <div class="card-body">
    <form action="/Data" method="post">
    <label for="titulo">Titulo:</label>
    <input type="text" name="titulo" id="titulo"class="form-control">

    <label for="descricao">Descrição:</label> 
    <input type="text" name="descricao" max="20" id="descricao"class="form-control">

    <label for="image">imagem:</label>
    <input type="file" name="image" id="image" class="form-control" accept="image/png,image/gif,image/jpg,image/jpeg">

    <label for="comentario">Texto:</label>
    <div class="form-floating">
         <textarea class="form-control" placeholder="Leave a comment here" id="comentario" name="comentario" style="height: 150px"></textarea>
         <label>Comments</label>
    </div>

    <button type="submit" class="btn btn-success mt-2">Cadastra postagem</button>
    </form>
    </div>
</div>

app.post("/Data",(req,res)=>{

const novaPostagem = {
    titulo:req.body.titulo,
    descricao:req.body.descricao,
    comentario:req.body.comentario,
    image:req.body.image
}

new Postagens(novaPostagem).save().then(()=>{
    console.log("salva com sucesso!!!")
}).catch((err)=>{
    console.log("erro ao salva:"+err)
})
}) */}
