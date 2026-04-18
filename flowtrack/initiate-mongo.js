const { MongoClient } = require("mongodb");

async function run() {
  const client = new MongoClient("mongodb://localhost:27017/?directConnection=true");
  try {
    console.log("Connecting to MongoDB locally...");
    await client.connect();
    const admin = client.db("admin");
    console.log("Attempting to initiate Replica Set rs0...");
    const res = await admin.command({ 
      replSetInitiate: { 
        _id: "rs0", 
        members: [{ _id: 0, host: "localhost:27017" }] 
      } 
    });
    console.log("Success! Your Replica Set is now running.", res);
  } catch(e) {
    if (e.message && e.message.includes("already initialized")) {
      console.log("Success! Your local Replica Set is already initialized and running.");
    } else {
      console.error("Failed:", e.message);
    }
  } finally {
    await client.close();
  }
}
run();
