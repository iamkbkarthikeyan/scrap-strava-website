const puppeteer = require("puppeteer");
const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "ACCESS-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept"
  );
  next();
});

async function getAutoData(profile_id) {
  // const browser = await puppeteer.launch();

  // For Heroku Deployment
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  })

  const page = await browser.newPage();
  await page.goto("https://www.strava.com/activities/" + profile_id);

  result = await page.evaluate(() => {
    var dataSet = [];
    var activityData = document.getElementsByClassName("Stat--stat-value--3bMEZ");
    var imgTag = document.getElementsByTagName("img");
    var timeTag = document.getElementsByTagName("time");
    var headingOneTag = document.getElementsByTagName("h1");
    var titleTag = document.getElementsByTagName("title");
    var headingThreeTag = document.getElementsByTagName("h3");
    var spanTag = document.getElementsByTagName("span");
    var liTag = document.getElementsByTagName("li");

    var distance = activityData[3].innerText;
    var time = activityData[4].innerText;
    var elevation = activityData[5].innerText;
    var calories = activityData[6].innerText;
    var profile_picture = imgTag[1].src;
    var type = spanTag[8].innerText;
    var activityDate = timeTag[0].innerText;
    var activityName = headingOneTag[0].innerText;
    var activityTitle = titleTag[0].innerText;
    var atheleteName = headingThreeTag[0].innerText;
    var location = spanTag[2].innerText;
    var like = liTag[8].innerText;
    var comment = liTag[9].innerText;
    var achievement = liTag[10].innerText;


    var jsonData = {
      title: activityTitle,
      activity_name: activityName,
      athelete_name: atheleteName,
      location: location,
      activity_date: activityDate,
      activity_type: type,
      profile_picture: profile_picture,
      distance: distance,
      time: time,
      elevation: elevation,
      calories: calories,
      like: like,
      comment: comment,
      achievement: achievement,
    };
    dataSet.push(jsonData);

    // console.log(dataSet);
    return dataSet;
  });
  browser.close();
  return await result;
}

app.get("/getActivityData", function (req, res) {
  var id = req.query.id;
  if(id){
    getAutoData(id).then(function (leaderboard_data) {
      res.json({ status: "true", data: leaderboard_data });
    }, errHandler);
  }else{
    return res.send({ status: "false", message: "Invalid Activity ID" });
  }
  
});

var errHandler = function (err) {
  console.log(err);
};

// # Get * 404 => 200 : API RESPONSE : UNAUTHORIZED ACCESS
app.all("/*", (req, res) => {
  return res
    .status(200)
    .send({ status: "false", message: "You're not authorized!" });
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log(`Node app is running on port ${port}`);
});
