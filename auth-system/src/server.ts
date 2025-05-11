import app from "./app";
import dotenv from "dotenv";

dotenv.config();

// listen to port
const PORT = process.env.PORT || 5009;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
