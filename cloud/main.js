Parse.Cloud.job("updatePurchases", async(request) => {
    let date = new Date();

    const purchaseClass = Parse.Object.extend("Purchase");

    const query = new Parse.Query("Listing");
    query.equalTo("isSold", false);
    query.lessThanOrEqualTo("expiresAt", date);
    query.include("mostRecentBid");
    query.include("user");
    query.include("mostRecentBid.user");
    query.include("mostRecentBid.user.newPurchases");
    const results = await query.find();
  
    for (let i = 0; i < results.length; i++) {
      let listing = results[i];
      let bid = listing.get("mostRecentBid");
      let seller = listing.get("user");
      let purchase = new purchaseClass();
      purchase.set("listing", listing);
      purchase.set("finalBid", bid);
      purchase.set("seller", seller);
      purchase.set("seenBySeller", false);
      listing.set("isSold", true);
      if (bid != null){
          let buyer = bid.get("user");
          purchase.set("buyer", buyer);
          purchase.set("seenByBuyer", false);
      }
      try{
        await purchase.save();
        console.log("Purchase saved");
      } catch (e){
        console.log(`Error while trying to save ${purchase.id}. Message: ${e.message}`);
      }
      try{
        await listing.save();
        console.log("Listing saved");
      } catch (e){
        console.log(`Error while trying to save ${listing.id}. Message: ${e.message}`);
      }
    }
  
    console.log("Successfully updated " + results.length + " objects to purchases");
    return ("Successfully updated " + results.length + " objects to purchases");
  });