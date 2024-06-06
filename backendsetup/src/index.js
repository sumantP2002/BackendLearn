import connectDB from './db/db.js'
import 'dotenv/config';


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at PORT: ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection failed!", err)
})