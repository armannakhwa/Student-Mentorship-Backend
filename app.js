const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://mayurpawar2401:Mayur@2406@cluster0.xxfi71r.mongodb.net/student-mentorship", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('[STATUS] Connected to Database'))

//create a mongoose schema
const todoitems = new mongoose.Schema({
    email:String,
    title: String,
    content: String,
    mark: String,
    shareWith: [String],
    mobile: String,
    name: String,
});

//creating a models
const todoModel = mongoose.model('todo', todoitems);

const express = require('express');
const app = express();

var cors = require('cors')
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send("hello");
});


//Inserting data into mongodb
app.post('/todo/create', async (req, res) => {
    try {
        console.log(req.body.email)
      const newitem=new todoModel({
        email:req.body.email,
        title:req.body.title,
        content:req.body.content,
        mark:req.body.mark,
        name:req.body.name,
        mobile:req.body.mobile,
      })

      const saveitem=await newitem.save();
      res.status(200).json(saveitem);
    }
    catch (error) {
        res.status(500).json('Failed to insert data' + error);
    }
});



//Deleting data into mongodb
app.delete('/todo/delete/:id', async (req, res) => {
    try {
    
      const deleteitem=await todoModel.findByIdAndDelete(req.params.id)

      res.status(200).json('item deleted successfully');
    }
    catch (error) {
        res.status(500).json('Failed to delete data' + error);
    }
});

//update item for mard as done or not
app.put('/todo/update/:id', async (req, res)=>{
    try{
      console.log("update",req.body,"id->",req.params.id)
      //find the item by its id and update it
      const updateItem = await todoModel.findByIdAndUpdate(req.params.id, {$set:req.body});
      res.status(200).json(updateItem);
   console.log("update",req.body)
    }catch(err){
      console.log(err)
      res.json(err);
    }
  })


  //share items
app.put('/todo/update/:id/sharewith/:email', async (req, res) => {
  try {
    const { id, email } = req.params;
    const updateItem = await todoModel.findOneAndUpdate(
      { _id: id },
      { $addToSet: { shareWith: email } },
      { new: true }
    );

    if (updateItem) {
      res.status(200).json(updateItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item', error: err });
  }
});



//View All data into mongodb
app.get('/todo/alldata/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const alldata = await todoModel.find({ $or: [{ email: email }, { shareWith: email }] });

    res.status(200).json(alldata);
  } catch (error) {
    res.status(500).json('Failed to fetch data: ' + error);
  }
});


// Start the server
app.listen(4000, () => {
    console.log('Server listening on port 4000');
});
